import bcrypt from 'bcrypt';
import db from '$lib/utils/db.js';
import { Users } from '$lib/utils/arango.js';
import errorHandler from '$lib/utils/errorHandler.js';
import { fail, redirect } from '@sveltejs/kit';
import { validateUser } from '$lib/utils/validator.js'
import { sendAccountDeletedMail } from '$lib/utils/emailer.js';

export async function load({ locals }) {
    try {
        const profileInfo = await db.users.findFirst({
            where: { id: locals.user.sub },
            select: {
                username: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNum: true,
            },
        });

        ////arango

        const arangoUser = await Users.document(locals.user.sub);

        ////arango

        return {
            profileInfo: {
                username: arangoUser.username,
                firstName: arangoUser.firstName,
                lastName: arangoUser.lastName,
                email: arangoUser.email,
                phoneNum: arangoUser.phoneNum,
            }
        };
    } catch (error) {
        console.error('Failed to get profile info:', error);

        return errorHandler(error, undefined, {
            fatal: true
        });
    }
}

export const actions = {
    updateProfile: async ({ request, locals }) => {
        try {
            let data = Object.fromEntries(await request.formData());
            const validationFields = ['username', 'firstName', 'lastName', 'email', 'phoneNum'];

            if(data.password) {
                validationFields.push('oldPassword', 'password');
            }

            const validationResult = validateUser(data, validationFields, 'updateProfileForm');

            if(validationResult.status === 400) {
                return validationResult;
            }
            data = validationResult;

            const user = await db.users.findFirst({
                where: { id: locals.user.sub },
            });

            if(data.oldPassword && !(await bcrypt.compare(data.oldPassword, user.password))) {
                return fail(400, {
                    updateProfileForm: {
                        error: { message: 'Old password incorrect' },
                    }
                });
            }

            delete data.oldPassword;

            const newData = await db.users.update({
                where: { id: user.id },
                data,
            });

            ////arango

            await Users.update({ _key: newData.id }, newData);

            ////arango

            const profileInfo = {
                username: newData.username,
                firstName: newData.firstName,
                lastName: newData.lastName,
                email: newData.email,
                phoneNum: newData.phoneNum,
            }

            return { profileInfo };
        } catch (error) {
            console.error('Failed to update profile:', error);

            return errorHandler(error, 'updateProfileForm');
        }
    },
    deleteAccount: async ({ request, locals, cookies }) => {
        try {
            let data = Object.fromEntries(await request.formData());
            const validationResult = validateUser(data, ['password'], 'deleteAccountForm');

            if(validationResult.status === 400) {
                return validationResult;
            }
            data = validationResult;

            const user = await db.users.deleteAccount(locals.user.sub, data.password);

            ////arango

            await Users.remove({ _key: user.id });

            ////arango

            await sendAccountDeletedMail(user);
        } catch (error) {
            console.error('Failed to delete account:', error);

            return errorHandler(error, 'deleteAccountForm');
        }

        cookies.delete('access_token', { path: '/' });
        locals.user = null;

        return redirect(303, '/login');
    },
}

import db from '$lib/utils/db.js';
import { Users } from '$lib/utils/arango.js';
import { validateUser } from '$lib/utils/validator.js'
import { sendVerificationMail } from '$lib/utils/emailer.js';
import errorHandler from '$lib/utils/errorHandler.js';

export const actions = {
    default: async ({ request, url }) => {
        try {
            let data = Object.fromEntries(await request.formData());
            const validationResult = validateUser(data);

            if(validationResult.status === 400) {
                return validationResult;
            }
            data = validationResult;

            const { user, verificationCode } = await db.users.signup(data);

            ////arango

            await Users.save({
                ...user,
                _key: user.id,
            });

            ////arango

            await sendVerificationMail(user, verificationCode, url.origin);

            throw { status: 303, location: '/login' };
        } catch (error) {
            return errorHandler(error, undefined, { logMessage: 'Failed to signup' });
        }
    },
}

import { fail } from '@sveltejs/kit';

const fieldRequiredMessage = (fieldLabel) => `${fieldLabel} is required!`;
const fieldInvalidMessage = (fieldLabel) => `${fieldLabel} is invalid!`;

export const userFieldsLookup = {
    username: {
        label: 'Username',
        regex: '^[a-zA-Z0-9]{3,20}$',
    },
    firstName: {
        label: 'First name',
        regex: '^[a-zA-Z]{1,30}$',
    },
    lastName: {
        label: 'Last name',
        regex: '^[a-zA-Z]{1,30}$',
    },
    email: {
        label: 'Email',
        regex: '^[^@]+@[^@]+\\.[^@]+$',
    },
    password: {
        label: 'Password',
        regex: '^[^ ]{1,50}$',
    },
    oldPassword: {
        label: 'Old password',
        regex: '^[^ ]{1,50}$',
    },
    phoneNum: {
        label: 'Phone number',
        regex: '^[0-9]{8}$',
    },
};

export function validateUser(
    data,
    fields = ['username', 'firstName', 'lastName', 'email', 'password', 'phoneNum'],
    formId,
) {
    return baseValidator(data, fields, formId);
}

export const propertyFieldsLookup = {
    name: {
        label: 'Name',
        regex: '^[a-zA-Z0-9 ]{3,30}$',
    },
    place: {
        label: 'Location',
        regex: '^[a-zA-Z0-9 ]{3,100}$',
    },
    lon: {
        label: 'Longitude',
        regex: '^-?[0-9]+(\\.?[0-9]+)?$',
    },
    lat: {
        label: 'Latitude',
        regex: '^-?[0-9]+(\\.?[0-9]+)?$',
    },
    pricePerNight: {
        label: 'Price per night',
        regex: '^[0-9]+(\\.?[0-9]+)?$',
    },
    images: {
        label: 'Images',
    },
};

export function validateProperty(
    data,
    fields = ['name', 'place', 'lon', 'lat', 'pricePerNight', 'images'],
    formId,
) {
    return baseValidator(data, fields, formId);
}

function baseValidator(data, fields, formId) {
    const errors = {};

    for (const field of fields) {
        if(data[field] === undefined || data[field] === '' || data[field]?.length === 0) {
            errors[field] = fieldRequiredMessage(propertyFieldsLookup[field].label);
        }
        else if(field === 'images') {
            errors[field] = validateImages(data[field]);
        }
        else if(!(new RegExp(propertyFieldsLookup[field].regex)).test(data[field])) {
            errors[field] = fieldInvalidMessage(propertyFieldsLookup[field].label);
        }
    }

    if(Object.values(errors).filter(Boolean).length) {
        if(formId) {
            return fail(400, { [formId]: { errors } });
        }

        return fail(400, { errors });
    }

    //only return fields that have been validated
    return Object.fromEntries(
        Object.entries(data).filter(([ key ]) => {
            return fields.includes(key);
        })
    );
}

function validateImages(images) {
    if(!Array.isArray(images)) {
        return 'Invalid image list';
    }

    for (const image of images) {
        if(!(image instanceof File)) {
            return 'Invald image file(s)';
        }
        if(image.size > 1000000) {
            return 'Image size too big, must be under 1 megabyte';
        }
        if(!/^image\/(avif|jpeg|png|webp)$/.test(image.type)) {
            return 'Incorrect image format (accepted formats: .avif, .jpg, .jpeg, .png, .webp)';
        }
    }
}

const Joi = require('joi');

const userValidation = function(data) {
    const schema = Joi.object().keys({
        name: Joi.string().required(),
        age: Joi.number().required(),
        sex: Joi.string()
    });
    return schema.validate(data);
};

module.exports.userValidation = userValidation;
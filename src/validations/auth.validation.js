const Joi = require("joi");
const { password } = require("./custom.validation");

/**
 * Check request *body* for fields (all are *required*)
 * - "email" : string and satisyfing email structure
 * - "password": string and satisifes the custom password structure defined in "src/validations/custom.validation.js"
 * - "name": string
 */

// const register = {
//   params: Joi.object().keys({
//   name : Joi.string().min(5).max(50).required(),
//   email : Joi.string().min(5).max(50).required().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'in'] } }),
//   password : Joi.string().min(8).max(50).custom(password).required(), 
//   }),
// };
const register = {
  body:Joi.object().keys({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(50).required().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'in'] } }),
    password: Joi.string().custom(password).required(),
  }),};


/**
 * Check request *body* for fields (all are *required*)
 * - "email" : string and satisyfing email structure
 * - "password": string and satisifes the custom password structure defined in "src/validations/custom.validation.js"
 */

const login = {
  body:Joi.object().keys({
    email: Joi.string().min(5).max(50).required().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'in'] } }),
    password: Joi.string().custom(password).required(),
  }),};


module.exports = {
  register,
  login,
};

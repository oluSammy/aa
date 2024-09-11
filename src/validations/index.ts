import Joi from "joi";

export const signupSchema = (signupData: Record<string, string>) => {
  const schema = Joi.object({
    firstName: Joi.string().alphanum().min(3).max(30).required(),
    lastName: Joi.string().required().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
    email: Joi.string().required().email(),
    password: Joi.string().required().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).min(8).max(12),
  });

  return schema.validate(signupData);
};

export const loginSchema = (loginData: Record<string, string>) => {
  const schema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  });

  return schema.validate(loginData);
};


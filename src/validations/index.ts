import Joi from "joi";

const pinValidation = Joi.string()
  .length(4)
  .pattern(/^[0-9]+$/)
  .messages({ "string.pattern.base": `pin must have 4 digits.` })
  .required();

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

export const walletPinSchema = (data: Record<string, string>) => {
  const schema = Joi.object({
    pin: pinValidation,
  });

  return schema.validate(data);
};

export const fundWalletSchema = (data: Record<string, string>) => {
  const schema = Joi.object({
    pin: pinValidation,
    amount: Joi.number().min(1).required(),
  });

  return schema.validate(data);
};

export const createWalletSchema = (data: Record<string, string>) => {
  const schema = Joi.object({
    pin: pinValidation,
  });

  return schema.validate(data);
};

export const donationSchema = (data: Record<string, string>) => {
  const schema = Joi.object({
    toWalletId: Joi.number().required(),
    amount: Joi.number().min(1).required(),
    pin: pinValidation,
    note: Joi.string().required(),
  });

  return schema.validate(data);
};

import bcrypt from "bcrypt";

export const verifyPin = (userPin: string, dbPin: string) => {
  return bcrypt.compareSync(userPin, dbPin);
};

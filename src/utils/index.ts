import bcrypt from "bcryptjs";

export const verifyPin = (userPin: string, dbPin: string) => {
  return bcrypt.compareSync(userPin, dbPin);
};

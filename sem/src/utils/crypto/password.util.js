import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export const hashPassword = async (password) => {
  // TODO: hash password using bcrypt
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password, hash) => {
  // TODO: compare password with stored hash
  return bcrypt.compare(password, hash);
};
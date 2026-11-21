import bcrypt from "bcrypt";

const SALT_ROUND = 12;

export async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUND);
}

export async function verifyPassword(password, hashPassword) {
  return await bcrypt.compare(password, hashPassword);
}

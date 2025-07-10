import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET as jwt.Secret;
if (!secret) {
  throw new Error("JWT_SECRET is not defined. Add it to your environment variables.");
}

export function signJwt(payload: object, expiresIn = "1h") {
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

export function verifyJwt<T = any>(token: string): T {
  return jwt.verify(token, secret) as T;
}
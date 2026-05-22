import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode("FUNZONA_SECRET_KEY");

export async function createToken(data: any) {
  return await new SignJWT(data)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret);

  return payload;
}
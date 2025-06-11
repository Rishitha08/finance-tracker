import * as jose from 'jose'
import bcrypt from 'bcryptjs'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key')

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function signToken(payload: any): Promise<string> {
  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
  
  return jwt
}

export async function verifyToken(token: string): Promise<any> {
  try {
    const { payload } = await jose.jwtVerify(token, secret)
    return payload
  } catch (error) {
    throw new Error('Invalid token')
  }
}

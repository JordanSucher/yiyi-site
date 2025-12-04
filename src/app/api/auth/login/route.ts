import { NextResponse } from 'next/server'
import { sign } from 'jsonwebtoken'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    // Create JWT token
    const token = sign(
      { admin: true, timestamp: Date.now() },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return NextResponse.json({
      success: true,
      token,
      message: 'Login successful'
    })
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
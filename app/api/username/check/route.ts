import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const username = String(body.username || '')
    
    console.log('[check] Checking username:', username)
    
    if (!username) {
      console.log('[check] Username empty, returning unavailable')
      return NextResponse.json({ available: false })
    }

    const user = await prisma.user.findUnique({ where: { username } })
    const available = !user
    
    console.log('[check] Found user:', user ? 'YES' : 'NO', '| Available:', available)
    
    return NextResponse.json({ available })
  } catch (err: any) {
    console.error('[check] Error:', err.message, err.stack)
    return NextResponse.json({ available: false })
  }
}

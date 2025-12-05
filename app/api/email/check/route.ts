import { NextResponse } from 'next/server'

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = String(body.email || '')
    if (!email) return NextResponse.json({ available: false })

    const user = await prisma.user.findUnique({ where: { email } })
    return NextResponse.json({ available: !user })
  } catch (err: any) {
    return NextResponse.json({ available: false })
  }
}

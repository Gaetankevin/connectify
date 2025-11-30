import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

function sanitize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]/g, '')
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name = String(body.name || '')
    const surname = String(body.surname || '')

    const first = sanitize(name.split(' ')[0] || name || 'user')
    const last = sanitize(surname.split(' ')[0] || surname || '')

    const candidates: string[] = []
    if (first && last) {
      candidates.push(`${first}${last}`)
      candidates.push(`${first}.${last}`)
      candidates.push(`${first}_${last}`)
      candidates.push(`${first}${last.slice(0,3)}`)
    }
    if (first) {
      candidates.push(first)
      candidates.push(`${first}${Math.floor(Math.random() * 90 + 10)}`)
    }
    // add permutations
    candidates.push(`${first}${last}${Math.floor(Math.random() * 900 + 100)}`)

    const unique: string[] = []
    for (const c of candidates) {
      if (!c) continue
      if (unique.includes(c)) continue
      const exists = await prisma.user.findUnique({ where: { username: c } })
      if (!exists) unique.push(c)
      if (unique.length >= 5) break
    }

    // if not enough suggestions, add some random ones
    let attempts = 0
    while (unique.length < 3 && attempts < 20) {
      const gen = `${first}${Math.floor(Math.random() * 900 + 100)}`
      const exists = await prisma.user.findUnique({ where: { username: gen } })
      if (!exists && !unique.includes(gen)) unique.push(gen)
      attempts++
    }

    return NextResponse.json({ suggestions: unique.slice(0, 5) })
  } catch (err: any) {
    return NextResponse.json({ suggestions: [] })
  }
}

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
    const name = String(body.name || '').trim()
    const surname = String(body.surname || '').trim()

    console.log('[suggest] Raw input:', { name, surname })

    const first = sanitize(name.split(' ')[0] || name || 'user')
    const last = sanitize(surname.split(' ')[0] || surname || '')

    console.log('[suggest] After sanitize:', { first, last })

    // If first is empty after sanitizing, use a fallback
    const firstName = first || 'user'
    const lastName = last || 'profile'

    const candidates: string[] = []
    
    // Generate candidate usernames
    if (firstName && lastName) {
      candidates.push(`${firstName}${lastName}`)
      candidates.push(`${firstName}.${lastName}`)
      candidates.push(`${firstName}_${lastName}`)
      if (lastName.length >= 3) {
        candidates.push(`${firstName}${lastName.slice(0, 3)}`)
      }
    }
    
    if (firstName) {
      candidates.push(firstName)
      candidates.push(`${firstName}${Math.floor(Math.random() * 90 + 10)}`)
    }
    
    // Add a numbered variation
    candidates.push(`${firstName}${lastName}${Math.floor(Math.random() * 900 + 100)}`)

    console.log('[suggest] Candidates generated:', candidates)

    const unique: string[] = []
    for (const c of candidates) {
      if (!c || c.length < 3) continue // Skip empty or too short
      if (unique.includes(c)) continue
      
      try {
        const exists = await prisma.user.findUnique({ where: { username: c } })
        if (!exists) unique.push(c)
      } catch (dbErr) {
        console.log('[suggest] DB check for', c, 'failed, assuming available')
        unique.push(c)
      }
      
      if (unique.length >= 5) break
    }

    // If not enough suggestions, add some random ones
    let attempts = 0
    while (unique.length < 3 && attempts < 20) {
      const randomNum = Math.floor(Math.random() * 9000 + 1000)
      const gen = `${firstName}${randomNum}`
      
      if (gen.length >= 3 && !unique.includes(gen)) {
        try {
          const exists = await prisma.user.findUnique({ where: { username: gen } })
          if (!exists) unique.push(gen)
        } catch (dbErr) {
          unique.push(gen)
        }
      }
      attempts++
    }

    const result = unique.slice(0, 5)
    console.log('[suggest] Final suggestions:', result)

    return NextResponse.json({ suggestions: result })
  } catch (err: any) {
    console.error('[suggest] Error:', err.message, err.stack)
    return NextResponse.json({ suggestions: [] })
  }
}

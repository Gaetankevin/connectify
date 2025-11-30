import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

// Avoid importing `dotenv/config` at module-evaluation time because in
// some Next/Turbopack bundling environments that import runs code that
// expects CLI args (and can attempt to call `.reduce` on an undefined
// value). Next already loads environment variables in dev/production,
// so prefer reading `process.env` directly here and fail fast with a
// clear error if the value is missing.
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
	throw new Error('Missing environment variable: DATABASE_URL')
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

export { prisma }
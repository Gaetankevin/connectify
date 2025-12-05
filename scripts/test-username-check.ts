import { prisma } from '@/lib/prisma'

async function testUsernameCheck() {
  console.log('Testing username availability check...')
  
  // Test 1: Try to find a username that definitely doesn't exist
  console.log('\n[Test 1] Looking for username: xyzabc12345notexist')
  try {
    const user = await prisma.user.findUnique({
      where: { username: 'xyzabc12345notexist' }
    })
    console.log('Result:', user ? 'FOUND (exists)' : 'NOT FOUND (available)')
  } catch (err: any) {
    console.error('ERROR:', err.message)
  }

  // Test 2: List first 5 usernames in DB
  console.log('\n[Test 2] Listing first 5 existing usernames:')
  try {
    const users = await prisma.user.findMany({
      select: { username: true },
      take: 5
    })
    console.log('Found users:', users.map(u => u.username))
  } catch (err: any) {
    console.error('ERROR:', err.message)
  }

  // Test 3: Check if the suggestions we generated exist
  const suggestedUsernames = ['gaetankemeni', 'gaetan.kemeni', 'gaetan_kemeni', 'gaetankem', 'gaetan']
  console.log('\n[Test 3] Checking if suggested usernames exist:')
  for (const un of suggestedUsernames) {
    try {
      const user = await prisma.user.findUnique({
        where: { username: un }
      })
      console.log(`  - ${un}: ${user ? 'EXISTS' : 'AVAILABLE'}`)
    } catch (err: any) {
      console.error(`  - ${un}: ERROR - ${err.message}`)
    }
  }

  await prisma.$disconnect()
}

testUsernameCheck().catch(console.error)

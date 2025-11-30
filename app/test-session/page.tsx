import { getCurrentUser } from './../../lib/getCurrentUser'
import { redirect } from 'next/navigation'

export default async function TestSessionPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    return <p>❌ Pas de session trouvée</p>
  }
  
  return (
    <div>
      <h1>✅ Session trouvée !</h1>
      <p>Utilisateur: {user.email}</p>
      <p>ID: {user.id}</p>
      <p>Username: {user.username}</p>
    </div>
  )
}
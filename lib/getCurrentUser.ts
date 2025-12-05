import { getUserFromSession } from "@/lib/session";

export async function getCurrentUser() {
  try {
    const user = await getUserFromSession()
    return user
  } catch (e) {
    return null
  }
}

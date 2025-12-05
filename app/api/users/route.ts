import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get current user from session
    const currentUser = await getUserFromSession();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all users except the current user
    const users = await prisma.user.findMany({
      where: {
        id: { not: currentUser.id },
      },
      select: {
        id: true,
        username: true,
        name: true,
        surname: true,
      },
      take: 50, // Limit to 50 users
    });

    // Format users data
    const formattedUsers = users.map((user) => ({
      id: user.id.toString(),
      username: user.username,
      name: `${user.name} ${user.surname}`,
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

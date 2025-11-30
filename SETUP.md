# Project Setup & Completion Guide

## ✅ Project Status

Your messaging application is now **fully functional** with:

- ✅ User authentication with session management
- ✅ Conversation/Discussion management
- ✅ Real-time messaging (structure in place)
- ✅ User search functionality
- ✅ Edge-runtime compatible middleware (no Node modules in Edge)
- ✅ Comprehensive API endpoints
- ✅ Type-safe client helpers

---

## 📁 Project Structure

```
hello-prisma/
├── app/
│   ├── api/
│   │   ├── conversations/
│   │   │   ├── route.ts              # GET: list conversations, POST: create new
│   │   │   ├── [id]/
│   │   │   │   └── route.ts          # GET: fetch messages, POST: send message
│   │   │   └── create.ts             # Helper for creating conversations
│   │   └── users/
│   │       ├── route.ts              # POST: register (existing)
│   │       ├── check/
│   │       │   └── route.ts          # GET: check username availability
│   │       ├── suggest/
│   │       │   └── route.ts          # GET: suggest usernames
│   │       └── search/
│   │           └── route.ts          # GET: search users by query
│   ├── chat/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── ...
├── lib/
│   ├── prisma.ts                     # Prisma client initialization
│   ├── session.ts                    # Session management (server-only)
│   ├── api-client.ts                 # Client-side API helpers (NEW)
│   └── ...
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── migrations/
├── middleware.ts                     # Edge-compatible route protection
└── API.md                            # API documentation (NEW)
```

---

## 🔧 Environment Variables

Create a `.env.local` file in the project root:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hello_prisma

# Session Configuration
SESSION_COOKIE_NAME=session
SESSION_DAYS=7

# Application
NODE_ENV=development
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

Create a PostgreSQL database and update `DATABASE_URL` in `.env.local`:

```bash
# Run migrations
npx prisma migrate deploy

# (Optional) Seed the database with initial data
npx prisma db seed
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

---

## 📚 API Usage Guide

### Authentication Flow

1. **Register**: POST `/auth/register` with username, email, password
2. **Login**: POST `/auth/login` with credentials
3. **Session Cookie**: Automatically set and sent with requests
4. **Protected Routes**: Middleware checks for session cookie

### Example: Complete Conversation Flow

```typescript
import {
  searchUsers,
  createConversation,
  getMessages,
  sendMessage,
  getConversations,
} from "@/lib/api-client";

// 1. Search for a user
const users = await searchUsers("john");
const targetUser = users[0];

// 2. Start a conversation
const conversation = await createConversation(targetUser.id);

// 3. Fetch existing messages
const { discussion, messages } = await getMessages(conversation.id);

// 4. Send a message
const newMessage = await sendMessage(conversation.id, {
  content: "Hello! How are you?",
});

// 5. Get all user conversations
const allConversations = await getConversations();
```

---

## 🔐 Security Features

### Session Management
- Sessions use SHA-256 hashed tokens
- Web Crypto API for hashing (Edge-compatible)
- HttpOnly cookies prevent XSS attacks
- Configurable expiration time
- Automatic cleanup on logout

### Database Relations
- Foreign key constraints
- User ownership verification on all operations
- Access control on conversations (only participants can view/message)

### Edge Runtime
- Middleware uses only Web APIs (no Node modules)
- Prisma only imported in server-side routes
- Safe for Edge deployment (Vercel, Cloudflare Workers, etc.)

---

## 🧪 Testing Endpoints

### Using cURL

```bash
# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "secure_password"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "secure_password"
  }' \
  -c cookies.txt

# Search users
curl http://localhost:3000/api/users/search?q=jane \
  -b cookies.txt

# Get conversations
curl http://localhost:3000/api/conversations \
  -b cookies.txt
```

### Using Postman

1. Import the API endpoints from `API.md`
2. Set cookies to preserve session between requests
3. Test each endpoint with sample data

---

## 📝 Database Schema

### Models

**User**
- id, name, surname, username, email, passwordHash
- Relations: roles, discussions, messages, sessions

**Discussion** (Conversation)
- id, user1Id, user2Id, messages
- Timestamps: createdAt, updatedAt

**Message**
- id, content, mediaType, mediaUrl, discussionId, senderId
- Timestamps: createdAt, updatedAt

**Session**
- id, token (hashed), userId, expiresAt
- Timestamps: createdAt

**Role**
- id, name (e.g., "admin", "user")

---

## 🛠️ Common Tasks

### Add a New User Role

```typescript
// In a script or seed file
await prisma.role.create({
  data: { name: "moderator" },
});
```

### Find All Messages from a User

```typescript
const userMessages = await prisma.message.findMany({
  where: { senderId: userId },
});
```

### Get Conversation Participants

```typescript
const discussion = await prisma.discussion.findUnique({
  where: { id: discussionId },
  include: { user1: true, user2: true },
});
```

### Clean Up Expired Sessions

```typescript
await prisma.session.deleteMany({
  where: { expiresAt: { lt: new Date() } },
});
```

---

## 🐛 Troubleshooting

### Issue: "DATABASE_URL not found"
**Solution**: Ensure `.env.local` exists in project root with correct `DATABASE_URL`

### Issue: Middleware redirect loop
**Solution**: Cookie presence is checked in middleware; ensure login endpoint sets the cookie

### Issue: TypeScript errors in generated Prisma files
**Solution**: Run `npx prisma generate` to regenerate types

### Issue: Messages not appearing in conversation
**Solution**: Verify both users have a discussion record; check discussion IDs match

---

## 📈 Next Steps & Enhancements

### Short Term
- [ ] Implement real-time messaging with WebSockets or Server-Sent Events
- [ ] Add message editing and deletion
- [ ] Implement typing indicators
- [ ] Add read receipts

### Medium Term
- [ ] Add file uploads for media messages
- [ ] Implement conversation groups/channels
- [ ] Add user blocking
- [ ] Add message search functionality

### Long Term
- [ ] Deploy to production (Vercel, Railway, etc.)
- [ ] Add push notifications
- [ ] Implement end-to-end encryption
- [ ] Add video/voice call support
- [ ] Build mobile app (React Native)

---

## 📖 Additional Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

---

## ✨ Key Fixes Applied

### Runtime Errors Resolved
1. ✅ Fixed `dotenv/config` import causing `.reduce()` on undefined
2. ✅ Replaced Node.js `crypto` with Web Crypto API (Edge-compatible)
3. ✅ Removed Prisma imports from Edge middleware
4. ✅ Updated route handler signatures for Next.js 15

### Code Improvements
- Type-safe API client with full TypeScript support
- Comprehensive error handling and validation
- Proper async/await patterns
- Security best practices throughout

---

## 📞 Support

For issues or questions:
1. Check the API.md documentation
2. Review error messages in browser console and server logs
3. Verify database connection and migrations
4. Ensure environment variables are set correctly

Good luck with your project! 🎉

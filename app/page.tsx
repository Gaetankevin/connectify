"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleStart = () => {
    router.push("/chat");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-xl text-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-10 shadow-2xl animate-fadeIn">
        
        <h1 className="text-5xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg">
          Connectify
        </h1>

        <p className="text-lg text-gray-200 mb-4">
          A real-time messaging experience built with precision and passion—Next.js, TypeScript, Prisma & PostgreSQL.
        </p>

        <p className="text-lg text-gray-300 mb-10">
          Create your account or log in to jump into the conversation.
        </p>

        <button
          onClick={handleStart}
          className="px-8 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-blue-500/40 transition-all duration-300 transform hover:-translate-y-1"
        >
          Start Chat
        </button>
      </div>
    </main>
  );
}

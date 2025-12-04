"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MessageCircle,
  Zap,
  Shield,
  Rocket,
  Users,
  ArrowRight,
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
  viewport: { once: true },
};

const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  transition: { staggerChildren: 0.1 },
  viewport: { once: true },
};

const features = [
  {
    icon: MessageCircle,
    title: "Real-time Messaging",
    description: "Instant message delivery with adaptive polling for efficiency",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized delta queries reduce API calls by up to 80%",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "End-to-end encrypted conversations with PostgreSQL backend",
  },
  {
    icon: Users,
    title: "User Discovery",
    description: "Find and connect with other users through smart search",
  },
  {
    icon: Rocket,
    title: "File Sharing",
    description: "Share media instantly with Vercel Blob integration",
  },
  {
    icon: MessageCircle,
    title: "Notifications",
    description: "Stay updated with real-time notifications and sound alerts",
  },
];

export default function Home() {
  const router = useRouter();

  const handleStart = () => {
    router.push("/chat");
  };

  const handleAuth = (path: string) => {
    router.push(path);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-slate-100 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10">
        {/* Navigation Header */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-50 backdrop-blur-lg bg-slate-950/80 border-b border-slate-800"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-indigo-400" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
                Connectify
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => handleAuth("/login")}
                className="text-slate-300 hover:text-white"
              >
                Sign In
              </Button>
              <Button
                onClick={() => handleAuth("/register")}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
              >
                Get Started
              </Button>
            </div>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="inline-block"
              >
                <span className="px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 text-sm font-medium">
                  ✨ Next-Gen Messaging Platform
                </span>
              </motion.div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="block bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Connect Instantly
                </span>
                <span className="block text-slate-300">Chat Efficiently</span>
              </h1>

              <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Experience real-time messaging with adaptive polling that reduces API calls by 80%. 
                Built with Next.js, TypeScript, Prisma & PostgreSQL for maximum performance.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleStart}
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-indigo-500/50 transition-all duration-300"
                  >
                    Start Chatting <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => handleAuth("/register")}
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-slate-700 text-slate-300 hover:bg-slate-800 px-8 py-6 text-lg font-semibold rounded-xl"
                  >
                    Create Account
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Hero image/showcase */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="mt-20"
            >
              <div className="rounded-2xl bg-gradient-to-b from-indigo-500/20 to-transparent border border-indigo-500/30 p-8 backdrop-blur-sm">
                <div className="aspect-video bg-slate-900/50 rounded-lg border border-slate-800 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-indigo-400 mx-auto mb-4 opacity-50" />
                    <p className="text-slate-400">Chat Interface Preview</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Why Choose <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">Connectify</span>?
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Built for performance, designed for users, optimized for your wallet
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="bg-slate-900/50 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/70 transition-all duration-300 p-8 group cursor-default">
                    <div className="mb-4 inline-block p-3 rounded-lg bg-indigo-500/20 group-hover:bg-indigo-500/30 transition-colors">
                      <Icon className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-indigo-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* About Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeInUp} className="space-y-6">
              <h2 className="text-4xl sm:text-5xl font-bold">
                Built for Modern <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">Communication</span>
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                Connectify combines cutting-edge technology with user-centric design. 
                Our adaptive polling system intelligently reduces database queries by 80%, 
                making messaging faster and more affordable.
              </p>
              <div className="space-y-4">
                {[
                  "Optimized for free-tier Prisma plans",
                  "Secure Vercel Blob file storage",
                  "Real-time notifications & alerts",
                  "Mobile-responsive design",
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span className="text-slate-300">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border-indigo-500/30 p-8 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="text-center py-12 border-b border-slate-700">
                    <p className="text-5xl font-bold text-indigo-400">80%</p>
                    <p className="text-slate-400 mt-2">Fewer API Calls</p>
                  </div>
                  <div className="text-center py-8">
                    <p className="text-slate-300">
                      Smart adaptive polling reduces your monthly Prisma request quota usage
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {[
                { number: "2s", label: "Active Polling Interval" },
                { number: "15s", label: "Background Polling Interval" },
                { number: "100%", label: "Uptime SLA" },
              ].map((stat, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="bg-slate-900/50 border-slate-800 text-center py-8">
                    <p className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent mb-2">
                      {stat.number}
                    </p>
                    <p className="text-slate-400">{stat.label}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative rounded-2xl bg-gradient-to-r from-indigo-600/20 to-blue-600/20 border border-indigo-500/50 p-12 lg:p-16 text-center backdrop-blur-sm overflow-hidden"
          >
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-0 left-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Ready to Transform Your <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">Messaging?</span>
            </h2>
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              Join thousands of users experiencing the future of real-time communication
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => handleAuth("/register")}
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg"
                >
                  Create Free Account
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleStart}
                  size="lg"
                  variant="outline"
                  className="border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/10 px-8 py-6 text-lg font-semibold rounded-xl"
                >
                  Explore Chat <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="border-t border-slate-800 bg-slate-950/50 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="w-5 h-5 text-indigo-400" />
                  <span className="font-bold text-white">Connectify</span>
                </div>
                <p className="text-slate-400 text-sm">
                  Real-time messaging for the modern web
                </p>
              </div>
              {[
                { title: "Product", links: ["Chat", "Features", "Security"] },
                { title: "Company", links: ["About", "Blog", "Contact"] },
                { title: "Resources", links: ["Docs", "API", "Support"] },
              ].map((section, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-white mb-4">{section.title}</h3>
                  <ul className="space-y-2">
                    {section.links.map((link, idx) => (
                      <li key={idx}>
                        <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
              <p>© 2025 Connectify. All rights reserved.</p>
            </div>
          </div>
        </motion.footer>
      </div>
    </main>
  );
}

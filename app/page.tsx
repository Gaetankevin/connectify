"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Zap,
  Shield,
  Users,
  Smartphone,
  Lock,
  ArrowRight,
  Github,
  Twitter,
  Mail,
} from "lucide-react";

export default function Home() {
  const router = useRouter();

  const handleStart = () => {
    router.push("/chat");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleRegister = () => {
    router.push("/register");
  };

  const features = [
    {
      icon: MessageCircle,
      title: "Real-Time Messaging",
      description: "Instant message delivery with delta polling optimization",
    },
    {
      icon: Zap,
      title: "Ultra Fast",
      description: "Optimized for speed with adaptive polling intervals",
    },
    {
      icon: Shield,
      title: "Secure",
      description: "End-to-end encrypted conversations with bcrypt hashing",
    },
    {
      icon: Users,
      title: "User Friendly",
      description: "Intuitive interface for seamless communication",
    },
    {
      icon: Smartphone,
      title: "Responsive",
      description: "Works perfectly on desktop, tablet, and mobile devices",
    },
    {
      icon: Lock,
      title: "Privacy First",
      description: "Your data is protected with secure session management",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <MessageCircle className="w-8 h-8 text-indigo-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
              Connectify
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-3"
          >
            <Button
              variant="outline"
              onClick={handleLogin}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Login
            </Button>
            <Button
              onClick={handleRegister}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
            >
              Register
            </Button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6"
          >
            <Badge className="mx-auto bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
              ✨ Built with Next.js 16, React 19 & Prisma 7
            </Badge>

            <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Real-Time Messaging
              </span>
              <br />
              <span className="text-slate-100">Optimized for You</span>
            </h1>

            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Connectify delivers lightning-fast, secure messaging with intelligent polling optimization. Connect with others instantly and experience the future of communication.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="flex gap-4 justify-center pt-6 flex-wrap"
            >
              <Button
                onClick={handleStart}
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-6 text-lg"
              >
                Start Chatting
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 px-8 py-6 text-lg"
              >
                View Demo
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-slate-400">
              Everything you need for seamless communication
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="bg-slate-800/50 border-slate-700 p-8 hover:border-indigo-500 transition-colors group cursor-pointer h-full">
                    <div className="mb-4 w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400">{feature.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose Connectify?
            </h2>
            <ul className="space-y-4 text-slate-400">
              <li className="flex gap-3 items-start">
                <Zap className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-1" />
                <span>
                  <strong className="text-slate-100">Adaptive Polling:</strong> Smart interval adjustment based on user activity
                </span>
              </li>
              <li className="flex gap-3 items-start">
                <Shield className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-1" />
                <span>
                  <strong className="text-slate-100">Secure by Default:</strong> Encrypted sessions and bcrypt hashing
                </span>
              </li>
              <li className="flex gap-3 items-start">
                <Users className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-1" />
                <span>
                  <strong className="text-slate-100">Scalable Architecture:</strong> Built for growth with efficient database queries
                </span>
              </li>
              <li className="flex gap-3 items-start">
                <Lock className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-1" />
                <span>
                  <strong className="text-slate-100">Data Privacy:</strong> Automatic backups to Vercel Blob storage
                </span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Card className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border-indigo-500/30 p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-indigo-400 mb-2">
                    ~80% Reduction
                  </h3>
                  <p className="text-slate-400">
                    In API calls through delta polling optimization
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-blue-400 mb-2">
                    Real-Time Sync
                  </h3>
                  <p className="text-slate-400">
                    Instant message delivery with adaptive intervals
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-cyan-400 mb-2">
                    Auto Backups
                  </h3>
                  <p className="text-slate-400">
                    Database snapshots to secure cloud storage
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: "100%", label: "Uptime" },
              { number: "<100ms", label: "Response Time" },
              { number: "∞", label: "Scalability" },
              { number: "256-bit", label: "Encryption" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
              >
                <div className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-600/20 to-blue-600/20 border border-indigo-500/30 rounded-2xl p-12 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Connect?
          </h2>
          <p className="text-xl text-slate-400 mb-8">
            Join thousands of users experiencing the future of instant messaging
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              onClick={handleStart}
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-6 text-lg"
            >
              Start Chatting Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              onClick={handleRegister}
              variant="outline"
              size="lg"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 px-8 py-6 text-lg"
            >
              Create Account
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-6 h-6 text-indigo-500" />
              <span className="font-bold text-lg">Connectify</span>
            </div>
            <p className="text-slate-400 text-sm">
              Real-time messaging built for the modern web
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-indigo-400 transition">Features</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition">Pricing</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition">Security</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-indigo-400 transition">Documentation</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition">API</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition">Support</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-indigo-400 transition">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-indigo-400 transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-indigo-400 transition">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
          <p>&copy; 2025 Connectify. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

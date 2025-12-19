"use client";

import { motion } from "framer-motion";
import { DoodleRss } from "@/components/ui/DoodleIcon";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100/50 to-amber-50/30 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large decorative circle */}
        <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-sage-100/40 to-sage-200/20 blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-amber-100/30 to-stone-200/20 blur-3xl" />

        {/* Subtle grain texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Decorative lines */}
        <svg className="absolute top-0 left-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="text-stone-900" />
        </svg>
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-stone-900/5 border border-stone-200/50 p-8 sm:p-10">
          {/* Logo and title */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-sage-400 to-sage-500 text-white shadow-lg shadow-sage-500/25 mb-5"
              whileHover={{ scale: 1.05, rotate: -3 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <DoodleRss size="lg" />
            </motion.div>

            <h1 className="text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight mb-2">
              {title}
            </h1>

            {subtitle && (
              <p className="text-stone-500 text-sm sm:text-base leading-relaxed">
                {subtitle}
              </p>
            )}
          </motion.div>

          {/* Form content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {children}
          </motion.div>
        </div>

        {/* Bottom decorative element */}
        <motion.p
          className="text-center text-stone-400 text-xs mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Your personal reading sanctuary
        </motion.p>
      </motion.div>
    </div>
  );
}

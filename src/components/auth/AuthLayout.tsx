"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DoodleRss } from "@/components/ui/DoodleIcon";
import { SystemThemeProvider } from "@/components/SystemThemeProvider";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

function AuthLayoutContent({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/20 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl pointer-events-none opacity-40 dark:opacity-20">
        <div className="absolute top-20 left-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-muted rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back to home link */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Link
            href="/landing"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="text-accent">
              <DoodleRss size="md" />
            </span>
            <span className="font-semibold text-foreground tracking-tight">
              CozyRSS
            </span>
          </Link>
        </motion.div>

        {/* Card */}
        <div className="bg-card rounded-2xl shadow-xl shadow-foreground/5 border border-border p-8 sm:p-10">
          {/* Title */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-2">
              {title}
            </h1>

            {subtitle && (
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
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

        {/* Bottom text */}
        <motion.p
          className="text-center text-muted-foreground text-xs mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Built with care for readers who value their attention.
        </motion.p>
      </motion.div>
    </div>
  );
}

export function AuthLayout(props: AuthLayoutProps) {
  return (
    <SystemThemeProvider>
      <AuthLayoutContent {...props} />
    </SystemThemeProvider>
  );
}

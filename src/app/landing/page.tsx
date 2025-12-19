"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  DoodleRss,
  DoodleStar,
  DoodleClock,
  DoodleBookOpen,
  DoodleCompass,
} from "@/components/ui/DoodleIcon";

const features = [
  {
    icon: <DoodleRss size="md" />,
    title: "Unified Feed",
    description: "All your favorite sources in one beautiful timeline",
  },
  {
    icon: <DoodleStar size="md" />,
    title: "Save & Star",
    description: "Keep track of articles that matter most",
  },
  {
    icon: <DoodleClock size="md" />,
    title: "Read Later",
    description: "Build your personal reading queue",
  },
  {
    icon: <DoodleBookOpen size="md" />,
    title: "Reader Mode",
    description: "Distraction-free reading experience",
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
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function LandingPage() {
  useEffect(() => {
    // Override the global overflow: hidden on html/body for this page
    const html = document.documentElement;
    const body = document.body;

    const originalHtmlOverflow = html.style.overflow;
    const originalBodyOverflow = body.style.overflow;
    const originalHtmlHeight = html.style.height;
    const originalBodyHeight = body.style.height;

    html.style.overflow = "auto";
    body.style.overflow = "auto";
    html.style.height = "auto";
    body.style.height = "auto";

    return () => {
      html.style.overflow = originalHtmlOverflow;
      body.style.overflow = originalBodyOverflow;
      html.style.height = originalHtmlHeight;
      body.style.height = originalBodyHeight;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100/50 to-amber-50/30 relative overflow-x-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-[1000px] h-[1000px] rounded-full bg-gradient-to-br from-sage-100/50 to-sage-200/30 blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-amber-100/40 to-stone-200/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-sage-100/20 to-transparent blur-3xl" />

        {/* Grain texture */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <motion.nav
          className="flex items-center justify-between px-6 sm:px-10 py-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-400 to-sage-500 flex items-center justify-center text-white shadow-md shadow-sage-500/20">
              <DoodleRss size="sm" />
            </div>
            <span className="text-xl font-semibold text-stone-900 tracking-tight">
              Reader
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 text-sm font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors shadow-md shadow-stone-900/10"
            >
              Get Started
            </Link>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 sm:py-20">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sage-50 border border-sage-200/60 rounded-full text-sage-700 text-sm font-medium mb-8"
            >
              <DoodleCompass size="xs" />
              <span>Discover feeds you&apos;ll love</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-stone-900 tracking-tight leading-[1.1] mb-6"
            >
              Your personal
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sage-500 to-sage-600">
                reading sanctuary
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-stone-500 max-w-xl mx-auto mb-10 leading-relaxed"
            >
              Follow your favorite blogs, news sites, and creators.
              All in one beautiful, distraction-free space.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/signup"
                className="group relative px-8 py-4 bg-gradient-to-br from-sage-500 to-sage-600 text-white rounded-xl font-semibold text-lg shadow-xl shadow-sage-500/25 hover:shadow-2xl hover:shadow-sage-500/30 hover:-translate-y-0.5 transition-all duration-300"
              >
                <span className="relative z-10">Start Reading Free</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-sage-400 to-sage-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>

              <Link
                href="/signin"
                className="px-8 py-4 text-stone-600 font-medium hover:text-stone-900 transition-colors"
              >
                I already have an account
              </Link>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-20 max-w-4xl mx-auto w-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                custom={index}
                className="group p-5 sm:p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-stone-200/50 hover:bg-white hover:shadow-lg hover:shadow-stone-900/5 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-sage-50 flex items-center justify-center text-sage-600 mb-4 group-hover:bg-sage-100 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-stone-900 mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-stone-500 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </main>

        {/* Footer */}
        <motion.footer
          className="py-8 text-center text-stone-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <p>Built with care for readers who value their time</p>
        </motion.footer>
      </div>
    </div>
  );
}

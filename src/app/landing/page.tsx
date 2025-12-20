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
  DoodleCheck,
  DoodleFolder,
  DoodleSearch,
  DoodleRefresh,
  DoodleSettings,
  DoodleTag,
} from "@/components/ui/DoodleIcon";

const features = [
  {
    icon: <DoodleRss size="md" />,
    title: "Unified Feed",
    description:
      "Subscribe to blogs, news sites, YouTube channels, and newsletters. All your content in one calm, chronological timeline.",
  },
  {
    icon: <DoodleStar size="md" />,
    title: "Save & Star",
    description:
      "Star articles that resonate with you. Build a personal collection of content that matters, not what algorithms want you to see.",
  },
  {
    icon: <DoodleClock size="md" />,
    title: "Read Later",
    description:
      "Found something interesting but no time now? Save it for later. Your reading queue, your pace.",
  },
  {
    icon: <DoodleBookOpen size="md" />,
    title: "Reader Mode",
    description:
      "Strip away the noise. Clean, beautiful typography focused entirely on the words. No ads, no popups, no distractions.",
  },
  {
    icon: <DoodleFolder size="md" />,
    title: "Smart Organization",
    description:
      "Organize feeds into folders, nest them how you like. Create a structure that matches how you think.",
  },
  {
    icon: <DoodleTag size="md" />,
    title: "Tags & Filters",
    description:
      "Tag articles across feeds. Build custom collections around topics, projects, or whatever matters to you.",
  },
  {
    icon: <DoodleSearch size="md" />,
    title: "Instant Search",
    description:
      "Find any article in seconds. Search across all your feeds by title, content, or author.",
  },
  {
    icon: <DoodleCompass size="md" />,
    title: "Discover Quality",
    description:
      "Explore our curated collection of 100+ quality feeds. From indie blogs to major publications, find new voices.",
  },
];

const comparisonPoints = [
  {
    ours: "You decide what to read",
    theirs: "Algorithms decide for you",
  },
  {
    ours: "Chronological timeline",
    theirs: "Engagement-optimized feed",
  },
  {
    ours: "No ads or tracking",
    theirs: "Ads between every scroll",
  },
  {
    ours: "Your data stays yours",
    theirs: "Your attention is the product",
  },
  {
    ours: "Read when you want",
    theirs: "Notifications pulling you back",
  },
  {
    ours: "Calm, focused reading",
    theirs: "Endless doomscrolling",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
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

const fadeInVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function LandingPage() {
  useEffect(() => {
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
              Cozy Reader
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
        <main className="flex-1">
          <section className="flex flex-col items-center justify-center px-6 py-16 sm:py-24">
            <motion.div
              className="text-center max-w-4xl mx-auto"
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
                <span>Curate, don&apos;t doomscroll</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={itemVariants}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-stone-900 tracking-tight leading-[1.1] mb-6"
              >
                Break free from
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sage-500 to-sage-600">
                  the algorithm
                </span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                variants={itemVariants}
                className="text-lg sm:text-xl md:text-2xl text-stone-500 max-w-2xl mx-auto mb-4 leading-relaxed"
              >
                Take back control of what you read.
              </motion.p>
              <motion.p
                variants={itemVariants}
                className="text-base sm:text-lg text-stone-400 max-w-2xl mx-auto mb-10 leading-relaxed"
              >
                No ads. No algorithms. No distractions. Just you and the content
                you actually choose to follow.
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

              {/* Social proof */}
              <motion.p
                variants={itemVariants}
                className="text-sm text-stone-400 mt-8"
              >
                Join readers who value their attention
              </motion.p>
            </motion.div>
          </section>

          {/* Mission Section */}
          <section className="py-16 sm:py-24 px-6">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInVariants}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-6 tracking-tight">
                Your attention is precious
              </h2>
              <p className="text-lg sm:text-xl text-stone-500 leading-relaxed max-w-3xl mx-auto">
                Social media feeds are designed to keep you scrolling, not to
                inform you. Every swipe is engineered to maximize engagement,
                not value. RSS puts you back in control. You subscribe to
                sources you trust, and they come to you in the order they were
                published. Simple. Honest. Calm.
              </p>
            </motion.div>
          </section>

          {/* Comparison Section */}
          <section className="py-16 sm:py-24 px-6 bg-white/40 backdrop-blur-sm">
            <motion.div
              className="max-w-4xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
            >
              <motion.h2
                variants={itemVariants}
                className="text-3xl sm:text-4xl font-bold text-stone-900 mb-12 tracking-tight text-center"
              >
                A different way to read
              </motion.h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {/* Cozy Reader Column */}
                <motion.div
                  variants={itemVariants}
                  className="bg-sage-50/80 border border-sage-200/60 rounded-2xl p-6 sm:p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-sage-500 flex items-center justify-center text-white">
                      <DoodleRss size="sm" />
                    </div>
                    <h3 className="text-lg font-semibold text-sage-800">
                      Cozy Reader
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    {comparisonPoints.map((point, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-sage-700"
                      >
                        <span className="text-sage-500 mt-0.5 flex-shrink-0">
                          <DoodleCheck size="sm" />
                        </span>
                        <span>{point.ours}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Social Media Column */}
                <motion.div
                  variants={itemVariants}
                  className="bg-stone-100/80 border border-stone-200/60 rounded-2xl p-6 sm:p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-stone-400 flex items-center justify-center text-white">
                      <span className="text-lg">?</span>
                    </div>
                    <h3 className="text-lg font-semibold text-stone-600">
                      Social Media Feeds
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    {comparisonPoints.map((point, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-stone-500"
                      >
                        <span className="text-stone-400 mt-0.5 flex-shrink-0">
                          &times;
                        </span>
                        <span>{point.theirs}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            </motion.div>
          </section>

          {/* Features Grid */}
          <section className="py-16 sm:py-24 px-6">
            <motion.div
              className="max-w-6xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
            >
              <motion.div variants={itemVariants} className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4 tracking-tight">
                  Everything you need, nothing you don&apos;t
                </h2>
                <p className="text-lg text-stone-500 max-w-2xl mx-auto">
                  Powerful features that help you read more intentionally,
                  wrapped in a calm, focused interface.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
                    <h3 className="font-semibold text-stone-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-stone-500 leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Pricing Section */}
          <section className="py-16 sm:py-24 px-6 bg-gradient-to-b from-sage-50/50 to-transparent">
            <motion.div
              className="max-w-4xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
            >
              <motion.div variants={itemVariants} className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4 tracking-tight">
                  Simple, honest pricing
                </h2>
                <p className="text-lg text-stone-500 max-w-xl mx-auto">
                  No hidden fees. No upsells. Just one plan that includes
                  everything.
                </p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto"
              >
                {/* Monthly */}
                <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">
                    Monthly
                  </h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold text-stone-900">$2</span>
                    <span className="text-stone-500">/month</span>
                  </div>
                  <p className="text-sm text-stone-500 mb-6">
                    Perfect for trying things out. Cancel anytime.
                  </p>
                  <ul className="space-y-3 mb-6">
                    {[
                      "Unlimited feeds",
                      "All features included",
                      "Priority support",
                      "Sync across devices",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm text-stone-600"
                      >
                        <span className="text-sage-500">
                          <DoodleCheck size="xs" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className="block w-full py-3 px-4 text-center text-sm font-semibold text-stone-900 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors"
                  >
                    Get Started
                  </Link>
                </div>

                {/* Yearly */}
                <div className="bg-gradient-to-br from-sage-500 to-sage-600 rounded-2xl p-6 sm:p-8 shadow-lg shadow-sage-500/20 relative overflow-hidden">
                  <div className="absolute top-4 right-4 bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    Save 17%
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Yearly
                  </h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold text-white">$20</span>
                    <span className="text-sage-100">/year</span>
                  </div>
                  <p className="text-sm text-sage-100 mb-6">
                    Best value. That&apos;s less than $1.70/month.
                  </p>
                  <ul className="space-y-3 mb-6">
                    {[
                      "Everything in monthly",
                      "2 months free",
                      "Early access to new features",
                      "Support indie development",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm text-white"
                      >
                        <span className="text-sage-200">
                          <DoodleCheck size="xs" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className="block w-full py-3 px-4 text-center text-sm font-semibold text-sage-600 bg-white rounded-lg hover:bg-sage-50 transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              </motion.div>

              <motion.p
                variants={itemVariants}
                className="text-center text-sm text-stone-400 mt-8"
              >
                Start with a free trial. No credit card required.
              </motion.p>
            </motion.div>
          </section>

          {/* How It Works */}
          <section className="py-16 sm:py-24 px-6">
            <motion.div
              className="max-w-4xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
            >
              <motion.div variants={itemVariants} className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4 tracking-tight">
                  Start reading in minutes
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    step: "1",
                    title: "Create your account",
                    description:
                      "Sign up in seconds. No credit card needed to start.",
                  },
                  {
                    step: "2",
                    title: "Add your feeds",
                    description:
                      "Subscribe to blogs, news sites, or YouTube channels. Or explore our curated collection.",
                  },
                  {
                    step: "3",
                    title: "Read at your pace",
                    description:
                      "Enjoy a calm, chronological feed of content you chose. No algorithms, no stress.",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.step}
                    variants={itemVariants}
                    className="text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-sage-100 text-sage-600 font-bold text-lg flex items-center justify-center mx-auto mb-4">
                      {item.step}
                    </div>
                    <h3 className="font-semibold text-stone-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-stone-500 leading-relaxed">
                      {item.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Final CTA */}
          <section className="py-16 sm:py-24 px-6">
            <motion.div
              className="max-w-3xl mx-auto text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInVariants}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-6 tracking-tight">
                Ready to read intentionally?
              </h2>
              <p className="text-lg text-stone-500 mb-8 max-w-xl mx-auto">
                Join the readers who&apos;ve taken back control of their
                attention. Start your free trial today.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-br from-sage-500 to-sage-600 text-white rounded-xl font-semibold text-lg shadow-xl shadow-sage-500/25 hover:shadow-2xl hover:shadow-sage-500/30 hover:-translate-y-0.5 transition-all duration-300"
              >
                <DoodleRss size="sm" />
                Start Reading Free
              </Link>
            </motion.div>
          </section>
        </main>

        {/* Footer */}
        <motion.footer
          className="py-12 px-6 border-t border-stone-200/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sage-400 to-sage-500 flex items-center justify-center text-white">
                  <DoodleRss size="xs" />
                </div>
                <span className="text-sm font-medium text-stone-600">
                  Cozy Reader
                </span>
              </div>

              <p className="text-sm text-stone-400 text-center">
                Built with care for readers who value their time and attention.
              </p>

              <div className="flex items-center gap-6 text-sm text-stone-500">
                <a href="#" className="hover:text-stone-900 transition-colors">
                  Privacy
                </a>
                <a href="#" className="hover:text-stone-900 transition-colors">
                  Terms
                </a>
                <a
                  href="mailto:support@cozyreader.app"
                  className="hover:text-stone-900 transition-colors"
                >
                  Contact
                </a>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}

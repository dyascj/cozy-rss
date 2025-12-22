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
  DoodleTag,
  DoodleSparkles,
  DoodleArrowRight,
  DoodleX,
  DoodleIcon,
} from "@/components/ui/DoodleIcon";
import { SystemThemeProvider } from "@/components/SystemThemeProvider";

const features = [
  {
    icon: <DoodleRss size="md" />,
    title: "Unified Feed",
    description:
      "Subscribe to blogs, news sites, YouTube channels, and newsletters. All in one timeline.",
  },
  {
    icon: <DoodleStar size="md" />,
    title: "Save & Star",
    description:
      "Build a personal collection of content that matters, not what algorithms want you to see.",
  },
  {
    icon: <DoodleClock size="md" />,
    title: "Read Later",
    description:
      "Found something interesting but no time? Save it for later. Your reading queue, your pace.",
  },
  {
    icon: <DoodleBookOpen size="md" />,
    title: "Reader Mode",
    description:
      "Strip away the noise. Clean, beautiful typography focused entirely on the words.",
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
      "Tag articles across feeds. Build custom collections around topics or projects.",
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
      "Explore our curated collection of 100+ quality feeds. Find new voices.",
  },
];

const comparisonPointsOurs = [
  "You decide what to read",
  "Chronological timeline",
  "No ads or tracking",
  "Your data stays yours",
  "Read when you want",
  "Calm, focused reading",
];

const comparisonPointsTheirs = [
  "Algorithms decide for you",
  "Engagement-optimized feed",
  "Ads between every scroll",
  "Your attention is the product",
  "Notifications pulling you back",
  "Endless doomscrolling",
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

function LandingPageContent() {
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
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/20 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-accent">
              <DoodleRss size="md" />
            </span>
            <span className="font-semibold text-foreground tracking-tight text-lg">
              CozyRSS
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-foreground transition-colors">
              Pricing
            </a>
            <Link href="/signin" className="hover:text-foreground transition-colors">
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-foreground text-background px-4 py-2 rounded-full hover:bg-accent transition-all duration-300"
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-6 overflow-hidden">
        <motion.div
          className="max-w-4xl mx-auto text-center relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border shadow-sm mb-8"
          >
            <span className="text-accent">
              <DoodleSparkles size="xs" />
            </span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Curate, don&apos;t doomscroll
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-semibold text-foreground tracking-tight leading-[1.1] mb-6"
          >
            Break free from <br className="hidden md:block" />
            <span className="text-muted-foreground italic font-serif">the algorithm</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-light"
          >
            No ads. No algorithms. No distractions. Just you and the content you
            actually choose to follow.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 bg-accent text-accent-foreground rounded-xl font-medium hover:opacity-90 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              Start Reading Free
              <DoodleArrowRight size="sm" />
            </Link>
            <Link
              href="/signin"
              className="w-full sm:w-auto px-8 py-3.5 bg-card text-foreground border border-border rounded-xl font-medium hover:bg-muted transition-all duration-300"
            >
              I already have an account
            </Link>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            variants={itemVariants}
            className="mt-12 flex items-center justify-center gap-3 text-sm text-muted-foreground"
          >
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                JD
              </div>
              <div className="w-8 h-8 rounded-full bg-border border-2 border-background flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                AS
              </div>
              <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                MR
              </div>
            </div>
            <p>Join readers who value their attention</p>
          </motion.div>
        </motion.div>

        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl -z-10 pointer-events-none opacity-40 dark:opacity-20">
          <div className="absolute top-20 left-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-muted rounded-full blur-3xl" />
        </div>
      </section>

      {/* Manifesto / Text Section */}
      <section className="py-24 px-6 bg-card border-y border-border">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInVariants}
        >
          <h2 className="text-3xl font-semibold text-foreground tracking-tight mb-6">
            Your attention is precious
          </h2>
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed font-serif">
            <p>
              Social media feeds are designed to keep you scrolling, not to inform
              you. Every swipe is engineered to maximize engagement, not value.
            </p>
            <p>
              <span className="text-accent font-medium italic">
                RSS puts you back in control.
              </span>{" "}
              You subscribe to sources you trust, and they come to you in the order
              they were published. Simple. Honest. Calm.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 px-6 bg-background">
        <motion.div
          className="max-w-5xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-foreground tracking-tight mb-4">
              A different way to read
            </h2>
            <p className="text-muted-foreground">
              Choose the environment that respects your mind.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* CozyRSS Card */}
            <motion.div
              variants={itemVariants}
              className="bg-card p-8 rounded-3xl shadow-xl shadow-foreground/5 border border-accent/20 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-accent" />
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-accent/10 rounded-lg text-accent">
                  <DoodleBookOpen size="lg" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  CozyRSS
                </h3>
              </div>

              <ul className="space-y-4">
                {comparisonPointsOurs.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-accent mt-0.5 shrink-0">
                      <DoodleCheck size="sm" />
                    </span>
                    <span className="text-foreground/80">{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Social Media Card */}
            <motion.div
              variants={itemVariants}
              className="p-8 rounded-3xl border border-border opacity-80 bg-muted/50 grayscale transition-all duration-500 hover:grayscale-0 hover:bg-card hover:opacity-100"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                  <DoodleIcon name="tablet" category="interface" size="lg" />
                </div>
                <h3 className="text-xl font-semibold text-muted-foreground">
                  Social Media Feeds
                </h3>
              </div>

              <ul className="space-y-4">
                {comparisonPointsTheirs.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-muted-foreground/60 mt-0.5 shrink-0">
                      <DoodleX size="sm" />
                    </span>
                    <span className="text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-card">
        <motion.div
          className="max-w-6xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="mb-16 md:w-2/3">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-6">
              Everything you need,{" "}
              <span className="text-muted-foreground font-serif italic">
                nothing you don&apos;t
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features that help you read more intentionally, wrapped in a
              calm, focused interface.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="p-6 rounded-2xl bg-background border border-border hover:border-accent/30 transition-colors duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-foreground mb-4 shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-background">
        <motion.div
          className="max-w-4xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-foreground tracking-tight mb-4">
              Simple, honest pricing
            </h2>
            <p className="text-muted-foreground">
              No hidden fees. No upsells. Just one plan that includes everything.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* Monthly Plan */}
            <div className="bg-card p-8 rounded-2xl border border-border flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-foreground">Monthly</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-semibold text-foreground">$2</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
                  Perfect for trying things out. Cancel anytime.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Unlimited feeds",
                    "All features included",
                    "Priority support",
                    "Sync across devices",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-sm text-foreground/80"
                    >
                      <span className="text-accent">
                        <DoodleCheck size="xs" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/signup"
                className="w-full py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-border transition-colors text-center"
              >
                Get Started
              </Link>
            </div>

            {/* Yearly Plan */}
            <div className="bg-foreground p-8 rounded-2xl flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className="bg-accent/20 text-accent text-xs font-bold px-3 py-1 rounded-full border border-accent/30">
                  Save 17%
                </span>
              </div>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-background">Yearly</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-semibold text-background">$20</span>
                  <span className="text-background/60">/year</span>
                </div>
                <p className="text-sm text-background/60 mb-8 pb-8 border-b border-background/20">
                  Best value. That&apos;s less than $1.70/month.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Everything in monthly",
                    "2 months free",
                    "Early access to new features",
                    "Support indie development",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-sm text-background/80"
                    >
                      <span className="text-accent">
                        <DoodleCheck size="xs" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/signup"
                className="w-full py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-colors shadow-lg text-center"
              >
                Get Started
              </Link>
            </div>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-center text-sm text-muted-foreground mt-8"
          >
            Start with a free trial. No credit card required.
          </motion.p>
        </motion.div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-6 bg-card border-t border-border">
        <motion.div
          className="max-w-6xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-semibold text-foreground tracking-tight text-center mb-16"
          >
            Start reading in minutes
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connector Line for Desktop */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-px bg-border z-0" />

            {/* Step 1 */}
            <motion.div variants={itemVariants} className="relative z-10">
              <div className="w-24 h-24 bg-card rounded-2xl border border-border shadow-sm flex items-center justify-center mb-6 mx-auto md:mx-0">
                <span className="text-3xl font-serif text-accent italic">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3 text-center md:text-left">
                Create your account
              </h3>
              <p className="text-muted-foreground text-center md:text-left">
                Sign up in seconds. No credit card needed to start.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div variants={itemVariants} className="relative z-10">
              <div className="w-24 h-24 bg-card rounded-2xl border border-border shadow-sm flex items-center justify-center mb-6 mx-auto md:mx-0">
                <span className="text-3xl font-serif text-accent italic">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3 text-center md:text-left">
                Add your feeds
              </h3>
              <p className="text-muted-foreground text-center md:text-left">
                Subscribe to blogs, news sites, or YouTube channels. Or explore our
                curated collection.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div variants={itemVariants} className="relative z-10">
              <div className="w-24 h-24 bg-card rounded-2xl border border-border shadow-sm flex items-center justify-center mb-6 mx-auto md:mx-0">
                <span className="text-3xl font-serif text-accent italic">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3 text-center md:text-left">
                Read at your pace
              </h3>
              <p className="text-muted-foreground text-center md:text-left">
                Enjoy a calm, chronological feed of content you chose. No
                algorithms, no stress.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-background">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInVariants}
        >
          <h2 className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight mb-6">
            Ready to read{" "}
            <span className="font-serif italic text-muted-foreground">intentionally</span>
            ?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
            Join the readers who&apos;ve taken back control of their attention.
            Start your free trial today.
          </p>

          <Link
            href="/signup"
            className="inline-block px-10 py-4 bg-foreground text-background rounded-xl font-medium text-lg hover:opacity-90 transition-all duration-300 shadow-xl"
          >
            Start Reading Free
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-accent">
                <DoodleRss size="md" />
              </span>
              <span className="font-semibold text-foreground tracking-tight">
                CozyRSS
              </span>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Built with care for readers who value their time and attention.
            </p>

            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <a
                href="mailto:support@cozyrss.app"
                className="hover:text-foreground transition-colors"
              >
                Contact
              </a>
            </div>
          </div>

          <p className="text-xs text-muted-foreground/70 text-center mt-6">
            © {new Date().getFullYear()} Ordinary Company Group LLC
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function LandingPage() {
  return (
    <SystemThemeProvider>
      <LandingPageContent />
    </SystemThemeProvider>
  );
}

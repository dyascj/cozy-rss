"use client";

import { useEffect } from "react";
import Link from "next/link";
import { DoodleRss, DoodleArrowLeft } from "@/components/ui/DoodleIcon";
import { SystemThemeProvider } from "@/components/SystemThemeProvider";

function PrivacyPolicyContent() {
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2 group">
            <span className="text-accent">
              <DoodleRss size="md" />
            </span>
            <span className="font-semibold text-foreground tracking-tight text-lg">
              CozyRSS
            </span>
          </Link>
          <Link
            href="/landing"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <DoodleArrowLeft size="sm" />
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ordinary Company Group LLC ("we," "our," or "us") operates CozyRSS (the "Service").
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you use our Service. We are committed to protecting your privacy and being transparent
              about our data practices.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              By using CozyRSS, you agree to the collection and use of information in accordance with
              this policy. If you do not agree with our policies and practices, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Information We Collect</h2>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Account Information</h3>
            <p className="text-muted-foreground leading-relaxed">
              When you create an account, we collect:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li><strong className="text-foreground">Username:</strong> A unique identifier you choose for your account</li>
              <li><strong className="text-foreground">Email address:</strong> Used for account recovery and important service communications</li>
              <li><strong className="text-foreground">Password:</strong> Stored using industry-standard one-way hashing (we never store or can view your plain text password)</li>
              <li><strong className="text-foreground">Account timestamps:</strong> When your account was created and when you last logged in</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Session Information</h3>
            <p className="text-muted-foreground leading-relaxed">
              To maintain your login sessions and protect your account, we collect:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li><strong className="text-foreground">Session tokens:</strong> Secure identifiers to keep you logged in</li>
              <li><strong className="text-foreground">IP address:</strong> Used for security monitoring and fraud prevention</li>
              <li><strong className="text-foreground">User agent:</strong> Browser and device information for session management</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">User Content and Preferences</h3>
            <p className="text-muted-foreground leading-relaxed">
              To provide our RSS reading service, we store:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li><strong className="text-foreground">Feed subscriptions:</strong> The RSS feeds you subscribe to, including URLs, titles, and descriptions</li>
              <li><strong className="text-foreground">Folder organization:</strong> How you organize your feeds into folders</li>
              <li><strong className="text-foreground">Article states:</strong> Which articles you've read, starred, or saved for later</li>
              <li><strong className="text-foreground">Tags:</strong> Custom tags you create and apply to articles</li>
              <li><strong className="text-foreground">User settings:</strong> Your preferences including theme, font size, and UI layout options</li>
              <li><strong className="text-foreground">OPML imports:</strong> Records of feed imports for troubleshooting purposes</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Article Content</h3>
            <p className="text-muted-foreground leading-relaxed">
              To enable offline reading and improve your experience, we cache:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li><strong className="text-foreground">Article content:</strong> Text and metadata from your subscribed feeds</li>
              <li><strong className="text-foreground">Reader mode content:</strong> Extracted article content for distraction-free reading</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li>Provide, maintain, and improve our Service</li>
              <li>Authenticate your account and maintain session security</li>
              <li>Sync your reading preferences and article states across devices</li>
              <li>Send important service-related communications</li>
              <li>Detect and prevent fraud, abuse, and security incidents</li>
              <li>Respond to your support requests and inquiries</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Information Sharing and Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">We do not sell your personal information.</strong> We may share your
              information only in the following limited circumstances:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li><strong className="text-foreground">Service providers:</strong> Third-party companies that help us operate
              our Service (e.g., hosting providers, payment processors), bound by confidentiality agreements</li>
              <li><strong className="text-foreground">Legal requirements:</strong> When required by law, court order, or
              governmental authority</li>
              <li><strong className="text-foreground">Safety:</strong> To protect the rights, property, or safety of
              Ordinary Company Group LLC, our users, or the public</li>
              <li><strong className="text-foreground">Business transfers:</strong> In connection with a merger, acquisition,
              or sale of assets, with notice to affected users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information,
              including:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li>Encryption of data in transit using TLS/SSL</li>
              <li>Secure password hashing using industry-standard algorithms</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls limiting employee access to user data</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              However, no method of transmission or storage is 100% secure. While we strive to protect your
              information, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your information for as long as your account is active or as needed to provide you services.
              You may request deletion of your account and associated data at any time. Upon account deletion:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li>Your account information will be permanently deleted</li>
              <li>Your feed subscriptions, article states, and preferences will be removed</li>
              <li>Some information may be retained in backups for a limited period</li>
              <li>We may retain certain information as required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Your Rights and Choices</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li><strong className="text-foreground">Access:</strong> Request a copy of your personal information</li>
              <li><strong className="text-foreground">Correction:</strong> Update or correct inaccurate information</li>
              <li><strong className="text-foreground">Deletion:</strong> Request deletion of your account and data</li>
              <li><strong className="text-foreground">Export:</strong> Export your feed subscriptions via OPML</li>
              <li><strong className="text-foreground">Opt-out:</strong> Unsubscribe from promotional communications</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              To exercise these rights, please contact us at{" "}
              <a href="mailto:support@cozyrss.app" className="text-accent hover:underline">
                support@cozyrss.app
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Cookies and Tracking</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use essential cookies to maintain your session and remember your preferences. We do not use
              third-party advertising cookies or tracking pixels. Our cookies are:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li><strong className="text-foreground">Session cookies:</strong> To keep you logged in</li>
              <li><strong className="text-foreground">Preference cookies:</strong> To remember your theme and display settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Service is not intended for children under 13 years of age. We do not knowingly collect
              personal information from children under 13. If you are a parent or guardian and believe your
              child has provided us with personal information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes
              by posting the new policy on this page and updating the "Last updated" date. We encourage you to
              review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="mt-4 p-4 bg-card border border-border rounded-lg">
              <p className="text-foreground font-medium">Ordinary Company Group LLC</p>
              <p className="text-muted-foreground mt-1">
                Email:{" "}
                <a href="mailto:support@cozyrss.app" className="text-accent hover:underline">
                  support@cozyrss.app
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 px-6 mt-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="text-foreground font-medium">
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
          <p className="text-xs text-muted-foreground/70 text-center mt-4">
            © {new Date().getFullYear()} Ordinary Company Group LLC
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <SystemThemeProvider>
      <PrivacyPolicyContent />
    </SystemThemeProvider>
  );
}

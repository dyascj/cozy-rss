"use client";

import { useEffect } from "react";
import Link from "next/link";
import { DoodleRss, DoodleArrowLeft } from "@/components/ui/DoodleIcon";
import { SystemThemeProvider } from "@/components/SystemThemeProvider";

function TermsOfServiceContent() {
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
          <h1 className="text-3xl font-bold text-foreground mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms of Service ("Terms") constitute a legally binding agreement between you ("you" or "User")
              and Ordinary Company Group LLC, an Ohio limited liability company ("Company," "we," "our," or "us"),
              governing your access to and use of CozyRSS (the "Service").
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to
              these Terms, you may not access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Eligibility</h2>
            <p className="text-muted-foreground leading-relaxed">
              You must be at least 13 years of age to use the Service. By using the Service, you represent and
              warrant that you are at least 13 years old and have the legal capacity to enter into these Terms.
              If you are under 18, you represent that your parent or legal guardian has reviewed and agreed to
              these Terms on your behalf.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Account Registration and Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              To use certain features of the Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized access to your account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We reserve the right to suspend or terminate accounts that violate these Terms or for any
              other reason at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              CozyRSS is an RSS feed reader service that allows users to subscribe to, organize, and read
              content from RSS and Atom feeds. The Service includes features such as feed subscription
              management, article organization, reading preferences, and content synchronization.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Acceptable Use Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li>Violate any applicable local, state, national, or international law or regulation</li>
              <li>Infringe upon the intellectual property rights of others</li>
              <li>Transmit any material that is unlawful, harmful, threatening, abusive, harassing, defamatory,
              vulgar, obscene, or otherwise objectionable</li>
              <li>Attempt to gain unauthorized access to the Service, other accounts, or computer systems</li>
              <li>Interfere with or disrupt the Service or servers connected to the Service</li>
              <li>Use automated means (bots, scrapers, etc.) to access the Service in a manner that exceeds
              reasonable use</li>
              <li>Reverse engineer, decompile, or disassemble any portion of the Service</li>
              <li>Use the Service to distribute spam, malware, or other harmful content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service, including its original content, features, and functionality, is owned by
              Ordinary Company Group LLC and is protected by United States and international copyright,
              trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You retain ownership of any content you create within the Service (such as folder names,
              tags, and organizational structures). By using the Service, you grant us a limited license
              to store, display, and process your content solely to provide the Service to you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Third-Party Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service allows you to access content from third-party RSS feeds. We do not control,
              endorse, or assume responsibility for any third-party content. Your access to and use of
              third-party content is at your own risk and subject to the terms and policies of those
              third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Payment and Subscriptions</h2>
            <p className="text-muted-foreground leading-relaxed">
              Certain features of the Service may require a paid subscription. By subscribing, you agree to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li>Pay all fees associated with your subscription plan</li>
              <li>Provide accurate billing and payment information</li>
              <li>Authorize us to charge your payment method for recurring subscription fees</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Subscriptions automatically renew unless cancelled before the renewal date. You may cancel
              your subscription at any time through your account settings. Refunds are provided at our
              discretion and in accordance with applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Disclaimer of Warranties</h2>
            <div className="bg-card border border-border rounded-lg p-4 mt-4">
              <p className="text-muted-foreground leading-relaxed uppercase text-sm">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER
                EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY,
                FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
              </p>
              <p className="text-muted-foreground leading-relaxed uppercase text-sm mt-4">
                WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE; THAT
                DEFECTS WILL BE CORRECTED; THAT THE SERVICE IS FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS;
                OR THAT THE SERVICE WILL MEET YOUR REQUIREMENTS.
              </p>
              <p className="text-muted-foreground leading-relaxed uppercase text-sm mt-4">
                YOUR USE OF THE SERVICE IS AT YOUR OWN RISK. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION
                OF IMPLIED WARRANTIES, SO SOME OF THE ABOVE EXCLUSIONS MAY NOT APPLY TO YOU.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
            <div className="bg-card border border-border rounded-lg p-4 mt-4">
              <p className="text-muted-foreground leading-relaxed uppercase text-sm">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL ORDINARY COMPANY GROUP LLC,
                ITS OFFICERS, DIRECTORS, MEMBERS, EMPLOYEES, AGENTS, PARTNERS, SUPPLIERS, OR AFFILIATES BE
                LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES,
                INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER
                INTANGIBLE LOSSES, RESULTING FROM:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3 uppercase text-sm">
                <li>YOUR ACCESS TO OR USE OF (OR INABILITY TO ACCESS OR USE) THE SERVICE</li>
                <li>ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE</li>
                <li>ANY CONTENT OBTAINED FROM THE SERVICE</li>
                <li>UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed uppercase text-sm mt-4">
                IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATING TO
                THE SERVICE EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS
                PRECEDING THE CLAIM, OR (B) ONE HUNDRED DOLLARS ($100).
              </p>
              <p className="text-muted-foreground leading-relaxed uppercase text-sm mt-4">
                SOME JURISDICTIONS DO NOT ALLOW THE LIMITATION OR EXCLUSION OF LIABILITY FOR INCIDENTAL OR
                CONSEQUENTIAL DAMAGES, SO THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify, defend, and hold harmless Ordinary Company Group LLC and its officers,
              directors, members, employees, agents, and affiliates from and against any and all claims,
              damages, obligations, losses, liabilities, costs, and expenses (including reasonable
              attorneys' fees) arising from:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights, including intellectual property rights</li>
              <li>Any content you submit, post, or transmit through the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Governing Law and Jurisdiction</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the State of Ohio,
              United States, without regard to its conflict of law provisions.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Any legal action or proceeding arising out of or relating to these Terms or the Service shall
              be brought exclusively in the state or federal courts located in Ohio, and you consent to the
              personal jurisdiction of such courts.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Dispute Resolution</h2>
            <p className="text-muted-foreground leading-relaxed">
              Before initiating any legal action, you agree to first contact us at{" "}
              <a href="mailto:support@cozyrss.app" className="text-accent hover:underline">
                support@cozyrss.app
              </a>{" "}
              and attempt to resolve the dispute informally for at least thirty (30) days.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              If informal resolution is unsuccessful, any dispute, controversy, or claim arising out of or
              relating to these Terms shall be resolved through binding arbitration in accordance with the
              rules of the American Arbitration Association, except that either party may seek injunctive
              relief in any court of competent jurisdiction.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong className="text-foreground">Class Action Waiver:</strong> You agree that any dispute
              resolution proceedings will be conducted only on an individual basis and not as a class,
              consolidated, or representative action.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Modifications to Service and Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify, suspend, or discontinue the Service (or any part thereof)
              at any time, with or without notice. We shall not be liable to you or any third party for
              any modification, suspension, or discontinuation of the Service.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We may revise these Terms from time to time. Material changes will be notified through the
              Service or via email. Your continued use of the Service after changes become effective
              constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may terminate or suspend your account and access to the Service immediately, without
              prior notice or liability, for any reason, including but not limited to breach of these Terms.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Upon termination, your right to use the Service will immediately cease. Provisions of these
              Terms that by their nature should survive termination shall survive, including but not
              limited to ownership provisions, warranty disclaimers, indemnification, and limitations of
              liability.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Force Majeure</h2>
            <p className="text-muted-foreground leading-relaxed">
              We shall not be liable for any failure or delay in performing our obligations under these
              Terms due to circumstances beyond our reasonable control, including but not limited to acts
              of God, natural disasters, war, terrorism, riots, embargoes, acts of civil or military
              authorities, fire, floods, accidents, strikes, or shortages of transportation, facilities,
              fuel, energy, labor, or materials.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Severability</h2>
            <p className="text-muted-foreground leading-relaxed">
              If any provision of these Terms is held to be invalid, illegal, or unenforceable, the
              remaining provisions shall continue in full force and effect. The invalid provision shall
              be modified to the minimum extent necessary to make it valid and enforceable while
              preserving the original intent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Entire Agreement</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you
              and Ordinary Company Group LLC regarding your use of the Service, and supersede all prior
              and contemporaneous agreements, proposals, or representations, written or oral, concerning
              the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms, please contact us:
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
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-foreground font-medium">
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

export default function TermsPage() {
  return (
    <SystemThemeProvider>
      <TermsOfServiceContent />
    </SystemThemeProvider>
  );
}

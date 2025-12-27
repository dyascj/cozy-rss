"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { OAuthButton, Provider } from "@/components/auth/OAuthButton";
import { createClient } from "@/lib/supabase/client";

function SignUpContent() {
  const searchParams = useSearchParams();
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check for error in URL (from OAuth callback)
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "auth_callback_error") {
      setError("Account creation failed. Please try again.");
    }
  }, [searchParams]);

  const handleOAuthSignUp = async (provider: Provider) => {
    setLoadingProvider(provider);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoadingProvider(null);
    }
  };

  const isLoading = loadingProvider !== null;

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start building your personal reading feed"
    >
      <div className="space-y-4">
        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Info message */}
        <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl text-sm text-foreground/80">
          Sign up securely with your existing account. We never store passwords.
        </div>

        {/* OAuth buttons */}
        <OAuthButton
          provider="github"
          isLoading={isLoading}
          loadingProvider={loadingProvider}
          onClick={handleOAuthSignUp}
        />
        {/* TODO: Add Google and Microsoft when ready for production
        <OAuthButton
          provider="google"
          isLoading={isLoading}
          loadingProvider={loadingProvider}
          onClick={handleOAuthSignUp}
        />
        <OAuthButton
          provider="azure"
          isLoading={isLoading}
          loadingProvider={loadingProvider}
          onClick={handleOAuthSignUp}
        />
        */}

        {/* Divider */}
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-card text-muted-foreground">
              Already have an account?
            </span>
          </div>
        </div>

        {/* Sign in link */}
        <Link
          href="/signin"
          className="block w-full py-3.5 text-center text-foreground font-medium bg-muted hover:bg-border rounded-xl transition-colors"
        >
          Sign in instead
        </Link>
      </div>
    </AuthLayout>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <AuthLayout title="Create your account" subtitle="Start building your personal reading feed">
        <div className="space-y-4">
          <div className="h-12 bg-muted animate-pulse rounded-xl" />
          <div className="h-12 bg-muted animate-pulse rounded-xl" />
          <div className="h-12 bg-muted animate-pulse rounded-xl" />
        </div>
      </AuthLayout>
    }>
      <SignUpContent />
    </Suspense>
  );
}

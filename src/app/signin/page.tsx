"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useAuthStore } from "@/stores/authStore";
import { DoodleLoader } from "@/components/ui/DoodleIcon";

export default function SignInPage() {
  const router = useRouter();
  const { signIn, isLoading, error, clearError } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const success = await signIn(username, password);
    if (success) {
      router.push("/");
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your reading feed"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Username field */}
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-stone-700 mb-2"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
            autoComplete="username"
            className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-400 transition-all"
          />
        </div>

        {/* Password field */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-stone-700 mb-2"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
            className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-400 transition-all"
          />
        </div>

        {/* Submit button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full py-3.5 bg-gradient-to-br from-sage-500 to-sage-600 text-white rounded-xl font-semibold shadow-lg shadow-sage-500/20 hover:shadow-xl hover:shadow-sage-500/25 focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="animate-spin">
                <DoodleLoader size="sm" />
              </span>
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </motion.button>

        {/* Divider */}
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white/80 text-stone-400">
              New to Reader?
            </span>
          </div>
        </div>

        {/* Sign up link */}
        <Link
          href="/signup"
          className="block w-full py-3.5 text-center text-stone-600 font-medium bg-stone-50 hover:bg-stone-100 rounded-xl transition-colors"
        >
          Create an account
        </Link>
      </form>
    </AuthLayout>
  );
}

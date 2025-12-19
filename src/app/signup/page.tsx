"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useAuthStore } from "@/stores/authStore";
import { DoodleLoader, DoodleCheck } from "@/components/ui/DoodleIcon";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, isLoading, error, clearError } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError("");

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters");
      return;
    }

    const success = await signUp(username, password);
    if (success) {
      // Redirect to onboarding or home
      router.push("/onboarding");
    }
  };

  const displayError = error || validationError;

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start building your personal reading feed"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error message */}
        {displayError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm"
          >
            {displayError}
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
            placeholder="Choose a username"
            required
            autoComplete="username"
            className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-400 transition-all"
          />
          <p className="mt-1.5 text-xs text-stone-400">
            Letters, numbers, underscores, and hyphens only
          </p>
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
            placeholder="Create a password"
            required
            autoComplete="new-password"
            className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-400 transition-all"
          />

          {/* Password requirements */}
          <div className="mt-3 space-y-2">
            {passwordRequirements.map((req) => (
              <div
                key={req.label}
                className="flex items-center gap-2 text-xs"
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    req.met
                      ? "bg-sage-100 text-sage-600"
                      : "bg-stone-100 text-stone-400"
                  }`}
                >
                  {req.met && <DoodleCheck size="xs" />}
                </span>
                <span
                  className={req.met ? "text-sage-600" : "text-stone-400"}
                >
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Confirm password field */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-stone-700 mb-2"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
            autoComplete="new-password"
            className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-400 transition-all"
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="mt-1.5 text-xs text-red-500">
              Passwords do not match
            </p>
          )}
          {confirmPassword && password === confirmPassword && password.length >= 8 && (
            <p className="mt-1.5 text-xs text-sage-600 flex items-center gap-1">
              <DoodleCheck size="xs" /> Passwords match
            </p>
          )}
        </div>

        {/* Submit button */}
        <motion.button
          type="submit"
          disabled={isLoading || password.length < 8 || password !== confirmPassword}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full py-3.5 bg-gradient-to-br from-sage-500 to-sage-600 text-white rounded-xl font-semibold shadow-lg shadow-sage-500/20 hover:shadow-xl hover:shadow-sage-500/25 focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="animate-spin">
                <DoodleLoader size="sm" />
              </span>
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </motion.button>

        {/* Divider */}
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white/80 text-stone-400">
              Already have an account?
            </span>
          </div>
        </div>

        {/* Sign in link */}
        <Link
          href="/signin"
          className="block w-full py-3.5 text-center text-stone-600 font-medium bg-stone-50 hover:bg-stone-100 rounded-xl transition-colors"
        >
          Sign in instead
        </Link>
      </form>
    </AuthLayout>
  );
}

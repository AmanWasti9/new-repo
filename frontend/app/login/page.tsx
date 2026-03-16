"use client";

import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/service/auth";
import Link from "next/link";
import { useState } from "react";
import { PublicRoute } from "../components/PublicRoute";

function LoginContent() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 6;
  const isFormValid = email && password && isEmailValid && isPasswordValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isFormValid) {
      setError("Please enter valid email and password (minimum 6 characters)");
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.login({ email, password });
      console.log("login response raw:", response);
      const token = response?.data?.access_token;
      const refreshToken = response?.data?.refresh_token;
      console.log(
        `[auth] ${new Date().toISOString()} - login issued access & refresh tokens`,
      );

      console.log("Decoded token:", token);
      // console.log("Decoded role raw:", user?.role);
      console.log("Decoded refresh token:", refreshToken);

      if (token && refreshToken) {
        login(token, refreshToken);
      } else {
        setError("Invalid login response");
      }
    } catch (err: any) {
      console.error("login error:", err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F2F2] px-4 py-8">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
        <div className="mb-8 text-center">
          <h1 className="text-black text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-blue-300 text-sm">Sign in to your account</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Email <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                placeholder="you@example.com"
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched({ ...touched, email: true })}
                className={`w-full px-4 py-3 border-b-2 transition-all duration-300 focus:outline-none ${
                  touched.email && email
                    ? isEmailValid
                      ? "border-green-400 focus:border-green-400"
                      : "border-red-400 focus:border-red-400"
                    : "border-gray-500 focus:border-[#007BFF]"
                }`}
              />
              {touched.email && email && (
                <span
                  className={`absolute right-3 top-3 text-lg ${isEmailValid ? "text-green-400" : "text-red-400"}`}
                >
                  {isEmailValid ? "✓" : "✕"}
                </span>
              )}
            </div>
            {touched.email && email && !isEmailValid && (
              <p className="text-red-400 text-xs mt-1">
                Please enter a valid email
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched({ ...touched, password: true })}
                className={`w-full px-4 py-3 border-b-2 transition-all duration-300 focus:outline-none ${
                  touched.password && password
                    ? isPasswordValid
                      ? "border-green-400 focus:border-green-400"
                      : "border-red-400 focus:border-red-400"
                    : "border-gray-500 focus:border-[#007BFF]"
                }`}
              />
              {touched.password && password && (
                <span
                  className={`absolute right-3 top-3 text-lg ${isPasswordValid ? "text-green-400" : "text-red-400"}`}
                >
                  {isPasswordValid ? "✓" : "✕"}
                </span>
              )}
            </div>
            {touched.password && password && !isPasswordValid && (
              <p className="text-red-400 text-xs mt-1">
                Password must be at least 6 characters
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-300 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="cursor-pointer w-full bg-blue-700 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-[#F2F2F2] font-semibold py-3 rounded-lg transition duration-300 shadow-lg hover:shadow-xl mt-8"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-black text-sm">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="cursor-pointer text-blue-700 font-semibold hover:text-blue-600 transition"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

const LoginPage: React.FC = () => {
  return (
    <PublicRoute>
      <LoginContent />
    </PublicRoute>
  );
};

export default LoginPage;

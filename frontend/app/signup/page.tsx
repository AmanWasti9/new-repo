"use client";

import { authApi } from "@/service/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PublicRoute } from "../components/PublicRoute";

function SignUpContent() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    role: false,
  });

  const isNameValid = name.trim().length >= 2;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isRoleSelected = role !== "";
  const isFormValid = isNameValid && isEmailValid && isRoleSelected;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isFormValid) {
      setError("Please fill all fields correctly");
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.register({
        name: name.trim(),
        email,
        password,
        role: role.toUpperCase(),
      });

      if (response.success) {
        // Reset form
        setName("");
        setEmail("");
        setPassword("");
        setRole("");
        router.push("/login");
      } else {
        setError(response.message || "Signup failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F2F2] px-4 py-8">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
        <div className="mb-8 text-center">
          <h1 className="text-black text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-blue-300 text-sm">Join us to get started</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Full Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched({ ...touched, name: true })}
                placeholder="John Doe"
                className={`w-full text-black px-4 py-3 bg-white/5 border-b-2 transition-all duration-300 focus:outline-none ${
                  touched.name && name
                    ? isNameValid
                      ? "border-green-400 focus:border-green-400"
                      : "border-red-400 focus:border-red-400"
                    : "border-gray-500 focus:border-[#007BFF]"
                }`}
              />
              {touched.name && name && (
                <span
                  className={`absolute right-3 top-3 text-lg ${isNameValid ? "text-green-400" : "text-red-400"}`}
                >
                  {isNameValid ? "✓" : "✕"}
                </span>
              )}
            </div>
            {touched.name && name && !isNameValid && (
              <p className="text-red-400 text-xs mt-1">
                Name must be at least 2 characters
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Email <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched({ ...touched, email: true })}
                placeholder="you@example.com"
                className={`w-full text-black px-4 py-3 bg-white/5 border-b-2 transition-all duration-300 focus:outline-none ${
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full text-black px-4 py-3 bg-white/5 border-b-2 border-gray-500 transition-all duration-300 focus:outline-none focus:border-[#007BFF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Role <span className="text-red-400">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              onBlur={() => setTouched({ ...touched, role: true })}
              className={`w-full px-4 py-3 border-b-2 transition-all duration-300 focus:outline-none text-black ${
                touched.role && role
                  ? "border-green-400 focus:border-green-400"
                  : "border-gray-500 focus:border-[#007BFF]"
              } appearance-none`}
            >
              <option value="" disabled>
                Select your role
              </option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-300 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
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
                Creating Account...
              </span>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-black text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="cursor-pointer text-blue-700 font-semibold hover:text-blue-600 transition"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

const SignUpPage: React.FC = () => {
  return (
    <PublicRoute>
      <SignUpContent />
    </PublicRoute>
  );
};

export default SignUpPage;

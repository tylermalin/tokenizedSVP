import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Register() {
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get("token");
  const invitationEmail = searchParams.get("email");

  const [email, setEmail] = useState(invitationEmail || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"manager" | "investor">("investor");
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If invitation token is present, force role to investor
    if (invitationToken) {
      setRole("investor");
    }
  }, [invitationToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await register(email, password, role, invitationToken || undefined);
      navigate("/app/dashboard");
    } catch (err: any) {
      const errorMessage =
        typeof err?.response?.data?.error === "string"
          ? err.response.data.error
          : typeof err?.response?.data?.message === "string"
          ? err.response.data.message
          : err?.message || "Registration failed";
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {invitationToken
              ? "Complete Your Registration"
              : "Create your account"}
          </h2>
          {invitationToken && (
            <p className="mt-2 text-center text-sm text-gray-600">
              You've been invited to invest. Complete your registration to
              proceed.
            </p>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {!invitationToken && (
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700"
                >
                  I am a
                </label>
                <select
                  id="role"
                  name="role"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value as "manager" | "investor")
                  }
                >
                  <option value="investor">Investor</option>
                  <option value="manager">Fund Manager</option>
                </select>
              </div>
            )}
            {invitationToken && (
              <input type="hidden" name="role" value="investor" />
            )}
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

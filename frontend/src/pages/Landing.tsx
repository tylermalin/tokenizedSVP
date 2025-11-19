import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Building2,
  Shield,
  TrendingUp,
  Users,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Zap,
  Globe,
  Lock,
} from "lucide-react";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already logged in (use useEffect to avoid render-time navigation)
  useEffect(() => {
    if (user) {
      navigate("/app/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                SPV Platform
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                How It Works
              </a>
              <button
                onClick={() => setShowLoginModal(true)}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Get Early Access
              </button>
            </div>
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-4 space-y-4">
              <a href="#features" className="block text-gray-600">
                Features
              </a>
              <a href="#how-it-works" className="block text-gray-600">
                How It Works
              </a>
              <button
                onClick={() => {
                  setShowLoginModal(true);
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left text-gray-600"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setShowRegisterModal(true);
                  setMobileMenuOpen(false);
                }}
                className="block w-full px-4 py-2 bg-primary-600 text-white rounded-lg text-center"
              >
                Get Early Access
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-50 border border-primary-100 mb-8">
              <Zap className="h-4 w-4 text-primary-600 mr-2" />
              <span className="text-sm font-medium text-primary-700">
                Beta Access Now Available
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Tokenize Your
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 bg-clip-text text-transparent">
                SPV Investments
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              The next-generation platform for creating, managing, and investing
              in Special Purpose Vehicles. Built for fund managers and
              accredited investors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setShowRegisterModal(true)}
                className="group px-8 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center"
              >
                Get Early Access
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-8 py-4 bg-white text-gray-900 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 font-semibold text-lg"
              >
                Sign In
              </button>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              Join leading fund managers and investors already on the platform
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to
              <br />
              <span className="text-primary-600">Launch & Manage SPVs</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful tools designed for modern fund managers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Building2 className="h-8 w-8" />}
              title="SPV Creation"
              description="Create and configure SPVs in minutes. Set fundraising targets, fee structures, and terms with our intuitive interface."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="KYC/AML Compliance"
              description="Built-in Sumsub integration for seamless identity verification. Automated compliance checks for all participants."
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="Real-Time Analytics"
              description="Track fundraising progress, investor activity, and fund performance with comprehensive dashboards."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Investor Onboarding"
              description="Streamlined invitation system. Investors can register, complete KYC, and subscribe in minutes."
            />
            <FeatureCard
              icon={<Globe className="h-8 w-8" />}
              title="Blockchain Integration"
              description="Tokenized LP interests on Ethereum. Transfer restrictions, whitelisting, and compliance built-in."
            />
            <FeatureCard
              icon={<Lock className="h-8 w-8" />}
              title="Secure & Compliant"
              description="Enterprise-grade security with admin review workflows. Full audit trails for all transactions."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From fund creation to investor onboarding in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <StepCard
              number="1"
              title="Create Your Fund"
              description="Set up your SPV with target amount, fees, and terms. Our platform handles all the documentation."
            />
            <StepCard
              number="2"
              title="Invite Investors"
              description="Send secure invitation links to accredited investors. They complete KYC and subscribe digitally."
            />
            <StepCard
              number="3"
              title="Go Live & Manage"
              description="After admin approval, your fund goes live. Track subscriptions, manage distributions, and more."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your
            <br />
            Fund Management?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join the beta and get early access to the future of SPV management
          </p>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-8 py-4 bg-white text-primary-600 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center mx-auto"
          >
            Get Early Access
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
          <p className="mt-6 text-sm text-primary-200">
            No credit card required • Free during beta
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Building2 className="h-6 w-6 text-primary-600" />
              <span className="ml-2 text-lg font-bold text-gray-900">
                SPV Platform
              </span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900">
                Privacy
              </a>
              <a href="#" className="hover:text-gray-900">
                Terms
              </a>
              <a href="#" className="hover:text-gray-900">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-500">
            © 2024 SPV Platform. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSwitchToRegister={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
        />
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      )}
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="text-primary-600 mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 text-2xl font-bold mb-6">
        {number}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function LoginModal({
  onClose,
  onSwitchToRegister,
}: {
  onClose: () => void;
  onSwitchToRegister: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      onClose();
      navigate("/app/dashboard");
    } catch (err: any) {
      const errorMessage =
        typeof err?.response?.data?.error === "string"
          ? err.response.data.error
          : typeof err?.response?.data?.message === "string"
          ? err.response.data.message
          : err?.message || "Login failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-600 mb-6">Sign in to your account</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <button
            onClick={onSwitchToRegister}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Get Early Access
          </button>
        </p>
      </div>
    </div>
  );
}

function RegisterModal({
  onClose,
  onSwitchToLogin,
}: {
  onClose: () => void;
  onSwitchToLogin: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"manager" | "investor">("investor");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email, password, role);
      onClose();
      navigate("/app/dashboard");
    } catch (err: any) {
      const errorMessage =
        typeof err?.response?.data?.error === "string"
          ? err.response.data.error
          : typeof err?.response?.data?.message === "string"
          ? err.response.data.message
          : err?.message || "Registration failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>
        <div className="mb-6">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-50 border border-primary-100 mb-4">
            <Zap className="h-3 w-3 text-primary-600 mr-2" />
            <span className="text-xs font-medium text-primary-700">
              Beta Access
            </span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Get Early Access
          </h2>
          <p className="text-gray-600">Join the future of SPV management</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Minimum 8 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I am a
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("investor")}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  role === "investor"
                    ? "border-primary-500 bg-primary-50 text-primary-700 font-medium"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                Investor
              </button>
              <button
                type="button"
                onClick={() => setRole("manager")}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  role === "manager"
                    ? "border-primary-500 bg-primary-50 text-primary-700 font-medium"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                Fund Manager
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? "Creating Account..." : "Get Early Access"}
            {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign In
          </button>
        </p>
        <p className="mt-4 text-xs text-center text-gray-500">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { SPV } from "../types";
import {
  Building2,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Wallet,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import ManagerDashboard from "./ManagerDashboard";

interface InvestorProfile {
  kycStatus: string;
  amlStatus: string;
  walletAddress?: string;
}

interface TokenHolding {
  spvId: string;
  spvName: string;
  spvType: string;
  spvStatus: string;
  tokenBalance: number;
  onChainBalance: number;
}

export default function Dashboard() {
  const { user } = useAuth();

  // Show manager dashboard for managers
  if (user?.role === "manager") {
    return <ManagerDashboard />;
  }

  const [spvs, setSpvs] = useState<SPV[]>([]);
  const [investorProfile, setInvestorProfile] =
    useState<InvestorProfile | null>(null);
  const [tokenHoldings, setTokenHoldings] = useState<TokenHolding[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [spvsResponse, profileResponse, holdingsResponse, subscriptionsResponse] =
        await Promise.all([
          api.get("/spvs").catch(() => ({ data: [] })),
          api.get("/investors/me").catch(() => ({ data: null })),
          api.get("/investors/me/tokens").catch(() => ({ data: [] })),
          api.get("/investors/me/subscriptions").catch(() => ({ data: [] })),
        ]);

      setSpvs(spvsResponse.data);
      setInvestorProfile(profileResponse.data);
      setTokenHoldings(holdingsResponse.data);
      setSubscriptions(subscriptionsResponse.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="px-4 py-6 sm:px-0">Loading...</div>;
  }

  const fundraisingSPVs = spvs.filter((s) => s.status === "fundraising");
  const totalInvested = tokenHoldings.reduce(
    (sum, h) => sum + h.tokenBalance,
    0
  );
  const activeInvestments = tokenHoldings.filter(
    (h) => h.spvStatus === "active" || h.spvStatus === "fundraising"
  ).length;
  const pendingSubscriptions = subscriptions.filter(
    (s) => s.status === "pending" || s.status === "funded"
  );
  const kycComplete =
    investorProfile?.kycStatus === "verified" &&
    investorProfile?.amlStatus === "cleared";

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Next Steps Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h2>
        <div className="space-y-3">
          {!kycComplete && (
            <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    Complete KYC Verification
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    {investorProfile?.kycStatus === "pending" ||
                    investorProfile?.amlStatus === "pending"
                      ? "Verify your identity to start investing"
                      : "KYC verification required"}
                  </p>
                </div>
              </div>
              <Link
                to="/app/kyc"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-yellow-900 bg-yellow-100 rounded-md hover:bg-yellow-200"
              >
                Verify Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          )}

          {kycComplete && fundraisingSPVs.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Explore Investment Opportunities
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {fundraisingSPVs.length} SPV
                    {fundraisingSPVs.length !== 1 ? "s" : ""} currently
                    fundraising
                  </p>
                </div>
              </div>
              <Link
                to="/app/spvs"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 rounded-md hover:bg-blue-200"
              >
                Browse SPVs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          )}

          {pendingSubscriptions.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-orange-900">
                    Pending Subscriptions
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    {pendingSubscriptions.length} subscription
                    {pendingSubscriptions.length !== 1 ? "s" : ""} awaiting
                    processing
                  </p>
                </div>
              </div>
              <Link
                to="/app/subscriptions"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-orange-900 bg-orange-100 rounded-md hover:bg-orange-200"
              >
                View Subscriptions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          )}

          {activeInvestments > 0 && (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <Wallet className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    View Your Portfolio
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    {activeInvestments} active investment
                    {activeInvestments !== 1 ? "s" : ""} • $
                    {totalInvested.toLocaleString()} invested
                  </p>
                </div>
              </div>
              <Link
                to="/app/portfolio"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-900 bg-green-100 rounded-md hover:bg-green-200"
              >
                View Portfolio
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          )}

          {kycComplete &&
            fundraisingSPVs.length === 0 &&
            activeInvestments === 0 && (
              <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      All Set!
                    </p>
                    <p className="text-xs text-gray-700 mt-1">
                      No action items at this time
                    </p>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total SPVs
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {spvs.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active SPVs
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {spvs.filter((s) => s.status === "active").length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Wallet className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    My Investments
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {activeInvestments}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {spvs.map((spv) => (
            <li key={spv.id}>
              <Link
                to={`/app/spvs/${spv.id}`}
                className="block hover:bg-gray-50"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary-600 truncate">
                      {spv.name}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          spv.status === "active"
                            ? "bg-green-100 text-green-800"
                            : spv.status === "fundraising"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {spv.status}
                      </span>
                    </div>
                  </div>
                  {spv.status === "fundraising" && spv.targetAmount && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>
                          ${(spv.currentNAV || 0).toLocaleString()} / $
                          {spv.targetAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${
                              Math.min(
                                ((spv.currentNAV || 0) / spv.targetAmount) * 100,
                                100
                              )
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        Type: {spv.type.replace("_", " ")}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        Created: {new Date(spv.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

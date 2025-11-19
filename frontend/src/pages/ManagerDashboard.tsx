import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import {
  Building2,
  Plus,
  TrendingUp,
  DollarSign,
  Users,
  FileText,
  Shield,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Clock,
} from "lucide-react";

interface FundraisingInfo {
  summary: {
    totalSPVs: number;
    totalRaised: number;
    totalTarget: number;
    fundingProgress: number;
    totalInvestors: number;
    activeSPVs: number;
    pendingSubscriptions: number;
    completedSubscriptions: number;
  };
  spvs: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    targetAmount: number;
    raised: number;
    investors: number;
  }>;
  recentSubscriptions: Array<{
    id: string;
    spvName: string;
    amount: number;
    status: string;
    createdAt: string;
    investor: {
      email: string;
      kycStatus: string;
      amlStatus: string;
    };
  }>;
}

interface ManagerProfile {
  kycStatus: string;
  amlStatus: string;
  adminKycStatus?: string;
}

export default function ManagerDashboard() {
  const [fundraisingInfo, setFundraisingInfo] =
    useState<FundraisingInfo | null>(null);
  const [managerProfile, setManagerProfile] = useState<ManagerProfile | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [fundraisingResponse, profileResponse] = await Promise.all([
        api.get("/managers/fundraising").catch(() => ({ data: null })),
        api.get("/managers/me").catch(() => ({ data: null })),
      ]);

      setFundraisingInfo(fundraisingResponse.data);
      setManagerProfile(profileResponse.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="px-4 py-6 sm:px-0">Loading...</div>;
  }

  if (!fundraisingInfo) {
    return <div className="px-4 py-6 sm:px-0">Failed to load data</div>;
  }

  const { summary, spvs, recentSubscriptions } = fundraisingInfo;
  const configuringSPVs = spvs.filter((s) => s.status === "configuring");
  const pendingApprovalSPVs = spvs.filter((s) => s.status === "configuring");
  const kycComplete =
    managerProfile?.kycStatus === "verified" &&
    managerProfile?.amlStatus === "cleared";
  const adminKycApproved = managerProfile?.adminKycStatus === "approved";

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
        <Link
          to="/app/spvs/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create SPV
        </Link>
      </div>

      {/* Next Steps Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h2>
        <div className="space-y-3">
          {(!kycComplete || !adminKycApproved) && (
            <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    Complete KYC Verification
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    {!kycComplete
                      ? "Complete identity verification to create SPVs"
                      : !adminKycApproved
                      ? "Waiting for admin approval of your KYC"
                      : "KYC verification required"}
                  </p>
                </div>
              </div>
              <Link
                to="/app/manager/kyc"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-yellow-900 bg-yellow-100 rounded-md hover:bg-yellow-200"
              >
                {!kycComplete ? "Verify Now" : "View Status"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          )}

          {configuringSPVs.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Complete SPV Configuration
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {configuringSPVs.length} SPV
                    {configuringSPVs.length !== 1 ? "s" : ""} awaiting
                    configuration
                  </p>
                </div>
              </div>
              <Link
                to={`/app/spvs/${configuringSPVs[0].id}`}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 rounded-md hover:bg-blue-200"
              >
                Review SPV
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          )}

          {pendingApprovalSPVs.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-orange-900">
                    Pending Admin Approval
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    {pendingApprovalSPVs.length} SPV
                    {pendingApprovalSPVs.length !== 1 ? "s" : ""} awaiting admin
                    review
                  </p>
                </div>
              </div>
            </div>
          )}

          {summary.activeSPVs > 0 && (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Active Fundraising
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    {summary.activeSPVs} active SPV
                    {summary.activeSPVs !== 1 ? "s" : ""} • $
                    {summary.totalRaised.toLocaleString()} raised
                  </p>
                </div>
              </div>
              <Link
                to="/app/manager/fundraising"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-900 bg-green-100 rounded-md hover:bg-green-200"
              >
                View Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          )}

          {kycComplete &&
            adminKycApproved &&
            configuringSPVs.length === 0 &&
            pendingApprovalSPVs.length === 0 &&
            summary.activeSPVs === 0 && (
              <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      All Set!
                    </p>
                    <p className="text-xs text-gray-700 mt-1">
                      Ready to create your first SPV
                    </p>
                  </div>
                </div>
                <Link
                  to="/app/spvs/create"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Create SPV
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                    {summary.totalSPVs}
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
                <DollarSign className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Raised
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    $
                    {summary.totalRaised.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
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
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Investors
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {summary.totalInvestors}
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
                    Funding Progress
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {summary.fundingProgress.toFixed(1)}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SPVs List */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your SPVs</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {spvs.length === 0 ? (
              <li className="px-4 py-6 text-center text-gray-500">
                No SPVs created yet.{" "}
                <Link
                  to="/app/spvs/create"
                  className="text-primary-600 hover:text-primary-700"
                >
                  Create your first SPV
                </Link>
              </li>
            ) : (
              spvs.map((spv) => (
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
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex space-x-4">
                          <p className="flex items-center text-sm text-gray-500">
                            Type: {spv.type.replace("_", " ")}
                          </p>
                          <p className="flex items-center text-sm text-gray-500">
                            Investors: {spv.investors}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            ${spv.raised.toLocaleString()} / $
                            {spv.targetAmount?.toLocaleString() || "N/A"}
                          </p>
                        </div>
                      </div>
                      {spv.targetAmount && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{
                                width: `${
                                  (spv.raised / spv.targetAmount) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Recent Subscriptions */}
      {recentSubscriptions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Subscriptions
          </h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {recentSubscriptions.map((sub) => (
                <li key={sub.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {sub.spvName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {sub.investor.email}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ${sub.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(sub.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          sub.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : sub.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

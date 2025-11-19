import { useEffect, useState } from "react";
import { api } from "../services/api";
import {
  Building2,
  Users,
  Briefcase,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardData {
  pendingInvestorKYC: Array<{
    id: string;
    userId: string;
    email: string;
    kycStatus: string;
    amlStatus: string;
    jurisdiction?: string;
    sumsubApplicantId?: string;
    createdAt: string;
    updatedAt: string;
  }>;
  pendingManagerKYC: Array<{
    id: string;
    userId: string;
    email: string;
    kycStatus: string;
    amlStatus: string;
    companyName?: string;
    jurisdiction?: string;
    sumsubApplicantId?: string;
    createdAt: string;
    updatedAt: string;
  }>;
  pendingSPVs: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    managerEmail: string;
    targetAmount?: number;
    fundraisingStart: string;
    fundraisingEnd: string;
    createdAt: string;
    updatedAt: string;
  }>;
  spvsChangesRequested: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    managerEmail: string;
    adminNotes?: string;
    updatedAt: string;
  }>;
  summary: {
    pendingInvestorKYC: number;
    pendingManagerKYC: number;
    pendingSPVs: number;
    spvsChangesRequested: number;
    pendingAccounts: number;
  };
  pendingAccounts?: Array<{
    id: string;
    email: string;
    role: string;
    createdAt: string;
    kycStatus: string;
    amlStatus: string;
  }>;
}

export default function AdminPanel() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "investors"
    | "managers"
    | "spvs"
    | "accounts"
    | "active-projects"
  >("overview");
  const [activeSPVs, setActiveSPVs] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get("/admin/dashboard");
      setDashboard(response.data);
    } catch (error) {
      console.error("Failed to fetch admin dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveSPVs = async () => {
    try {
      const response = await api.get("/admin/spvs/active");
      setActiveSPVs(response.data);
    } catch (error) {
      console.error("Failed to fetch active SPVs:", error);
    }
  };

  const handleApproveAccount = async (
    userId: string,
    action: "approve" | "reject",
    rejectionReason?: string
  ) => {
    try {
      await api.post(`/admin/accounts/${userId}/approve`, {
        action,
        rejectionReason,
      });
      fetchDashboard();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to update account status");
    }
  };

  const handleOverrideKYC = async (
    entityId: string,
    entityType: "investor" | "manager",
    action: "approve" | "reject",
    notes?: string
  ) => {
    try {
      const endpoint =
        entityType === "investor"
          ? `/admin/kyc/investor/${entityId}/override`
          : `/admin/kyc/manager/${entityId}/override`;
      await api.post(endpoint, { action, notes });
      fetchDashboard();
      alert(
        `KYC ${action === "approve" ? "approved" : "rejected"} successfully`
      );
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to override KYC");
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalPending =
    (dashboard?.summary?.pendingInvestorKYC || 0) +
    (dashboard?.summary?.pendingManagerKYC || 0) +
    (dashboard?.summary?.pendingSPVs || 0);
  const hasUrgentItems = (dashboard?.spvsChangesRequested?.length || 0) > 0;

  if (!dashboard) {
    return <div className="px-4 py-6 sm:px-0">Failed to load dashboard</div>;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Review and approve KYC verifications and SPV fundraisings
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Investor KYC
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {dashboard.summary.pendingInvestorKYC}
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
                <Briefcase className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Manager KYC
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {dashboard.summary.pendingManagerKYC}
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
                <Building2 className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending SPV Approvals
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {dashboard.summary.pendingSPVs}
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
                <AlertCircle className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Changes Requested
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {dashboard.summary.spvsChangesRequested}
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
                <Users className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Accounts
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {dashboard.summary.pendingAccounts || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h2>
        <div className="space-y-3">
          {totalPending > 0 && (
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Pending Reviews
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {totalPending} item{totalPending !== 1 ? "s" : ""} awaiting
                    your review
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                {(dashboard?.summary?.pendingInvestorKYC || 0) > 0 && (
                  <button
                    onClick={() => setActiveTab("investors")}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-900 bg-blue-100 rounded-md hover:bg-blue-200"
                  >
                    Review Investors
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </button>
                )}
                {(dashboard?.summary?.pendingSPVs || 0) > 0 && (
                  <button
                    onClick={() => setActiveTab("spvs")}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-900 bg-blue-100 rounded-md hover:bg-blue-200"
                  >
                    Review SPVs
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {hasUrgentItems && (
            <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-orange-900">
                    Changes Requested
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    {dashboard?.spvsChangesRequested?.length || 0} SPV
                    {(dashboard?.spvsChangesRequested?.length || 0) !== 1
                      ? "s"
                      : ""}{" "}
                    need updates
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("spvs")}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-orange-900 bg-orange-100 rounded-md hover:bg-orange-200"
              >
                Review Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          )}

          {(dashboard?.summary?.pendingManagerKYC || 0) > 0 && (
            <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-purple-900">
                    Manager KYC Reviews
                  </p>
                  <p className="text-xs text-purple-700 mt-1">
                    {dashboard?.summary?.pendingManagerKYC || 0} manager
                    {(dashboard?.summary?.pendingManagerKYC || 0) !== 1
                      ? "s"
                      : ""}{" "}
                    awaiting approval
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("managers")}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-purple-900 bg-purple-100 rounded-md hover:bg-purple-200"
              >
                Review Managers
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          )}

          {totalPending === 0 && !hasUrgentItems && (
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-gray-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    All Caught Up!
                  </p>
                  <p className="text-xs text-gray-700 mt-1">
                    No pending reviews at this time
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`${
              activeTab === "overview"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("investors")}
            className={`${
              activeTab === "investors"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Investor KYC ({dashboard.summary.pendingInvestorKYC})
          </button>
          <button
            onClick={() => setActiveTab("managers")}
            className={`${
              activeTab === "managers"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Manager KYC ({dashboard.summary.pendingManagerKYC})
          </button>
          <button
            onClick={() => setActiveTab("spvs")}
            className={`${
              activeTab === "spvs"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            SPV Approvals ({dashboard.summary.pendingSPVs})
          </button>
          <button
            onClick={() => setActiveTab("accounts")}
            className={`${
              activeTab === "accounts"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Account Approvals ({dashboard.summary.pendingAccounts || 0})
          </button>
          <button
            onClick={() => {
              setActiveTab("active-projects");
              fetchActiveSPVs();
            }}
            className={`${
              activeTab === "active-projects"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Active Projects
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Pending Investor KYC */}
          {dashboard.pendingInvestorKYC.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Pending Investor KYC Reviews
              </h2>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {dashboard.pendingInvestorKYC.map((investor) => (
                    <li key={investor.id}>
                      <Link
                        to={`/app/admin/reviews/investor/${investor.id}`}
                        className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-primary-600">
                              {investor.email}
                            </p>
                            <p className="text-sm text-gray-500">
                              KYC: {investor.kycStatus} | AML:{" "}
                              {investor.amlStatus}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                            <span className="text-sm text-gray-500">
                              {new Date(
                                investor.updatedAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Pending Manager KYC */}
          {dashboard.pendingManagerKYC.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Pending Manager KYC Reviews
              </h2>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {dashboard.pendingManagerKYC.map((manager) => (
                    <li key={manager.id}>
                      <Link
                        to={`/app/admin/reviews/manager/${manager.userId}`}
                        className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-primary-600">
                              {manager.email}
                            </p>
                            <p className="text-sm text-gray-500">
                              {manager.companyName || "No company name"} | KYC:{" "}
                              {manager.kycStatus} | AML: {manager.amlStatus}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                            <span className="text-sm text-gray-500">
                              {new Date(manager.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Pending SPVs */}
          {dashboard.pendingSPVs.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Pending SPV Approvals
              </h2>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {dashboard.pendingSPVs.map((spv) => (
                    <li key={spv.id}>
                      <Link
                        to={`/app/admin/reviews/spv/${spv.id}`}
                        className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-primary-600">
                              {spv.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Manager: {spv.managerEmail} | Type: {spv.type} |
                              Target: $
                              {spv.targetAmount?.toLocaleString() || "N/A"}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                            <span className="text-sm text-gray-500">
                              {new Date(spv.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Changes Requested */}
          {dashboard.spvsChangesRequested.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                SPVs with Changes Requested
              </h2>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {dashboard.spvsChangesRequested.map((spv) => (
                    <li key={spv.id}>
                      <Link
                        to={`/app/admin/reviews/spv/${spv.id}`}
                        className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-primary-600">
                              {spv.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {spv.adminNotes}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                            <span className="text-sm text-gray-500">
                              {new Date(spv.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {dashboard.summary.pendingInvestorKYC === 0 &&
            dashboard.summary.pendingManagerKYC === 0 &&
            dashboard.summary.pendingSPVs === 0 &&
            dashboard.summary.spvsChangesRequested === 0 && (
              <div className="bg-white shadow rounded-lg p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  All Clear!
                </h3>
                <p className="text-sm text-gray-500">
                  No pending reviews at this time.
                </p>
              </div>
            )}
        </div>
      )}

      {activeTab === "investors" && (
        <InvestorKYCList investors={dashboard.pendingInvestorKYC} />
      )}

      {activeTab === "managers" && (
        <ManagerKYCList managers={dashboard.pendingManagerKYC} />
      )}

      {activeTab === "spvs" && <SPVApprovalList spvs={dashboard.pendingSPVs} />}

      {activeTab === "accounts" && (
        <AccountApprovalList
          accounts={dashboard.pendingAccounts || []}
          onApprove={handleApproveAccount}
          onOverrideKYC={handleOverrideKYC}
        />
      )}

      {activeTab === "active-projects" && (
        <ActiveProjectsList spvs={activeSPVs} />
      )}
    </div>
  );
}

function AccountApprovalList({
  accounts,
  onApprove,
  onOverrideKYC,
}: {
  accounts: DashboardData["pendingAccounts"];
  onApprove: (
    userId: string,
    action: "approve" | "reject",
    reason?: string
  ) => void;
  onOverrideKYC: (
    entityId: string,
    entityType: "investor" | "manager",
    action: "approve" | "reject",
    notes?: string
  ) => void;
}) {
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  if (!accounts || accounts.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <p className="text-sm text-gray-500">No pending account approvals</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {accounts.map((account) => (
          <li key={account.id} className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {account.email}
                </p>
                <p className="text-sm text-gray-500">
                  Role: {account.role} | KYC: {account.kycStatus} | AML:{" "}
                  {account.amlStatus}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Created: {new Date(account.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {rejectingUserId === account.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Rejection reason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    />
                    <button
                      onClick={() => {
                        onApprove(account.id, "reject", rejectionReason);
                        setRejectingUserId(null);
                        setRejectionReason("");
                      }}
                      className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => {
                        setRejectingUserId(null);
                        setRejectionReason("");
                      }}
                      className="text-sm px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => onApprove(account.id, "approve")}
                      className="text-sm px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectingUserId(account.id)}
                      className="text-sm px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                    {account.role === "investor" && (
                      <button
                        onClick={() =>
                          onOverrideKYC(
                            account.id,
                            "investor",
                            "approve",
                            "Admin override"
                          )
                        }
                        className="text-sm px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        title="Override KYC without Sumsub"
                      >
                        Override KYC
                      </button>
                    )}
                    {account.role === "manager" && (
                      <button
                        onClick={() =>
                          onOverrideKYC(
                            account.id,
                            "manager",
                            "approve",
                            "Admin override"
                          )
                        }
                        className="text-sm px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        title="Override KYC without Sumsub"
                      >
                        Override KYC
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ActiveProjectsList({ spvs }: { spvs: any[] }) {
  if (spvs.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-sm text-gray-500">No active projects</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {spvs.map((spv) => (
        <div key={spv.id} className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {spv.name}
              </h3>
              <p className="text-sm text-gray-500">
                Manager: {spv.managerEmail} | Type: {spv.type.replace("_", " ")}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  spv.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {spv.status}
              </span>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  spv.adminStatus === "approved"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {spv.adminStatus}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500">Target Amount</p>
              <p className="text-sm font-semibold">
                ${spv.targetAmount?.toLocaleString() || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Raised</p>
              <p className="text-sm font-semibold">
                ${spv.totalRaised.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Funding Progress</p>
              <p className="text-sm font-semibold">
                {spv.fundingProgress.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Investors</p>
              <p className="text-sm font-semibold">{spv.totalInvestors}</p>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Funding Progress</span>
              <span>{spv.fundingProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full"
                style={{ width: `${Math.min(spv.fundingProgress, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Subscriptions</p>
                <p className="font-semibold">{spv.subscriptions.total}</p>
              </div>
              <div>
                <p className="text-gray-500">Completed</p>
                <p className="font-semibold text-green-600">
                  {spv.subscriptions.completed}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Pending</p>
                <p className="font-semibold text-yellow-600">
                  {spv.subscriptions.pending}
                </p>
              </div>
            </div>
          </div>

          {spv.currentNAV && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Current NAV: ${spv.currentNAV.toLocaleString()}
                {spv.navUpdatedAt && (
                  <span className="ml-2">
                    (Updated: {new Date(spv.navUpdatedAt).toLocaleDateString()})
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function InvestorKYCList({
  investors,
}: {
  investors: DashboardData["pendingInvestorKYC"];
}) {
  if (investors.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <p className="text-sm text-gray-500">No pending investor KYC reviews</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {investors.map((investor) => (
          <li key={investor.id}>
            <Link
              to={`/app/admin/reviews/investor/${investor.id}`}
              className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-600">
                    {investor.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    KYC: {investor.kycStatus} | AML: {investor.amlStatus}
                    {investor.jurisdiction && ` | ${investor.jurisdiction}`}
                  </p>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-500">
                    {new Date(investor.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ManagerKYCList({
  managers,
}: {
  managers: DashboardData["pendingManagerKYC"];
}) {
  if (managers.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <p className="text-sm text-gray-500">No pending manager KYC reviews</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {managers.map((manager) => (
          <li key={manager.id}>
            <Link
              to={`/app/admin/reviews/manager/${manager.userId}`}
              className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-600">
                    {manager.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    {manager.companyName || "No company"} | KYC:{" "}
                    {manager.kycStatus} | AML: {manager.amlStatus}
                  </p>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-500">
                    {new Date(manager.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SPVApprovalList({ spvs }: { spvs: DashboardData["pendingSPVs"] }) {
  if (spvs.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <p className="text-sm text-gray-500">No pending SPV approvals</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {spvs.map((spv) => (
          <li key={spv.id}>
            <Link
              to={`/app/admin/reviews/spv/${spv.id}`}
              className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-600">
                    {spv.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Manager: {spv.managerEmail} | Type: {spv.type} | Target: $
                    {spv.targetAmount?.toLocaleString() || "N/A"}
                  </p>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-500">
                    {new Date(spv.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

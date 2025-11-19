import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  DollarSign,
  Calendar,
} from "lucide-react";

interface SPVData {
  id: string;
  name: string;
  type: string;
  status: string;
  adminStatus: string;
  adminNotes?: string;
  targetAmount?: number;
  fundraisingStart: string;
  fundraisingEnd: string;
  managementFee?: number;
  carryFee?: number;
  adminFee?: number;
  lifespanYears: number;
  managerId: string;
  User: {
    id: string;
    email: string;
  };
  managerKYC?: {
    kycStatus: string;
    amlStatus: string;
    adminKycStatus?: string;
    companyName?: string;
  };
  subscriptions: Array<{
    id: string;
    amount: number;
    status: string;
    investor: {
      User: {
        email: string;
      };
    };
  }>;
  Invitations: Array<{
    id: string;
    email: string;
    status: string;
    createdAt: string;
  }>;
}

export default function AdminSPVReview() {
  const { spvId } = useParams<{ spvId: string }>();
  const navigate = useNavigate();
  const [spv, setSpv] = useState<SPVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<
    "approve" | "reject" | "request_changes" | null
  >(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (spvId) {
      fetchSPV();
    }
  }, [spvId]);

  const fetchSPV = async () => {
    try {
      const response = await api.get(`/admin/reviews/spv/${spvId}`);
      setSpv(response.data);
    } catch (error) {
      console.error("Failed to fetch SPV:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!action || !spvId) return;

    setSubmitting(true);
    try {
      await api.post(`/admin/reviews/spv/${spvId}`, {
        action,
        notes: notes || undefined,
      });
      navigate("/app/admin");
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="px-4 py-6 sm:px-0">Loading...</div>;
  }

  if (!spv) {
    return <div className="px-4 py-6 sm:px-0">SPV not found</div>;
  }

  const isReviewed = spv.adminStatus !== "pending";

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <button
          onClick={() => navigate("/app/admin")}
          className="text-primary-600 hover:text-primary-700 mb-4"
        >
          ← Back to Admin Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">SPV Review</h1>
        <p className="mt-2 text-sm text-gray-600">{spv.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* SPV Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Fund Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Type</p>
                <p className="text-sm text-gray-900">{spv.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="text-sm text-gray-900">{spv.status}</p>
              </div>
              {spv.targetAmount && (
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Target Amount
                  </p>
                  <p className="text-sm text-gray-900">
                    ${spv.targetAmount.toLocaleString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Lifespan</p>
                <p className="text-sm text-gray-900">
                  {spv.lifespanYears} years
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Fundraising Start
                </p>
                <p className="text-sm text-gray-900">
                  {new Date(spv.fundraisingStart).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Fundraising End
                </p>
                <p className="text-sm text-gray-900">
                  {new Date(spv.fundraisingEnd).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Fees */}
          {(spv.managementFee || spv.carryFee || spv.adminFee) && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Fee Structure
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {spv.managementFee && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Management Fee
                    </p>
                    <p className="text-sm text-gray-900">
                      {spv.managementFee}%
                    </p>
                  </div>
                )}
                {spv.carryFee && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Carry Fee
                    </p>
                    <p className="text-sm text-gray-900">{spv.carryFee}%</p>
                  </div>
                )}
                {spv.adminFee && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Admin Fee
                    </p>
                    <p className="text-sm text-gray-900">{spv.adminFee}%</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Manager KYC Status */}
          {spv.managerKYC && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Manager KYC Status
              </h2>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">KYC:</span>{" "}
                  <span
                    className={
                      spv.managerKYC.kycStatus === "verified"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }
                  >
                    {spv.managerKYC.kycStatus}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-medium">AML:</span>{" "}
                  <span
                    className={
                      spv.managerKYC.amlStatus === "cleared"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }
                  >
                    {spv.managerKYC.amlStatus}
                  </span>
                </p>
                {spv.managerKYC.adminKycStatus && (
                  <p className="text-sm">
                    <span className="font-medium">Admin Status:</span>{" "}
                    {spv.managerKYC.adminKycStatus}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Subscriptions */}
          {spv.subscriptions && spv.subscriptions.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Subscriptions ({spv.subscriptions.length})
              </h2>
              <div className="space-y-2">
                {spv.subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex justify-between text-sm border-b pb-2"
                  >
                    <span>{sub.investor.User.email}</span>
                    <span className="font-medium">
                      ${sub.amount.toLocaleString()} ({sub.status})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invitations */}
          {spv.Invitations && spv.Invitations.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Invitations ({spv.Invitations.length})
              </h2>
              <p className="text-sm text-gray-500">
                {spv.Invitations.filter((i) => i.status === "pending").length}{" "}
                pending,{" "}
                {spv.Invitations.filter((i) => i.status === "accepted").length}{" "}
                accepted
              </p>
            </div>
          )}

          {/* Review Form */}
          {!isReviewed && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Review Decision
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => setAction("approve")}
                      className={`px-4 py-2 rounded-md border-2 ${
                        action === "approve"
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-300 text-gray-700 hover:border-green-300"
                      }`}
                    >
                      <CheckCircle className="h-5 w-5 inline mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => setAction("request_changes")}
                      className={`px-4 py-2 rounded-md border-2 ${
                        action === "request_changes"
                          ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                          : "border-gray-300 text-gray-700 hover:border-yellow-300"
                      }`}
                    >
                      <AlertCircle className="h-5 w-5 inline mr-2" />
                      Request Changes
                    </button>
                    <button
                      onClick={() => setAction("reject")}
                      className={`px-4 py-2 rounded-md border-2 ${
                        action === "reject"
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-gray-300 text-gray-700 hover:border-red-300"
                      }`}
                    >
                      <XCircle className="h-5 w-5 inline mr-2" />
                      Reject
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes {action === "request_changes" && "(Required)"}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Add any notes about this review..."
                  />
                </div>
                <button
                  onClick={handleReview}
                  disabled={
                    !action ||
                    (action === "request_changes" && !notes) ||
                    submitting
                  }
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </div>
          )}

          {/* Previous Review */}
          {isReviewed && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Review Status
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p
                    className={`text-lg font-semibold ${
                      spv.adminStatus === "approved"
                        ? "text-green-600"
                        : spv.adminStatus === "rejected"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {spv.adminStatus}
                  </p>
                </div>
                {spv.adminNotes && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Notes</p>
                    <p className="text-sm text-gray-900">{spv.adminNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Manager Information
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Email</p>
                <p className="text-gray-900">{spv.User.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

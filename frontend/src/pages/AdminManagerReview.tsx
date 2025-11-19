import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { CheckCircle, XCircle } from "lucide-react";

interface ManagerData {
  id: string;
  userId: string;
  kycStatus: string;
  amlStatus: string;
  adminKycStatus?: string;
  adminKycNotes?: string;
  sumsubApplicantId?: string;
  jurisdiction?: string;
  companyName?: string;
  companyAddress?: string;
  taxId?: string;
  User: {
    id: string;
    email: string;
    createdAt: string;
  };
  KYCReviewedByUser?: {
    id: string;
    email: string;
  };
  SPV: Array<{
    id: string;
    name: string;
    status: string;
    adminStatus?: string;
    createdAt: string;
  }>;
}

export default function AdminManagerReview() {
  const { managerId } = useParams<{ managerId: string }>();
  const navigate = useNavigate();
  const [manager, setManager] = useState<ManagerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (managerId) {
      fetchManager();
    }
  }, [managerId]);

  const fetchManager = async () => {
    try {
      const response = await api.get(`/admin/reviews/manager/${managerId}`);
      setManager(response.data);
    } catch (error) {
      console.error("Failed to fetch manager:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!action || !managerId) return;

    setSubmitting(true);
    try {
      await api.post(`/admin/reviews/manager/${managerId}`, {
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

  if (!manager) {
    return <div className="px-4 py-6 sm:px-0">Manager not found</div>;
  }

  const isReviewed = !!manager.adminKycStatus;

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <button
          onClick={() => navigate("/app/admin")}
          className="text-primary-600 hover:text-primary-700 mb-4"
        >
          ← Back to Admin Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Manager KYC Review</h1>
        <p className="mt-2 text-sm text-gray-600">{manager.User.email}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* KYC Status */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              KYC/AML Status
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">KYC Status</p>
                <p
                  className={`text-lg font-semibold ${
                    manager.kycStatus === "verified"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {manager.kycStatus}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">AML Status</p>
                <p
                  className={`text-lg font-semibold ${
                    manager.amlStatus === "cleared"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {manager.amlStatus}
                </p>
              </div>
            </div>
          </div>

          {/* Company Information */}
          {(manager.companyName || manager.companyAddress || manager.taxId) && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Company Information
              </h2>
              <div className="space-y-3">
                {manager.companyName && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Company Name
                    </p>
                    <p className="text-sm text-gray-900">
                      {manager.companyName}
                    </p>
                  </div>
                )}
                {manager.companyAddress && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-sm text-gray-900">
                      {manager.companyAddress}
                    </p>
                  </div>
                )}
                {manager.taxId && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tax ID</p>
                    <p className="text-sm text-gray-900">{manager.taxId}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SPVs */}
          {manager.SPV.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Managed SPVs
              </h2>
              <div className="space-y-3">
                {manager.SPV.map((spv) => (
                  <div
                    key={spv.id}
                    className="border rounded-lg p-4 flex justify-between"
                  >
                    <div>
                      <p className="font-medium">{spv.name}</p>
                      <p className="text-sm text-gray-500">
                        Status: {spv.status} | Admin: {spv.adminStatus || "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
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
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setAction("approve")}
                      className={`flex-1 px-4 py-2 rounded-md border-2 ${
                        action === "approve"
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-300 text-gray-700 hover:border-green-300"
                      }`}
                    >
                      <CheckCircle className="h-5 w-5 inline mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => setAction("reject")}
                      className={`flex-1 px-4 py-2 rounded-md border-2 ${
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
                    Notes (Optional)
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
                  disabled={!action || submitting}
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
                      manager.adminKycStatus === "admin_approved"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {manager.adminKycStatus === "admin_approved"
                      ? "Approved"
                      : "Rejected"}
                  </p>
                </div>
                {manager.adminKycNotes && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Notes</p>
                    <p className="text-sm text-gray-900">
                      {manager.adminKycNotes}
                    </p>
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
                <p className="text-gray-900">{manager.User.email}</p>
              </div>
              <div>
                <p className="text-gray-500">Member Since</p>
                <p className="text-gray-900">
                  {new Date(manager.User.createdAt).toLocaleDateString()}
                </p>
              </div>
              {manager.jurisdiction && (
                <div>
                  <p className="text-gray-500">Jurisdiction</p>
                  <p className="text-gray-900">{manager.jurisdiction}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { CheckCircle, XCircle, Shield, Mail, Calendar } from "lucide-react";

interface InvestorData {
  id: string;
  userId: string;
  kycStatus: string;
  amlStatus: string;
  adminKycStatus?: string;
  adminKycNotes?: string;
  sumsubApplicantId?: string;
  jurisdiction?: string;
  walletAddress?: string;
  User: {
    id: string;
    email: string;
    createdAt: string;
  };
  KYCReviewedByUser?: {
    id: string;
    email: string;
  };
  Subscription: Array<{
    id: string;
    amount: number;
    status: string;
    SPV: {
      id: string;
      name: string;
      status: string;
    };
  }>;
}

export default function AdminInvestorReview() {
  const { investorId } = useParams<{ investorId: string }>();
  const navigate = useNavigate();
  const [investor, setInvestor] = useState<InvestorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (investorId) {
      fetchInvestor();
    }
  }, [investorId]);

  const fetchInvestor = async () => {
    try {
      const response = await api.get(`/admin/reviews/investor/${investorId}`);
      setInvestor(response.data);
    } catch (error) {
      console.error("Failed to fetch investor:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!action || !investorId) return;

    setSubmitting(true);
    try {
      await api.post(`/admin/reviews/investor/${investorId}`, {
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

  if (!investor) {
    return <div className="px-4 py-6 sm:px-0">Investor not found</div>;
  }

  const isReviewed = !!investor.adminKycStatus;

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <button
          onClick={() => navigate("/app/admin")}
          className="text-primary-600 hover:text-primary-700 mb-4"
        >
          ← Back to Admin Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          Investor KYC Review
        </h1>
        <p className="mt-2 text-sm text-gray-600">{investor.User.email}</p>
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
                    investor.kycStatus === "verified"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {investor.kycStatus}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">AML Status</p>
                <p
                  className={`text-lg font-semibold ${
                    investor.amlStatus === "cleared"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {investor.amlStatus}
                </p>
              </div>
              {investor.sumsubApplicantId && (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">
                    Sumsub Applicant ID
                  </p>
                  <p className="text-sm text-gray-900">
                    {investor.sumsubApplicantId}
                  </p>
                </div>
              )}
              {investor.jurisdiction && (
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Jurisdiction
                  </p>
                  <p className="text-sm text-gray-900">
                    {investor.jurisdiction}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Subscriptions */}
          {investor.Subscription.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Subscriptions
              </h2>
              <div className="space-y-3">
                {investor.Subscription.map((sub) => (
                  <div
                    key={sub.id}
                    className="border rounded-lg p-4 flex justify-between"
                  >
                    <div>
                      <p className="font-medium">{sub.SPV.name}</p>
                      <p className="text-sm text-gray-500">
                        Status: {sub.status}
                      </p>
                    </div>
                    <p className="font-semibold">
                      ${sub.amount.toLocaleString()}
                    </p>
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
                      investor.adminKycStatus === "admin_approved"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {investor.adminKycStatus === "admin_approved"
                      ? "Approved"
                      : "Rejected"}
                  </p>
                </div>
                {investor.adminKycNotes && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Notes</p>
                    <p className="text-sm text-gray-900">
                      {investor.adminKycNotes}
                    </p>
                  </div>
                )}
                {investor.KYCReviewedByUser && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Reviewed By
                    </p>
                    <p className="text-sm text-gray-900">
                      {investor.KYCReviewedByUser.email}
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
              Investor Information
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Email</p>
                <p className="text-gray-900">{investor.User.email}</p>
              </div>
              <div>
                <p className="text-gray-500">Member Since</p>
                <p className="text-gray-900">
                  {new Date(investor.User.createdAt).toLocaleDateString()}
                </p>
              </div>
              {investor.walletAddress && (
                <div>
                  <p className="text-gray-500">Wallet Address</p>
                  <p className="text-gray-900 font-mono text-xs">
                    {investor.walletAddress}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


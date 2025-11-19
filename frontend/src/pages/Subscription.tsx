import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy,
  ExternalLink,
  Wallet,
  FileText,
} from "lucide-react";

interface SubscriptionData {
  id: string;
  spvId: string;
  spvName: string;
  spvStatus: string;
  amount: number;
  status: string;
  tokenAmount?: number;
  walletAddress?: string;
  wireReference?: string;
  createdAt: string;
  updatedAt: string;
  SPV?: {
    id: string;
    name: string;
    tokenContractAddress?: string;
    tokenName?: string;
    tokenTicker?: string;
  };
}

export default function Subscription() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingWire, setSubmittingWire] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Wire transfer form state
  const [wireReference, setWireReference] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  useEffect(() => {
    if (id) {
      fetchSubscription();
    }
  }, [id]);

  const fetchSubscription = async () => {
    try {
      const response = await api.get(`/subscriptions/${id}`);
      setSubscription(response.data);
    } catch (error: any) {
      console.error("Failed to fetch subscription:", error);
      if (error.response?.status === 404) {
        navigate("/app/portfolio");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWireTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmittingWire(true);

    try {
      if (!wireReference.trim()) {
        setError("Wire Reference Number is required");
        setSubmittingWire(false);
        return;
      }

      await api.post(`/subscriptions/${id}/wire-transfer`, {
        wireReference: wireReference.trim(),
        bankName: bankName.trim() || undefined,
        accountNumber: accountNumber.trim() || undefined,
      });

      setSuccess("Wire transfer details submitted successfully. Tokens will be minted after platform confirmation.");
      setWireReference("");
      setBankName("");
      setAccountNumber("");
      fetchSubscription(); // Refresh subscription data
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to submit wire transfer details");
    } finally {
      setSubmittingWire(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  const getStatusStep = (status: string): number => {
    switch (status) {
      case "pending":
        return 1;
      case "funded":
        return 2;
      case "completed":
        return 3;
      default:
        return 1;
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "pending":
        return "Subscription Created";
      case "funded":
        return "Wire Transfer Confirmed";
      case "completed":
        return "Tokens Minted";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <p className="text-gray-500">Subscription not found</p>
        <Link
          to="/app/portfolio"
          className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Portfolio
        </Link>
      </div>
    );
  }

  const currentStep = getStatusStep(subscription.status);
  const isPending = subscription.status === "pending";
  const isFunded = subscription.status === "funded";
  const isCompleted = subscription.status === "completed";

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <button
          onClick={() => navigate("/app/portfolio")}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Portfolio
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Subscription Details</h1>
      </div>

      {/* Status Timeline */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
        <div className="flex items-center justify-between">
          {[
            { step: 1, label: "Subscription Created", icon: CheckCircle },
            { step: 2, label: "Wire Transfer Confirmed", icon: Clock },
            { step: 3, label: "Tokens Minted", icon: Wallet },
          ].map(({ step, label, icon: Icon }) => {
            const isActive = step <= currentStep;
            const isCurrent = step === currentStep;
            return (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`flex flex-col items-center ${
                    isActive ? "text-primary-600" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                      isActive
                        ? "border-primary-600 bg-primary-50"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {isActive ? (
                      <Icon className="h-6 w-6" />
                    ) : (
                      <span className="text-lg font-semibold">{step}</span>
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      isCurrent ? "text-primary-600" : ""
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {step < 3 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      step < currentStep ? "bg-primary-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Subscription Information */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Subscription Information
        </h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">SPV</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <Link
                to={`/app/spvs/${subscription.spvId}`}
                className="text-primary-600 hover:text-primary-700"
              >
                {subscription.spvName}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Investment Amount</dt>
            <dd className="mt-1 text-sm text-gray-900 font-semibold">
              ${subscription.amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  isCompleted
                    ? "bg-green-100 text-green-800"
                    : isFunded
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {getStatusLabel(subscription.status)}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(subscription.createdAt).toLocaleDateString()}
            </dd>
          </div>
          {subscription.walletAddress && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Wallet Address</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono flex items-center">
                {subscription.walletAddress.slice(0, 10)}...
                {subscription.walletAddress.slice(-8)}
                <button
                  onClick={() => copyToClipboard(subscription.walletAddress!)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                  title="Copy address"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Wire Transfer Submission Form */}
      {isPending && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Submit Wire Transfer Details
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Please submit your wire transfer details. Tokens will be minted after platform confirmation of funds received.
          </p>

          {/* Wire Transfer Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Wire Transfer Instructions
            </h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p>
                <strong>Bank:</strong> VentureBox Escrow Account
              </p>
              <p>
                <strong>Account Number:</strong> 1234567890
              </p>
              <p>
                <strong>Routing Number:</strong> 021000021
              </p>
              <p>
                <strong>Reference:</strong> SUB-{subscription.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2" />
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleWireTransferSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wire Reference Number *
              </label>
              <input
                type="text"
                value={wireReference}
                onChange={(e) => setWireReference(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter reference number from your bank"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Receipt (Optional)
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Upload a screenshot or PDF of your wire transfer confirmation
              </p>
            </div>

            <button
              type="submit"
              disabled={submittingWire}
              className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50"
            >
              {submittingWire ? "Submitting..." : "Submit Wire Transfer Details"}
            </button>
          </form>
        </div>
      )}

      {/* Funded Status - Awaiting Confirmation */}
      {isFunded && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Awaiting Platform Confirmation
              </h3>
              <p className="text-sm text-gray-600">
                Your wire transfer details have been submitted. The platform is confirming receipt of funds.
                Tokens will be minted automatically once confirmation is complete.
              </p>
              {subscription.wireReference && (
                <p className="text-xs text-gray-500 mt-2">
                  Wire Reference: {subscription.wireReference}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Token Information - Completed */}
      {isCompleted && subscription.tokenAmount && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Token Information
          </h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Tokens Minted</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {subscription.tokenAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                tokens
              </dd>
            </div>
            {subscription.SPV?.tokenContractAddress && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Token Contract Address</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono flex items-center">
                  {subscription.SPV.tokenContractAddress.slice(0, 10)}...
                  {subscription.SPV.tokenContractAddress.slice(-8)}
                  <button
                    onClick={() =>
                      copyToClipboard(subscription.SPV!.tokenContractAddress!)
                    }
                    className="ml-2 text-gray-400 hover:text-gray-600"
                    title="Copy address"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <a
                    href={`https://etherscan.io/address/${subscription.SPV.tokenContractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-primary-600 hover:text-primary-700"
                    title="View on Etherscan"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </dd>
              </div>
            )}
            {subscription.SPV?.tokenName && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Token Name</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {subscription.SPV.tokenName}
                </dd>
              </div>
            )}
            {subscription.SPV?.tokenTicker && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Token Ticker</dt>
                <dd className="mt-1 text-sm text-gray-900 font-semibold">
                  {subscription.SPV.tokenTicker}
                </dd>
              </div>
            )}
          </dl>
          <div className="mt-6 pt-6 border-t">
            <Link
              to="/app/portfolio"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
            >
              <Wallet className="h-4 w-4 mr-2" />
              View in Portfolio
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

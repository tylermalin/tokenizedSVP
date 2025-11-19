import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  Users,
  FileText,
  ArrowLeft,
  Edit,
  UserPlus,
  CheckCircle,
  Copy,
  ExternalLink,
  Download,
} from "lucide-react";

interface SPVDetail {
  id: string;
  name: string;
  type: string;
  status: string;
  adminStatus?: string;
  managerId: string;
  fundraisingStart: string;
  fundraisingEnd: string;
  lifespanYears: number;
  targetAmount?: number;
  managementFee?: number;
  carryFee?: number;
  adminFee?: number;
  currentNAV?: number;
  capitalStack?: string;
  tokenContractAddress?: string;
  tokenName?: string;
  tokenTicker?: string;
  subscriptions?: Array<{
    id: string;
    investorId: string;
    amount: number;
    status: string;
    investor: {
      id: string;
      email: string;
    };
  }>;
  User?: {
    email: string;
  };
}

export default function SPVDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [spv, setSpv] = useState<SPVDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchSPVDetails();
    }
  }, [id]);

  const fetchSPVDetails = async () => {
    try {
      const response = await api.get(`/spvs/${id}`);
      setSpv(response.data);
    } catch (error: any) {
      console.error("Failed to fetch SPV details:", error);
      if (error.response?.status === 404) {
        navigate("/app/spvs");
      }
    } finally {
      setLoading(false);
    }
  };

  const validateEthereumAddress = (address: string): boolean => {
    if (!address) return true; // Optional field
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const amount = parseFloat(investmentAmount);
      if (isNaN(amount) || amount <= 0) {
        setError("Please enter a valid investment amount");
        setSubmitting(false);
        return;
      }

      // Validate minimum investment (if SPV has one)
      const minInvestment = 10000; // Default minimum, should come from SPV data
      if (amount < minInvestment) {
        setError(`Minimum investment is $${minInvestment.toLocaleString()}`);
        setSubmitting(false);
        return;
      }

      // Validate available amount
      if (spv && spv.targetAmount && amount > spv.targetAmount - totalRaised) {
        setError(
          `Maximum investment is $${(
            spv.targetAmount - totalRaised
          ).toLocaleString()}`
        );
        setSubmitting(false);
        return;
      }

      // Validate wallet address format if provided
      if (walletAddress && !validateEthereumAddress(walletAddress)) {
        setError("Please enter a valid Ethereum wallet address (0x...)");
        setSubmitting(false);
        return;
      }

      await api.post("/subscriptions", {
        spvId: id,
        amount: amount,
        walletAddress: walletAddress || undefined,
      });

      setShowInvestModal(false);
      setInvestmentAmount("");
      setWalletAddress("");
      fetchSPVDetails(); // Refresh SPV data
      navigate("/app/subscriptions");
    } catch (err: any) {
      const errorMessage =
        typeof err?.response?.data?.error === "string"
          ? err.response.data.error
          : typeof err?.response?.data?.message === "string"
          ? err.response.data.message
          : err?.message || "Failed to create subscription";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
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

  if (!spv) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <p className="text-gray-500">SPV not found</p>
        <Link
          to="/app/spvs"
          className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to SPVs
        </Link>
      </div>
    );
  }

  const isManager = user?.role === "manager" && user?.id === spv.managerId;
  const isInvestor = user?.role === "investor";
  const isAdmin = user?.role === "admin";
  const canInvest =
    isInvestor &&
    spv.status === "fundraising" &&
    spv.adminStatus === "approved";
  const existingSubscription = spv.subscriptions?.find(
    (s) => s.investorId === user?.id
  );

  // Calculate fundraising progress
  const totalRaised =
    spv.subscriptions?.reduce(
      (sum, s) => sum + (s.status === "completed" ? s.amount : 0),
      0
    ) || 0;
  const progress =
    spv.targetAmount && spv.targetAmount > 0
      ? (totalRaised / spv.targetAmount) * 100
      : 0;

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <Link
          to="/app/spvs"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to SPVs
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{spv.name}</h1>
            <p className="mt-2 text-sm text-gray-600">
              {spv.type
                .replace("_", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                spv.status === "active"
                  ? "bg-green-100 text-green-800"
                  : spv.status === "fundraising"
                  ? "bg-blue-100 text-blue-800"
                  : spv.status === "configuring"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {spv.status}
            </span>
            {spv.adminStatus && (
              <span
                className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                  spv.adminStatus === "approved"
                    ? "bg-green-100 text-green-800"
                    : spv.adminStatus === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : spv.adminStatus === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {spv.adminStatus === "approved"
                  ? "Approved"
                  : spv.adminStatus === "pending"
                  ? "Pending Review"
                  : spv.adminStatus === "rejected"
                  ? "Rejected"
                  : spv.adminStatus === "changes_requested"
                  ? "Changes Requested"
                  : spv.adminStatus}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Fundraising Progress */}
          {spv.status === "fundraising" && spv.targetAmount && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Fundraising Progress
              </h2>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Raised</span>
                  <span>
                    ${totalRaised.toLocaleString()} / $
                    {spv.targetAmount.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-primary-600 h-4 rounded-full transition-all"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {progress.toFixed(1)}% funded
                </p>
              </div>
            </div>
          )}

          {/* SPV Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              SPV Information
            </h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Manager</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {spv.User?.email || "N/A"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Fundraising Period
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(spv.fundraisingStart).toLocaleDateString()} -{" "}
                  {new Date(spv.fundraisingEnd).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Target Amount
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {spv.targetAmount
                    ? `$${spv.targetAmount.toLocaleString()}`
                    : "Not set"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Lifespan</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {spv.lifespanYears} years
                </dd>
              </div>
              {spv.currentNAV && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Current NAV
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    $
                    {spv.currentNAV.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Token Information */}
          {spv.tokenContractAddress && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Token Information
              </h2>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {spv.tokenName && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Token Name
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 font-semibold">
                      {spv.tokenName}
                    </dd>
                  </div>
                )}
                {spv.tokenTicker && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Token Ticker
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 font-semibold">
                      {spv.tokenTicker}
                    </dd>
                  </div>
                )}
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 mb-2">
                    Token Contract Address
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono flex items-center">
                    {spv.tokenContractAddress.slice(0, 10)}...
                    {spv.tokenContractAddress.slice(-8)}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          spv.tokenContractAddress!
                        );
                      }}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                      title="Copy address"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <a
                      href={`https://etherscan.io/address/${spv.tokenContractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-primary-600 hover:text-primary-700"
                      title="View on Etherscan"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Fee Structure */}
          {(spv.managementFee || spv.carryFee || spv.adminFee) && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Fee Structure
              </h2>
              <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {spv.managementFee && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Management Fee
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {spv.managementFee}%
                    </dd>
                  </div>
                )}
                {spv.carryFee && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Carry Fee
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {spv.carryFee}%
                    </dd>
                  </div>
                )}
                {spv.adminFee && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Admin Fee
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {spv.adminFee}%
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Capital Stack (for real estate) */}
          {spv.capitalStack && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Capital Stack
              </h2>
              <div className="space-y-2">
                {Object.entries(JSON.parse(spv.capitalStack)).map(
                  ([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}:
                      </span>
                      <span className="text-gray-900 font-medium">
                        ${Number(value).toLocaleString()}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Subscriptions List (for managers/admins) */}
          {(isManager || isAdmin) && spv.subscriptions && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Subscriptions ({spv.subscriptions.length})
              </h2>
              {spv.subscriptions.length === 0 ? (
                <p className="text-sm text-gray-500">No subscriptions yet</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {spv.subscriptions.map((sub) => (
                    <li key={sub.id} className="py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {sub.investor.email}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-900">
                            ${sub.amount.toLocaleString()}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              sub.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : sub.status === "funded"
                                ? "bg-blue-100 text-blue-800"
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
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Investment Section (for investors) */}
          {canInvest && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Invest Now
              </h2>
              {existingSubscription ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-900">
                        Subscription Created
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 mt-2">
                      Amount: ${existingSubscription.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-blue-700">
                      Status: {existingSubscription.status}
                    </p>
                  </div>
                  <Link
                    to={`/app/subscriptions/${existingSubscription.id}`}
                    className="block w-full text-center px-4 py-2 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-50 text-sm font-medium"
                  >
                    View Subscription
                  </Link>
                </div>
              ) : (
                <div>
                  {spv.targetAmount && (
                    <p className="text-sm text-gray-600 mb-4">
                      Available to invest: $
                      {(spv.targetAmount - totalRaised).toLocaleString()}
                    </p>
                  )}
                  <button
                    onClick={() => setShowInvestModal(true)}
                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium"
                  >
                    Invest Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Management Actions (for managers) */}
          {isManager && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Management
              </h2>
              <div className="space-y-3">
                {spv.status === "configuring" && (
                  <Link
                    to={`/app/spvs/${id}/edit`}
                    className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
                  >
                    <Edit className="h-4 w-4 inline mr-2" />
                    Edit SPV
                  </Link>
                )}
                {spv.status === "fundraising" && (
                  <Link
                    to={`/app/spvs/${id}/invite`}
                    className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
                  >
                    <UserPlus className="h-4 w-4 inline mr-2" />
                    Invite Investors
                  </Link>
                )}
                <Link
                  to={`/app/spvs/${id}/subscriptions`}
                  className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
                >
                  <Users className="h-4 w-4 inline mr-2" />
                  View Subscriptions
                </Link>
              </div>
            </div>
          )}

          {/* Documents Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Documents
            </h2>
            <DocumentsList spvId={id || ""} />
          </div>
        </div>
      </div>

      {/* Investment Modal */}
      {showInvestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => {
                setShowInvestModal(false);
                setError("");
                setInvestmentAmount("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Invest in {spv.name}
            </h2>
            <p className="text-gray-600 mb-6">
              Enter your investment amount and wallet address below
            </p>
            <form onSubmit={handleInvest} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Investment Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    required
                    min="1"
                    max={
                      spv.targetAmount
                        ? spv.targetAmount - totalRaised
                        : undefined
                    }
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div className="mt-2 space-y-1">
                  {spv.targetAmount && (
                    <p className="text-xs text-gray-500">
                      Available: $
                      {(spv.targetAmount - totalRaised).toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">Minimum: $10,000</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet Address (Optional)
                </label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x..."
                  pattern="^0x[a-fA-F0-9]{40}$"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    walletAddress && !validateEthereumAddress(walletAddress)
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                />
                {walletAddress && !validateEthereumAddress(walletAddress) && (
                  <p className="mt-1 text-xs text-red-600">
                    Please enter a valid Ethereum address (0x followed by 40 hex
                    characters)
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Your tokens will be minted to this address after wire transfer
                  confirmation
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Next Steps After Submission:
                </h4>
                <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                  <li>You will receive wire transfer instructions</li>
                  <li>Submit your wire transfer details</li>
                  <li>Tokens will be minted after platform confirmation</li>
                </ol>
              </div>

              <button
                type="submit"
                disabled={
                  submitting ||
                  !!(walletAddress && !validateEthereumAddress(walletAddress))
                }
                className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50"
              >
                {submitting ? "Creating Subscription..." : "Invest Now"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Documents List Component
function DocumentsList({ spvId }: { spvId: string }) {
  const [documents, setDocuments] = useState<
    Array<{
      id: string;
      documentType: string;
      title: string;
      createdAt: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (spvId) {
      fetchDocuments();
    }
  }, [spvId]);

  const fetchDocuments = async () => {
    try {
      const response = await api.get(`/documents/spv/${spvId}`);
      setDocuments(response.data);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDocumentTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      ppm: "Private Placement Memorandum",
      operating_agreement: "Operating Agreement",
      subscription_agreement: "Subscription Agreement",
      form_d: "Form D Filing",
      blue_sky: "Blue Sky Filing",
    };
    return labels[type] || type;
  };

  const handleViewDocument = async (documentType: string) => {
    try {
      // Fetch document content via API (which includes auth headers)
      const response = await api.get(
        `/documents/spv/${spvId}/${documentType}`,
        {
          responseType: "text",
        }
      );

      // Create a new window with the HTML content
      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(response.data);
        newWindow.document.close();
      }
    } catch (error) {
      console.error("Failed to load document:", error);
      alert("Failed to load document. Please try again.");
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading documents...</div>;
  }

  if (documents.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No documents available. Documents will be generated automatically when
        the SPV is created.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {documents.map((doc) => (
        <li key={doc.id}>
          <button
            onClick={() => handleViewDocument(doc.documentType)}
            className="flex items-center w-full text-left text-sm text-primary-600 hover:text-primary-700"
          >
            <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="flex-1">
              {getDocumentTypeLabel(doc.documentType)}
            </span>
            <Download className="h-4 w-4 ml-2" />
          </button>
          <p className="text-xs text-gray-500 ml-6 mt-1">
            Generated {new Date(doc.createdAt).toLocaleDateString()}
          </p>
        </li>
      ))}
    </ul>
  );
}

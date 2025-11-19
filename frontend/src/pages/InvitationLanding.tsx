import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Building2, Mail, Calendar, DollarSign, ArrowRight, AlertCircle } from 'lucide-react';

interface InvitationData {
  id: string;
  token: string;
  email: string;
  spv: {
    id: string;
    name: string;
    type: string;
    status: string;
    targetAmount: number | null;
    fundraisingStart: string;
    fundraisingEnd: string;
    managerEmail: string;
  };
  expiresAt: string;
  status: string;
}

export default function InvitationLanding() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchInvitation();
    }
  }, [token]);

  const fetchInvitation = async () => {
    try {
      const response = await api.get(`/invitations/${token}`);
      setInvitation(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    // Navigate to register page with invitation token
    navigate(`/register?token=${token}&email=${invitation?.email}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Invalid Invitation
          </h2>
          <p className="text-gray-600 text-center mb-6">
            {error || 'This invitation link is invalid or has expired.'}
          </p>
          <div className="text-center">
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = new Date(invitation.expiresAt) < new Date();
  const fundraisingStart = new Date(invitation.spv.fundraisingStart);
  const fundraisingEnd = new Date(invitation.spv.fundraisingEnd);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-12 w-12 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            You've Been Invited!
          </h1>
          <p className="text-xl text-gray-600">
            Invest in <span className="font-semibold">{invitation.spv.name}</span>
          </p>
        </div>

        {/* Invitation Card */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">{invitation.spv.name}</h2>
            <p className="text-primary-100 mt-1">
              Managed by {invitation.spv.managerEmail}
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Invited Email</p>
                  <p className="text-lg text-gray-900">{invitation.email}</p>
                </div>
              </div>

              <div className="flex items-start">
                <DollarSign className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Target Amount</p>
                  <p className="text-lg text-gray-900">
                    {invitation.spv.targetAmount
                      ? `$${invitation.spv.targetAmount.toLocaleString()}`
                      : 'Not specified'}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Fundraising Start</p>
                  <p className="text-lg text-gray-900">
                    {fundraisingStart.toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Fundraising End</p>
                  <p className="text-lg text-gray-900">
                    {fundraisingEnd.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {isExpired && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Invitation Expired
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      This invitation expired on {new Date(invitation.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!isExpired && (
              <div className="border-t pt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Next Steps:</strong> Register for an account to proceed with your investment.
                    Your email ({invitation.email}) will be pre-filled during registration.
                  </p>
                </div>

                <button
                  onClick={handleRegister}
                  className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  Register to Invest
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>

                <p className="text-center text-sm text-gray-500 mt-4">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About This Investment</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              <strong>SPV Type:</strong> {invitation.spv.type.replace('_', ' ')}
            </p>
            <p>
              <strong>Status:</strong> {invitation.spv.status}
            </p>
            <p>
              This is a private investment opportunity. By registering, you'll be able to review
              the full investment details and complete your subscription.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


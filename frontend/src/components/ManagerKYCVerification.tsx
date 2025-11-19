import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface KYCStatus {
  kycStatus: 'pending' | 'verified' | 'rejected';
  amlStatus: 'pending' | 'cleared' | 'flagged';
  sdkToken?: string;
  verificationUrl?: string;
}

export default function ManagerKYCVerification() {
  const [status, setStatus] = useState<KYCStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [initiating, setInitiating] = useState(false);

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      const response = await api.get('/compliance/kyc/manager/status');
      setStatus(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // KYC not initiated yet
        setStatus({ kycStatus: 'pending', amlStatus: 'pending' });
      } else {
        // Handle other errors gracefully
        console.error('Failed to fetch KYC status:', error);
        setStatus({ kycStatus: 'pending', amlStatus: 'pending' });
      }
    } finally {
      setLoading(false);
    }
  };

  const initiateKYC = async () => {
    setInitiating(true);
    try {
      const response = await api.post('/compliance/kyc/manager/initiate', {
        email: '', // Email will be retrieved from user context
      });
      setStatus(response.data);
      
      // Redirect to Sumsub verification if URL provided
      if (response.data.verificationUrl) {
        window.open(response.data.verificationUrl, '_blank');
      } else if (response.data.requiresFormSubmission) {
        // If form submission is required, show message
        alert(response.data.message || 'Please submit KYC form for admin review');
        fetchKYCStatus(); // Refresh status
      }
    } catch (error: any) {
      console.error('Failed to initiate KYC:', error);
      alert(error.response?.data?.error || 'Failed to initiate KYC');
    } finally {
      setInitiating(false);
    }
  };

  const getStatusIcon = () => {
    if (status?.kycStatus === 'verified' && status?.amlStatus === 'cleared') {
      return <CheckCircle className="h-8 w-8 text-green-500" />;
    }
    if (status?.kycStatus === 'rejected') {
      return <XCircle className="h-8 w-8 text-red-500" />;
    }
    if (status?.kycStatus === 'pending') {
      return <Clock className="h-8 w-8 text-yellow-500" />;
    }
    return <AlertCircle className="h-8 w-8 text-gray-500" />;
  };

  const getStatusText = () => {
    if (status?.kycStatus === 'verified' && status?.amlStatus === 'cleared') {
      return 'Verified';
    }
    if (status?.kycStatus === 'rejected') {
      return 'Rejected';
    }
    if (status?.kycStatus === 'pending') {
      return 'Pending Verification';
    }
    return 'Not Started';
  };

  const getStatusColor = () => {
    if (status?.kycStatus === 'verified' && status?.amlStatus === 'cleared') {
      return 'bg-green-50 text-green-800 border-green-200';
    }
    if (status?.kycStatus === 'rejected') {
      return 'bg-red-50 text-red-800 border-red-200';
    }
    if (status?.kycStatus === 'pending') {
      return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    }
    return 'bg-gray-50 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Manager KYC/AML Verification</h3>
          <p className="text-sm text-gray-500 mt-1">
            Complete identity verification to create and manage SPVs
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500 mb-1">KYC Status</div>
            <div className="text-lg font-semibold">
              {status?.kycStatus === 'verified' ? (
                <span className="text-green-600">Verified</span>
              ) : status?.kycStatus === 'rejected' ? (
                <span className="text-red-600">Rejected</span>
              ) : (
                <span className="text-yellow-600">Pending</span>
              )}
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500 mb-1">AML Status</div>
            <div className="text-lg font-semibold">
              {status?.amlStatus === 'cleared' ? (
                <span className="text-green-600">Cleared</span>
              ) : status?.amlStatus === 'flagged' ? (
                <span className="text-red-600">Flagged</span>
              ) : (
                <span className="text-yellow-600">Pending</span>
              )}
            </div>
          </div>
        </div>

        {status?.kycStatus !== 'verified' && (
          <div className="border-t pt-4">
            {status?.verificationUrl ? (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Click the button below to complete your identity verification. You will be redirected to our secure verification partner.
                </p>
                <a
                  href={status.verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                >
                  Complete Verification
                </a>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Start the KYC/AML verification process to begin creating and managing SPVs.
                </p>
                <button
                  onClick={initiateKYC}
                  disabled={initiating}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {initiating ? 'Initiating...' : 'Start Verification'}
                </button>
              </div>
            )}
          </div>
        )}

        {status?.kycStatus === 'verified' && status?.amlStatus === 'cleared' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-green-800">Verification Complete</h4>
                <p className="text-sm text-green-700 mt-1">
                  Your identity has been verified and you're cleared to create and manage SPVs.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


import KYCVerification from '../components/KYCVerification';

export default function KYCPage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Identity Verification</h1>
        <p className="mt-2 text-sm text-gray-600">
          Complete KYC/AML verification to participate in SPV investments
        </p>
      </div>
      <KYCVerification />
    </div>
  );
}


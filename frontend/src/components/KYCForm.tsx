import { useState } from "react";
import { api } from "../services/api";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";

interface KYCFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
  occupation: string;
  sourceOfFunds: string;
  taxId?: string;
  passportNumber?: string;
  idDocument?: File | null;
  proofOfAddress?: File | null;
}

interface KYCFormProps {
  userType: "investor" | "manager";
  onSuccess?: () => void;
}

export default function KYCForm({ userType, onSuccess }: KYCFormProps) {
  const [formData, setFormData] = useState<KYCFormData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phoneNumber: "",
    occupation: "",
    sourceOfFunds: "",
    taxId: "",
    passportNumber: "",
    idDocument: null,
    proofOfAddress: null,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          formDataToSend.append(key, value);
        } else if (value !== null && value !== undefined) {
          formDataToSend.append(key, value);
        }
      });

      const endpoint =
        userType === "investor"
          ? "/compliance/kyc/submit"
          : "/compliance/kyc/manager/submit";

      await api.post(endpoint, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSubmitted(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to submit KYC form");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start">
          <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-green-800">
              KYC Form Submitted Successfully
            </h3>
            <p className="text-sm text-green-700 mt-2">
              Your KYC application has been submitted and is pending admin review.
              You will be notified once your verification is complete.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Personal Information
          </h3>
        </div>

        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700"
          >
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            autoComplete="given-name"
            required
            value={formData.firstName}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700"
          >
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            autoComplete="family-name"
            required
            value={formData.lastName}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="dateOfBirth"
            className="block text-sm font-medium text-gray-700"
          >
            Date of Birth *
          </label>
          <input
            type="date"
            name="dateOfBirth"
            id="dateOfBirth"
            autoComplete="bday"
            required
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="nationality"
            className="block text-sm font-medium text-gray-700"
          >
            Nationality *
          </label>
          <input
            type="text"
            name="nationality"
            id="nationality"
            autoComplete="country"
            required
            value={formData.nationality}
            onChange={handleChange}
            placeholder="e.g., US, UK, CA"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        {/* Address Information */}
        <div className="md:col-span-2 mt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Address Information
          </h3>
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700"
          >
            Street Address *
          </label>
          <input
            type="text"
            name="address"
            id="address"
            autoComplete="street-address"
            required
            value={formData.address}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700"
          >
            City *
          </label>
          <input
            type="text"
            name="city"
            id="city"
            autoComplete="address-level2"
            required
            value={formData.city}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="state"
            className="block text-sm font-medium text-gray-700"
          >
            State/Province *
          </label>
          <input
            type="text"
            name="state"
            id="state"
            autoComplete="address-level1"
            required
            value={formData.state}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="zipCode"
            className="block text-sm font-medium text-gray-700"
          >
            ZIP/Postal Code *
          </label>
          <input
            type="text"
            name="zipCode"
            id="zipCode"
            autoComplete="postal-code"
            required
            value={formData.zipCode}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="country"
            className="block text-sm font-medium text-gray-700"
          >
            Country *
          </label>
          <input
            type="text"
            name="country"
            id="country"
            autoComplete="country-name"
            required
            value={formData.country}
            onChange={handleChange}
            placeholder="e.g., United States"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        {/* Contact & Additional Info */}
        <div className="md:col-span-2 mt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Contact & Additional Information
          </h3>
        </div>

        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-700"
          >
            Phone Number *
          </label>
          <input
            type="tel"
            name="phoneNumber"
            id="phoneNumber"
            autoComplete="tel"
            required
            value={formData.phoneNumber}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="occupation"
            className="block text-sm font-medium text-gray-700"
          >
            Occupation *
          </label>
          <input
            type="text"
            name="occupation"
            id="occupation"
            autoComplete="organization-title"
            required
            value={formData.occupation}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="sourceOfFunds"
            className="block text-sm font-medium text-gray-700"
          >
            Source of Funds *
          </label>
          <textarea
            name="sourceOfFunds"
            id="sourceOfFunds"
            autoComplete="off"
            required
            rows={3}
            value={formData.sourceOfFunds}
            onChange={handleChange}
            placeholder="Describe the source of funds for your investments"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        {userType === "manager" && (
          <>
            <div>
              <label
                htmlFor="taxId"
                className="block text-sm font-medium text-gray-700"
              >
                Tax ID / EIN
              </label>
              <input
                type="text"
                name="taxId"
                id="taxId"
                autoComplete="off"
                value={formData.taxId || ""}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </>
        )}

        <div>
          <label
            htmlFor="passportNumber"
            className="block text-sm font-medium text-gray-700"
          >
            Passport/ID Number
          </label>
          <input
            type="text"
            name="passportNumber"
            id="passportNumber"
            autoComplete="off"
            value={formData.passportNumber || ""}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        {/* Documents */}
        <div className="md:col-span-2 mt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Supporting Documents
          </h3>
        </div>

        <div>
          <label
            htmlFor="idDocument"
            className="block text-sm font-medium text-gray-700"
          >
            Government ID (Passport/Driver's License) *
          </label>
          <input
            type="file"
            name="idDocument"
            id="idDocument"
            autoComplete="off"
            required
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
        </div>

        <div>
          <label
            htmlFor="proofOfAddress"
            className="block text-sm font-medium text-gray-700"
          >
            Proof of Address (Utility Bill/Bank Statement) *
          </label>
          <input
            type="file"
            name="proofOfAddress"
            id="proofOfAddress"
            autoComplete="off"
            required
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader className="animate-spin -ml-1 mr-3 h-5 w-5" />
              Submitting...
            </>
          ) : (
            "Submit KYC Application"
          )}
        </button>
      </div>
    </form>
  );
}


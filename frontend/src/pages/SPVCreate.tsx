import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Building2,
} from "lucide-react";

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina",
  "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas",
  "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming", "District of Columbia"
];

interface FormData {
  // Step 1: Basic Information
  fundName: string;
  legalEntityName: string;
  vehicleType: "single_name" | "multi_name";
  entityType: string;
  entityTypeOther: string;
  assetClass: string;
  assetClassOther: string;
  investmentThesis: string;
  fixedLifespan: number;
  fundraisePeriod: number;

  // Step 2: Fundraising & Regulatory
  targetRaise: number;
  softCap: number;
  hardCap: number;
  minimumInvestment: number;
  accreditationRequired: boolean;
  primaryJurisdiction: string;
  stateWaivers: string[];
  tokenName: string;
  tokenTicker: string;
  fundraisingStart: string;
  fundraisingEnd: string;

  // Step 3: Fees & Economics
  managementFee: number;
  managementFeeBasis: "committed" | "deployed" | "nav";
  carryFee: number;
  hurdleRate: number;
  waterfallType: "american" | "european";
  organizationExpenses: number;
  earlyTerminationFee: number;
  adminFee: number;

  // Step 4: Review
  complianceConfirmed: boolean;
}

export default function SPVCreate() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    fundName: "",
    legalEntityName: "",
    vehicleType: "single_name",
    entityType: "delaware_llc",
    entityTypeOther: "",
    assetClass: "real_estate",
    assetClassOther: "",
    investmentThesis: "",
    fixedLifespan: 5,
    fundraisePeriod: 90,
    targetRaise: 0,
    softCap: 0,
    hardCap: 0,
    minimumInvestment: 0,
    accreditationRequired: true,
    primaryJurisdiction: "us_federal",
    stateWaivers: [],
    tokenName: "",
    tokenTicker: "",
    fundraisingStart: "",
    fundraisingEnd: "",
    managementFee: 0,
    managementFeeBasis: "committed",
    carryFee: 0,
    hurdleRate: 0,
    waterfallType: "american",
    organizationExpenses: 0,
    earlyTerminationFee: 0,
    adminFee: 0,
    complianceConfirmed: false,
  });

  const [stepErrors, setStepErrors] = useState<Record<number, string[]>>({});

  const validateStep = (step: number): boolean => {
    const errors: string[] = [];

    if (step === 1) {
      if (!formData.fundName.trim()) errors.push("Fund Name is required");
      if (!formData.legalEntityName.trim()) errors.push("Legal Entity Name is required");
      if (formData.fixedLifespan < 3) errors.push("Fixed Lifespan must be at least 3 years");
      if (formData.fundraisePeriod < 1) errors.push("Fundraise Period must be at least 1 day");
      if (formData.entityType === "other" && !formData.entityTypeOther.trim()) {
        errors.push("Please specify entity type");
      }
      if (formData.assetClass === "other" && !formData.assetClassOther.trim()) {
        errors.push("Please specify asset class");
      }
    } else if (step === 2) {
      if (!formData.targetRaise || formData.targetRaise <= 0) {
        errors.push("Target Raise is required and must be positive");
      }
      if (formData.softCap > 0 && formData.hardCap <= formData.softCap) {
        errors.push("Hard Cap must be greater than Soft Cap");
      }
      if (!formData.minimumInvestment || formData.minimumInvestment <= 0) {
        errors.push("Minimum Investment is required and must be positive");
      }
      if (!formData.tokenName.trim()) errors.push("Token Name is required");
      if (!formData.tokenTicker.trim()) errors.push("Token Ticker is required");
      if (!formData.fundraisingStart) errors.push("Fundraising Start Date is required");
      if (!formData.fundraisingEnd) errors.push("Fundraising End Date is required");
      if (formData.fundraisingStart && formData.fundraisingEnd) {
        const start = new Date(formData.fundraisingStart);
        const end = new Date(formData.fundraisingEnd);
        if (end <= start) {
          errors.push("Fundraising End Date must be after Start Date");
        }
      }
    } else if (step === 3) {
      if (formData.managementFee < 0 || formData.managementFee > 100) {
        errors.push("Management Fee must be between 0 and 100%");
      }
      if (formData.carryFee < 0 || formData.carryFee > 100) {
        errors.push("Carry Fee must be between 0 and 100%");
      }
      if (formData.adminFee < 0 || formData.adminFee > 100) {
        errors.push("Admin Fee must be between 0 and 100%");
      }
    } else if (step === 4) {
      if (!formData.complianceConfirmed) {
        errors.push("You must confirm compliance before submitting");
      }
    }

    setStepErrors({ ...stepErrors, [step]: errors });
    return errors.length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleMultiSelect = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      stateWaivers: prev.stateWaivers.includes(value)
        ? prev.stateWaivers.filter((s) => s !== value)
        : [...prev.stateWaivers, value],
    }));
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      setError(null);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Map vehicle type to backend format
      const vehicleTypeMap: Record<string, string> = {
        single_name: "single_name",
        multi_name: "multi_name",
      };

      // Calculate fundraising end date from start date and period
      const startDate = new Date(formData.fundraisingStart);
      const endDate = new Date(formData.fundraisingEnd);

      const payload = {
        name: formData.fundName,
        type: vehicleTypeMap[formData.vehicleType] || formData.vehicleType,
        fundraisingStart: startDate.toISOString(),
        fundraisingEnd: endDate.toISOString(),
        lifespanYears: formData.fixedLifespan,
        targetAmount: formData.targetRaise,
        managementFee: formData.managementFee || undefined,
        carryFee: formData.carryFee || undefined,
        adminFee: formData.adminFee || undefined,
        minimumInvestment: formData.minimumInvestment,
        // Store additional fields in a metadata field or extend schema
        // For now, we'll send what the backend expects
      };

      const response = await api.post("/spvs", payload);
      navigate(`/app/spvs/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create SPV. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Basic Information & Strategy
        </h2>
        <p className="text-sm text-gray-600">
          Define your fund's purpose and general structure
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fund Name *
          </label>
          <input
            type="text"
            name="fundName"
            value={formData.fundName}
            onChange={handleChange}
            required
            maxLength={255}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., Frank's Premier RE Fund I"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Legal Entity Name *
          </label>
          <input
            type="text"
            name="legalEntityName"
            value={formData.legalEntityName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., Premier RE Fund I, LLC"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Type *
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="vehicleType"
                value="single_name"
                checked={formData.vehicleType === "single_name"}
                onChange={handleChange}
                className="mr-2"
              />
              Single-Name SPV (one asset/deal)
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="vehicleType"
                value="multi_name"
                checked={formData.vehicleType === "multi_name"}
                onChange={handleChange}
                className="mr-2"
              />
              Multi-Name SPV (basket of assets/deals)
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Entity Type *
          </label>
          <select
            name="entityType"
            value={formData.entityType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="delaware_llc">Delaware LLC</option>
            <option value="delaware_lp">Delaware LP</option>
            <option value="other">Other</option>
          </select>
          {formData.entityType === "other" && (
            <input
              type="text"
              name="entityTypeOther"
              value={formData.entityTypeOther}
              onChange={handleChange}
              placeholder="Specify entity type"
              className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Asset Class *
          </label>
          <select
            name="assetClass"
            value={formData.assetClass}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="real_estate">Real Estate</option>
            <option value="public_equities">Public Equities</option>
            <option value="digital_assets">Digital Assets</option>
            <option value="other">Other</option>
          </select>
          {formData.assetClass === "other" && (
            <input
              type="text"
              name="assetClassOther"
              value={formData.assetClassOther}
              onChange={handleChange}
              placeholder="Specify asset class"
              className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Investment Thesis
          </label>
          <textarea
            name="investmentThesis"
            value={formData.investmentThesis}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Briefly describe the strategy, e.g., 'SFH Flips and Short-Term Rentals in TX'"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fixed Lifespan (Years) *
          </label>
          <input
            type="number"
            name="fixedLifespan"
            value={formData.fixedLifespan}
            onChange={handleChange}
            required
            min={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fundraise Period (Days) *
          </label>
          <input
            type="number"
            name="fundraisePeriod"
            value={formData.fundraisePeriod}
            onChange={handleChange}
            required
            min={1}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Fundraising & Regulatory Details
        </h2>
        <p className="text-sm text-gray-600">
          Define capital targets, investor rules, and regulatory scope
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Raise ($) *
          </label>
          <input
            type="number"
            name="targetRaise"
            value={formData.targetRaise || ""}
            onChange={handleChange}
            required
            min={0}
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="5,000,000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Soft Cap ($)
          </label>
          <input
            type="number"
            name="softCap"
            value={formData.softCap || ""}
            onChange={handleChange}
            min={0}
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hard Cap ($)
          </label>
          <input
            type="number"
            name="hardCap"
            value={formData.hardCap || ""}
            onChange={handleChange}
            min={0}
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Required if Soft Cap provided"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Investment ($) *
          </label>
          <input
            type="number"
            name="minimumInvestment"
            value={formData.minimumInvestment || ""}
            onChange={handleChange}
            required
            min={0}
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="50,000"
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="accreditationRequired"
              checked={formData.accreditationRequired}
              onChange={handleChange}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">
              U.S. Accredited Investors Only (Default)
            </span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Jurisdiction *
          </label>
          <select
            name="primaryJurisdiction"
            value={formData.primaryJurisdiction}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="us_federal">U.S. Federal Securities Law</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State Waivers (Blue Sky) - Multi-Select
          </label>
          <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {US_STATES.map((state) => (
                <label key={state} className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={formData.stateWaivers.includes(state)}
                    onChange={() => handleMultiSelect(state)}
                    className="mr-2"
                  />
                  {state}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Token Name *
          </label>
          <input
            type="text"
            name="tokenName"
            value={formData.tokenName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., REI"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Token Ticker *
          </label>
          <input
            type="text"
            name="tokenTicker"
            value={formData.tokenTicker}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., PREI-25"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fundraising Start Date *
          </label>
          <input
            type="date"
            name="fundraisingStart"
            value={formData.fundraisingStart}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fundraising End Date *
          </label>
          <input
            type="date"
            name="fundraisingEnd"
            value={formData.fundraisingEnd}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Fees & Economics
        </h2>
        <p className="text-sm text-gray-600">
          Define fee structure and distribution waterfall
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Annual Management Fee (%)
          </label>
          <input
            type="number"
            name="managementFee"
            value={formData.managementFee || ""}
            onChange={handleChange}
            min={0}
            max={100}
            step="0.1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="2.0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Management Fee Calculation Basis *
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="managementFeeBasis"
                value="committed"
                checked={formData.managementFeeBasis === "committed"}
                onChange={handleChange}
                className="mr-2"
              />
              Committed Capital
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="managementFeeBasis"
                value="deployed"
                checked={formData.managementFeeBasis === "deployed"}
                onChange={handleChange}
                className="mr-2"
              />
              Deployed Capital
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="managementFeeBasis"
                value="nav"
                checked={formData.managementFeeBasis === "nav"}
                onChange={handleChange}
                className="mr-2"
              />
              NAV
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Carried Interest / Carry (%)
          </label>
          <input
            type="number"
            name="carryFee"
            value={formData.carryFee || ""}
            onChange={handleChange}
            min={0}
            max={100}
            step="0.1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hurdle Rate (% Simple Annual)
          </label>
          <input
            type="number"
            name="hurdleRate"
            value={formData.hurdleRate || ""}
            onChange={handleChange}
            min={0}
            step="0.1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="8.0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Waterfall Type *
          </label>
          <select
            name="waterfallType"
            value={formData.waterfallType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="american">American (full return of capital before carry)</option>
            <option value="european">European (deal-by-deal carry)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization Expenses ($)
          </label>
          <input
            type="number"
            name="organizationExpenses"
            value={formData.organizationExpenses || ""}
            onChange={handleChange}
            min={0}
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="15,000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Early Termination Fee ($)
          </label>
          <input
            type="number"
            name="earlyTerminationFee"
            value={formData.earlyTerminationFee || ""}
            onChange={handleChange}
            min={0}
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="5,000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admin Fee (%)
          </label>
          <input
            type="number"
            name="adminFee"
            value={formData.adminFee || ""}
            onChange={handleChange}
            min={0}
            max={100}
            step="0.1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="0.5"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Review & Final Submission
        </h2>
        <p className="text-sm text-gray-600">
          Review your SPV configuration before submitting for admin approval
        </p>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Fund Name:</span>
            <span className="ml-2 font-medium">{formData.fundName || "N/A"}</span>
          </div>
          <div>
            <span className="text-gray-600">Legal Entity:</span>
            <span className="ml-2 font-medium">{formData.legalEntityName || "N/A"}</span>
          </div>
          <div>
            <span className="text-gray-600">Vehicle Type:</span>
            <span className="ml-2 font-medium">
              {formData.vehicleType === "single_name" ? "Single-Name SPV" : "Multi-Name SPV"}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Entity Type:</span>
            <span className="ml-2 font-medium">
              {formData.entityType === "other" ? formData.entityTypeOther : formData.entityType.replace("_", " ")}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Target Raise:</span>
            <span className="ml-2 font-medium">
              ${formData.targetRaise.toLocaleString() || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Minimum Investment:</span>
            <span className="ml-2 font-medium">
              ${formData.minimumInvestment.toLocaleString() || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Management Fee:</span>
            <span className="ml-2 font-medium">
              {formData.managementFee}%
            </span>
          </div>
          <div>
            <span className="text-gray-600">Carry:</span>
            <span className="ml-2 font-medium">
              {formData.carryFee}%
            </span>
          </div>
        </div>
      </div>

      {/* ACD Output Preview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">
              AI Document Draft Complete
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              Your legal documents have been generated based on your inputs.
            </p>
            <div className="text-xs text-blue-600 space-y-1">
              <p>• PPM Key Terms: Management Fee {formData.managementFee}%, Carry {formData.carryFee}%</p>
              <p>• Operating Agreement: {formData.fixedLifespan}-year lifespan, {formData.waterfallType} waterfall</p>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Checklist */}
      <div className="border border-gray-300 rounded-lg p-6">
        <label className="flex items-start">
          <input
            type="checkbox"
            name="complianceConfirmed"
            checked={formData.complianceConfirmed}
            onChange={handleChange}
            className="mt-1 mr-3"
          />
          <span className="text-sm text-gray-700">
            I confirm all inputs are accurate and compliant with the firm's internal investment mandate.
          </span>
        </label>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Disclaimer:</strong> Submission initiates the compliance review and legal document finalization. 
          No funds can be raised until final platform approval is granted.
        </p>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <button
          onClick={() => navigate("/app/spvs")}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to SPVs
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create SPV</h1>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step === currentStep
                    ? "border-primary-600 bg-primary-600 text-white"
                    : step < currentStep
                    ? "border-primary-600 bg-primary-600 text-white"
                    : "border-gray-300 bg-white text-gray-500"
                }`}
              >
                {step < currentStep ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <span className="font-semibold">{step}</span>
                )}
              </div>
              {step < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step < currentStep ? "bg-primary-600" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Basic Info</span>
          <span>Fundraising</span>
          <span>Fees</span>
          <span>Review</span>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white shadow rounded-lg p-8">
        {stepErrors[currentStep] && stepErrors[currentStep].length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
              <div>
                <h4 className="font-medium text-red-900 mb-1">Please fix the following errors:</h4>
                <ul className="list-disc list-inside text-sm text-red-700">
                  {stepErrors[currentStep].map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !formData.complianceConfirmed}
              className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Building2 className="animate-spin h-4 w-4 mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit for Admin Approval
                  <CheckCircle className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

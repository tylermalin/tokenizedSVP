import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { SPV } from "../types";
import { Building2, TrendingUp } from "lucide-react";

export default function SPVList() {
  const [spvs, setSpvs] = useState<SPV[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSPVs();
  }, []);

  const fetchSPVs = async () => {
    try {
      const response = await api.get("/spvs");
      setSpvs(response.data);
    } catch (error) {
      console.error("Failed to fetch SPVs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">SPVs</h1>
        <p className="mt-2 text-sm text-gray-600">
          Browse available investment opportunities
        </p>
      </div>

      {spvs.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No SPVs available
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Check back later for new investment opportunities.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {spvs.map((spv) => {
              // Calculate fundraising progress if available
              const progress = spv.targetAmount && spv.targetAmount > 0
                ? ((spv.currentNAV || 0) / spv.targetAmount) * 100
                : 0;

              return (
                <li key={spv.id}>
                  <Link
                    to={`/app/spvs/${spv.id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-primary-600 truncate">
                            {spv.name}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {spv.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                        </div>
                      </div>
                      {spv.status === "fundraising" && spv.targetAmount && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Fundraising Progress</span>
                            <span>
                              ${(spv.currentNAV || 0).toLocaleString()} / $
                              {spv.targetAmount.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {progress.toFixed(1)}% funded
                          </p>
                        </div>
                      )}
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>
                          Target: ${spv.targetAmount?.toLocaleString() || "N/A"}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

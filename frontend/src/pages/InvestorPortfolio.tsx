import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { TokenHolding, Distribution } from "../types";
import {
  Wallet,
  TrendingUp,
  DollarSign,
  Building2,
  Calendar,
  Filter,
} from "lucide-react";

export default function InvestorPortfolio() {
  const [holdings, setHoldings] = useState<TokenHolding[]>([]);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [distributionFilter, setDistributionFilter] = useState<string>("all");

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      const [holdingsResponse, distributionsResponse] = await Promise.all([
        api.get("/investors/me/tokens").catch(() => ({ data: [] })),
        api.get("/investors/me/distributions").catch(() => ({ data: [] })),
      ]);

      setHoldings(holdingsResponse.data);
      setDistributions(distributionsResponse.data);
    } catch (error) {
      console.error("Failed to fetch portfolio data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalInvested = holdings.reduce((sum, h) => sum + h.tokenBalance, 0);
  const activeInvestments = holdings.filter(
    (h) => h.spvStatus === "active" || h.spvStatus === "fundraising"
  ).length;
  const totalDistributions = distributions.reduce(
    (sum, d) => sum + d.amount,
    0
  );
  const filteredDistributions =
    distributionFilter === "all"
      ? distributions
      : distributions.filter((d) => d.distributionType === distributionFilter);

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
        <p className="mt-2 text-sm text-gray-600">
          View your investments and distribution history
        </p>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Invested
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    $
                    {totalInvested.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Investments
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {activeInvestments}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Distributions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    $
                    {totalDistributions.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Wallet className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Token Holdings
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {holdings.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Token Holdings Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Token Holdings
        </h2>
        {holdings.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No investments yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Start investing in SPVs to see your holdings here.
            </p>
            <div className="mt-6">
              <Link
                to="/app/spvs"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Browse SPVs
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {holdings.map((holding) => (
                <li key={holding.spvId}>
                  <Link
                    to={`/app/spvs/${holding.spvId}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-primary-600 truncate">
                            {holding.spvName}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {holding.spvType.replace("_", " ")} • Status:{" "}
                            {holding.spvStatus}
                          </p>
                        </div>
                        <div className="ml-4 text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {holding.tokenBalance.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{" "}
                            tokens
                          </p>
                          {holding.onChainBalance !== holding.tokenBalance && (
                            <p className="text-xs text-gray-500 mt-1">
                              On-chain:{" "}
                              {holding.onChainBalance.toLocaleString(
                                undefined,
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Distribution History Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Distribution History
          </h2>
          {distributions.length > 0 && (
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={distributionFilter}
                onChange={(e) => setDistributionFilter(e.target.value)}
                className="text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="capital_gain">Capital Gain</option>
                <option value="liquidation">Liquidation</option>
              </select>
            </div>
          )}
        </div>
        {distributions.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No distributions yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Distributions will appear here as SPVs generate returns.
            </p>
          </div>
        ) : filteredDistributions.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <p className="text-sm text-gray-500">
              No distributions match the selected filter.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredDistributions.map((distribution) => (
                <li key={distribution.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {distribution.spvName}
                      </p>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span className="capitalize">
                          {distribution.distributionType.replace("_", " ")}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(
                            distribution.processedAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm font-medium text-gray-900">
                        $
                        {distribution.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        ${distribution.perTokenAmount.toFixed(4)} per token
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

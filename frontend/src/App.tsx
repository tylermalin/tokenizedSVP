import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SPVList from "./pages/SPVList";
import SPVCreate from "./pages/SPVCreate";
import SPVDetail from "./pages/SPVDetail";
import Subscription from "./pages/Subscription";
import InvestorPortfolio from "./pages/InvestorPortfolio";
import AdminPanel from "./pages/AdminPanel";
import KYCPage from "./pages/KYCPage";
import ManagerKYC from "./pages/ManagerKYC";
import ManagerDashboard from "./pages/ManagerDashboard";
import InvitationLanding from "./pages/InvitationLanding";
import AdminInvestorReview from "./pages/AdminInvestorReview";
import AdminManagerReview from "./pages/AdminManagerReview";
import AdminSPVReview from "./pages/AdminSPVReview";
import Landing from "./pages/Landing";

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/invite/:token" element={<InvitationLanding />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="spvs" element={<SPVList />} />
            <Route path="spvs/create" element={<SPVCreate />} />
            <Route path="spvs/:id" element={<SPVDetail />} />
            <Route path="subscriptions/:id" element={<Subscription />} />
            <Route path="portfolio" element={<InvestorPortfolio />} />
            <Route path="kyc" element={<KYCPage />} />
            <Route path="manager/kyc" element={<ManagerKYC />} />
            <Route path="manager/fundraising" element={<ManagerDashboard />} />
            <Route path="admin" element={<AdminPanel />} />
            <Route
              path="admin/reviews/investor/:investorId"
              element={<AdminInvestorReview />}
            />
            <Route
              path="admin/reviews/manager/:managerId"
              element={<AdminManagerReview />}
            />
            <Route
              path="admin/reviews/spv/:spvId"
              element={<AdminSPVReview />}
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

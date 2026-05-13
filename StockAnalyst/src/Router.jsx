import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import GlossaryPage from "./pages/GlossaryPage";
import IndustryGuidePage from "./pages/IndustryGuidePage";
import SupabaseTest from "./pages/SupabaseTest";
import AutoMigrate from "./pages/AutoMigrate";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import TermsPage from "./pages/TermsPage";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import AdminLoginPage from "./pages/auth/AdminLoginPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import TopMoversPage from "./pages/TopMoversPage";
import PembelajaranRitelPage from "./pages/PembelajaranRitelPage";

const Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/glossary" element={<GlossaryPage />} />
                <Route path="/industry-guide" element={<IndustryGuidePage />} />
                <Route path="/top-movers" element={<TopMoversPage />} />
                <Route path="/pembelajaran" element={<PembelajaranRitelPage />} />
                <Route path="/test-supabase" element={<SupabaseTest />} />
                <Route path="/migrate" element={<AutoMigrate />} />
                <Route path="/terms" element={<TermsPage />} />

                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                <Route
                    path="/dashboard/admin"
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
};

export default Router;

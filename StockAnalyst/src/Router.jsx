import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import GlossaryPage from "./pages/GlossaryPage";
import IndustryGuidePage from "./pages/IndustryGuidePage";
import SupabaseTest from "./pages/SupabaseTest";
import AutoMigrate from "./pages/AutoMigrate";
import LoginPage from "./pages/auth/LoginPage";
import OTPLoginPage from "./pages/auth/OTPLoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import OTPRegisterPage from "./pages/auth/OTPRegisterPage";
import EducatorRegisterPage from "./pages/auth/EducatorRegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import EducationFeedPage from "./pages/education/EducationFeedPage";
import EducationDetailsPage from "./pages/education/EducationDetailsPage";
import CreatePostPage from "./pages/education/CreatePostPage";
import EditPostPage from "./pages/education/EditPostPage";
import EducatorDashboard from "./pages/dashboard/EducatorDashboard";
import TermsPage from "./pages/TermsPage";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import AdminLoginPage from "./pages/auth/AdminLoginPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/glossary" element={<GlossaryPage />} />
                <Route path="/industry-guide" element={<IndustryGuidePage />} />
                <Route path="/test-supabase" element={<SupabaseTest />} />
                <Route path="/migrate" element={<AutoMigrate />} />
                <Route path="/terms" element={<TermsPage />} />

                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/login/otp" element={<OTPLoginPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/register/otp" element={<OTPRegisterPage />} />
                <Route path="/register/educator" element={<EducatorRegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Education Routes */}
                <Route path="/education" element={<EducationFeedPage />} />
                <Route path="/education/:postId" element={<EducationDetailsPage />} />
                <Route
                    path="/education/create"
                    element={
                        <ProtectedRoute requiredRole="educator">
                            <CreatePostPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/education/edit/:postId"
                    element={
                        <ProtectedRoute requiredRole="educator">
                            <EditPostPage />
                        </ProtectedRoute>
                    }
                />

                {/* Dashboard Routes */}
                <Route
                    path="/dashboard/educator"
                    element={
                        <ProtectedRoute requiredRole="educator">
                            <EducatorDashboard />
                        </ProtectedRoute>
                    }
                />
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

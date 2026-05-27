import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import GlossaryPage from "./pages/GlossaryPage";
import IndustryGuidePage from "./pages/IndustryGuidePage";
import TermsPage from "./pages/TermsPage";

const Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/glossary" element={<GlossaryPage />} />
                <Route path="/industry-guide" element={<IndustryGuidePage />} />
                <Route path="/terms" element={<TermsPage />} />
            </Routes>
        </BrowserRouter>
    );
};

export default Router;

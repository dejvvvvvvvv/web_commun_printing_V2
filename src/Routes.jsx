import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import Login from './pages/login';
import PrinterCatalog from './pages/printer-catalog';
import HostDashboard from './pages/host-dashboard';
import ModelUpload from './pages/model-upload';
import CustomerDashboard from './pages/customer-dashboard';
import Register from './pages/register';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<CustomerDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/printer-catalog" element={<PrinterCatalog />} />
        <Route path="/host-dashboard" element={<HostDashboard />} />
        <Route path="/model-upload" element={<ModelUpload />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;

import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import ErrorBoundary from "@/components/ErrorBoundary";
import PrivateRoute from "@/components/PrivateRoute";
import NotFound from "@/pages/NotFound";
import Login from '@/pages/login';
import PrinterCatalog from '@/pages/printer-catalog';
import HostDashboard from '@/pages/host-dashboard';
import ModelUpload from '@/pages/model-upload';
import CustomerDashboard from '@/pages/customer-dashboard';
import Register from '@/pages/register';
import Eshop from '@/pages/eshop';
import Orders from '@/pages/orders';
import OrderDetails from '@/pages/orders/details';
import Account from './pages/account';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Public Routes */}
          <Route path="/" element={<Eshop />} /> // Default public route is now /eshop
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/printer-catalog" element={<PrinterCatalog />} />
          <Route path="/eshop" element={<Eshop />} />
          <Route path="/model-upload" element={<ModelUpload />} />
          
          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/host-dashboard" element={<HostDashboard />} />
            <Route path="/customer-dashboard" element={<CustomerDashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route path="/account" element={<Account />} />
          </Route>

          {/* Not Found Route */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;

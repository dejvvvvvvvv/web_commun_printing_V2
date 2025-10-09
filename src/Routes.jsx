import React from 'react';
import { BrowserRouter, Routes as RouterRoutes, Route } from 'react-router-dom';

import SiteLayout from './layouts/SiteLayout';
import Eshop from './pages/eshop';
import ModelUpload from './pages/model-upload';
import AccountPage from './pages/account';
import PrivateRoute from './components/PrivateRoute';
import CustomerDashboard from './pages/customer-dashboard';
import Orders from './pages/orders';
import OrderDetails from './pages/orders/details';
import NotFound from './pages/NotFound';
import Login from './pages/login';
import Register from './pages/register';
import PrinterCatalog from './pages/printer-catalog';

export default function Routes() {
  return (
    <BrowserRouter>
      <RouterRoutes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* VŠECHNY stránky pod jedním layoutem s Headerem */}
        <Route element={<SiteLayout />}>
          {/* veřejné */}
          <Route path="/" element={<Eshop />} />
          <Route path="/eshop" element={<Eshop />} />
          <Route path="/model-upload" element={<ModelUpload />} />
          <Route path="/printer-catalog" element={<PrinterCatalog />} />

          {/* chráněné */}
          <Route element={<PrivateRoute />}>
            <Route path="/account" element={<AccountPage />} />
            <Route path="/customer-dashboard" element={<CustomerDashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </RouterRoutes>
    </BrowserRouter>
  );
}

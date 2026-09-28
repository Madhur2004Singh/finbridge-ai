import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Guard from "../features/auth/Guard";
import Loading from "../components/ui/Loading";

// Lazy-loaded features for code-splitting
const AuthPage = lazy(() => import("../features/auth/AuthPage"));
const Dashboard = lazy(() => import("../features/dashboard/Dashboard"));
const Schemes = lazy(() => import("../features/schemes/Schemes"));
const SchemeDetail = lazy(() => import("../features/schemes/SchemeDetail"));
const Tracker = lazy(() => import("../features/tracker/Tracker"));
const Literacy = lazy(() => import("../features/literacy/Literacy"));
const Profile = lazy(() => import("../features/profile/Profile"));

function SuspenseFallback() {
  return <Loading text="Loading..." />;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage register />} />

        <Route
          path="/"
          element={
            <Guard>
              <Layout />
            </Guard>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="schemes" element={<Schemes />} />
          <Route path="schemes/:slug" element={<SchemeDetail />} />
          <Route path="tracker" element={<Tracker />} />
          <Route path="literacy" element={<Literacy />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

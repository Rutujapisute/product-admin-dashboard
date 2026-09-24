import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import ProductForm from "./pages/ProductForm";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(Boolean(localStorage.getItem("token")));

  return (
    <Routes>
      <Route
        path="/login"
        element={
          loggedIn
            ? <Navigate to="/products" replace />
            : <Login onLogin={() => setLoggedIn(true)} />
        }
      />

      <Route
        path="*"
        element={
          <ProtectedRoute>
            <Layout onLogout={() => setLoggedIn(false)}>
              <Routes>
                <Route path="/" element={<Navigate to="/products" replace />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/new" element={<ProductForm />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/products/:id/edit" element={<ProductForm />} />
                <Route path="*" element={<Navigate to="/products" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

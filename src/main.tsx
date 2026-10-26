import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { Layout } from "./components/Layout";
import CatalogPage from "./pages/CatalogPage";
import AdminPage from "./pages/AdminPage";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route
            path="/"
            element={
              <Layout>
                <CatalogPage />
              </Layout>
            }
          />
          <Route
            path="/admin"
            element={
              <Layout>
                <AdminPage />
              </Layout>
            }
          />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  </StrictMode>,
);

// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Home/Dashboard";
import Settings from "./pages/Home/Settings";
import AdminLayout from "./components/Layout/AdminLayout";
import Register from "./components/Auth/Register";
import LoginPage from "./components/Auth/LoginPage";
import CategoryManager from "./pages/Category/CategoryManager";
import CategoryForm from "./pages/Category/CategoryForm";
import ProductEditor from "./pages/Product/ProductEditor";
import ProductView from "./pages/Product/ProductView";
import ProductList from "./pages/Product/ProductList";

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Register />} />
        {/* <Route path="/verify-otp" element={<VerifyOtp />} /> */}
        {/* <Route path="/login" element={<LoginPage />} /> */}

        {/* Admin Routes (with layout) */}
        <Route path="/" element={<AdminLayout />} >
          <Route index element={<Dashboard />} />
          {/* <Route path="sellers" element={<Sellers />} /> */}
          <Route path="categories" element={<CategoryManager />} />
          <Route path="categories/new" element={<CategoryForm />} />
          <Route path="categories/edit/:id" element={<CategoryForm />} />

          {/* Product Management (Section 4) */}
          <Route path="products" element={<ProductList />} />
          <Route path="products/new" element={<ProductEditor />} />
          <Route path="products/edit/:id" element={<ProductEditor />} /> {/* <-- NEW EDIT ROUTE */}
          <Route path="products/view/:id" element={<ProductView />} /> {/* <-- NEW VIEW ROUTE */}

          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

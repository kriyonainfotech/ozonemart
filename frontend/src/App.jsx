// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Home/Dashboard";
import Settings from "./pages/Home/Settings";
import AdminLayout from "./components/Layout/AdminLayout";
import Register from "./components/Auth/Register";
import LoginPage from "./components/Auth/LoginPage";

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
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from "react";
import Dashboard from "./components/dashboard/Dashboard";
import Login from "./Login";
import CustomerForm from "./components/customer/CustomerData";
import Header from "./Header";
import SideMenu from "./SideMenu";
import TransportData from './components/transport/TransportData';
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import TransportReport from "./components/reports/TransportReport";
const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
import './style.css';

const App = () => {
  const [role, setRole] = useState(localStorage.getItem('userRole'));
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("dashboard");

  const handleLogin = (role) => {
    setRole(role);
    localStorage.setItem('userRole', role);
  };

  if (!role) {
    return <Login onLogin={handleLogin} />;
  }

  const logout = () => {
    localStorage.removeItem('userRole');
    setRole(null);
  }

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  const showMenu = (route) => {
    setSelectedMenu(route);
    setMenuOpen(!menuOpen);
  }
  return (
    <Router>
      <div className="app-container">
        <Header toggleMenu={toggleMenu} />
        <SideMenu
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          toggleMenu={toggleMenu}
          showMenu={showMenu}
          logout={logout}
          setSelectedMenu={setSelectedMenu}
        />
      </div>
      <div>
        {selectedMenu === "dashboard" && <Dashboard />}
        {selectedMenu === "customerData" && <CustomerForm />}
        {selectedMenu === "transportData" && <TransportData />}
        {selectedMenu === "transportReport" && <TransportReport />}
      </div>
    </Router>
  );
};

root.render(<App />);

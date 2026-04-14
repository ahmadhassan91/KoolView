import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserSquare, Calendar, Briefcase, Truck, FileText, FileSpreadsheet, Settings, Bell, Search, Plus } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Customers from './pages/Customers';
import Jobs from './pages/Jobs';
import FieldOps from './pages/FieldOps';
import Documents from './pages/Documents';
import Billing from './pages/Billing';

const NavItem = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  
  return (
    <Link to={to} className={`nav-item ${isActive ? 'active' : ''}`}>
      <Icon className="nav-icon" />
      <span>{label}</span>
    </Link>
  );
};

function Layout({ children }) {
  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-icon">KV</div>
          <div className="brand-text">Kool View</div>
        </div>
        
        <nav className="sidebar-nav">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/leads" icon={Users} label="Leads & Schedule" />
          <NavItem to="/customers" icon={UserSquare} label="Customers CRM" />
          <NavItem to="/jobs" icon={Briefcase} label="Internal Jobs" />
          <NavItem to="/field-ops" icon={Truck} label="Field Operations" />
          <NavItem to="/documents" icon={FileText} label="Documents" />
          <NavItem to="/billing" icon={FileSpreadsheet} label="Billing" />
        </nav>
        
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <NavItem to="/settings" icon={Settings} label="Settings" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div style={{ flex: 1 }}>
             <div style={{ position: 'relative', width: '300px' }}>
               <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
               <input 
                 type="text" 
                 placeholder="Search jobs, leads, or addresses..." 
                 style={{ 
                   width: '100%', 
                   padding: '0.6rem 1rem 0.6rem 2.5rem', 
                   borderRadius: 'var(--radius-full)', 
                   border: '1px solid var(--border)',
                   backgroundColor: 'var(--bg-subtle)',
                   outline: 'none',
                   fontSize: '0.875rem'
                 }} 
               />
             </div>
          </div>
          
          <button className="header-action">
            <Calendar size={20} />
          </button>
          
          <button className="header-action" style={{ position: 'relative' }}>
            <Bell size={20} />
            <span style={{ position: 'absolute', top: '8px', right: '10px', width: '8px', height: '8px', backgroundColor: 'var(--danger)', borderRadius: '50%' }}></span>
          </button>
          
          <div className="user-profile">
            <div className="avatar">D</div>
            <div className="user-info">
              <span className="user-name">Dorothy</span>
              <span className="user-role">Office Manager</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-container">
          {children}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/field-ops" element={<FieldOps />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/settings" element={<div className="animate-fade-in"><h1 className="page-title">Settings</h1><p className="page-subtitle">Configure your dashboard preferences.</p></div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

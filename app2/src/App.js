import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import OfficialWelcomePage from './OfficialWelcomePage';
import OfficialLoginPage from './OfficialLoginPage';
import OfficialSignupPage from './OfficialSignup';
import { OfficialDashboard, ComplaintDetail } from './dashboard';
import ChatPage from './ChatPage';

const OfficialApp = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<OfficialWelcomePage />} />
        <Route path="/login" element={<OfficialLoginPage />} />
        <Route path="/signup" element={<OfficialSignupPage />} />
        <Route path='/dashboard' element={<OfficialDashboard />} />
        <Route path="/complaint-detail/:complaintId" element={<ComplaintDetail />} />
        <Route path="/chat/:complaintId" element={<ChatPage />} />
      </Routes>
    </Router>
  );
};

export default OfficialApp;
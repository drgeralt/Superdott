import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import Triage from './Triage.jsx';
import LandingPage from './LandingPage.jsx';
import FreeTriage from './FreeTriage.jsx';
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/triagem" element={<Triage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/triagemgratuita" element={<FreeTriage />} />
            </Routes>
        </BrowserRouter>
    </StrictMode>
);
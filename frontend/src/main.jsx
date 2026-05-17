import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import Triage from './Triage.jsx';
import Register from './Register.jsx';
import TriagePLG from './TriagePLG.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/triagem-plg" element={<TriagePLG />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/triagem" element={<Triage />} />
            </Routes>
        </BrowserRouter>
    </StrictMode>
);
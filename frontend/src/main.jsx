import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import LandingPage from './LandingPage.jsx';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import Triage from './Triage.jsx';
import FreeTriage from './FreeTriage.jsx';
import Register from './Register.jsx';
import TriagePLG from './TriagePLG.jsx';
import MotorRAG from './MotorRAG.jsx';
import ImportStudents from './ImportStudents.jsx';

import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import MainLayout from './components/layout/MainLayout.jsx';
import PlaceholderPage from './components/layout/PlaceholderPage.jsx';

import Profile from './Profile.jsx';
import SchoolManagement from './SchoolManagement.jsx';
import Teachers from './Teachers.jsx';
import AcademicLinks from './AcademicLinks.jsx';
import MyStudents from './MyStudents.jsx';
import PendingPDIs from './PendingPDIs.jsx';
import MyChildren from './MyChildren.jsx';
import ParentLinkCodes from './ParentLinkCodes.jsx';
import GlobalMetrics from './GlobalMetrics.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                {/* Rotas Públicas */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/triagem-plg" element={<TriagePLG />} />
                <Route path="/triagemgratuita" element={<FreeTriage />} />

                {/* Rotas Privadas e Protegidas (RBAC) */}
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                
                <Route path="/triagem" element={
                    <ProtectedRoute allowedRoles={['Diretor', 'SuperAdmin', 'Professor', 'Pai']}>
                        <MainLayout>
                            <Triage />
                        </MainLayout>
                    </ProtectedRoute>
                } />

                <Route path="/profile" element={
                    <ProtectedRoute>
                        <MainLayout>
                            <Profile />
                        </MainLayout>
                    </ProtectedRoute>
                } />

                {/* SuperAdmin */}
                <Route path="/admin/rag" element={
                    <ProtectedRoute allowedRoles={['SuperAdmin']}>
                        <MainLayout>
                            <MotorRAG />
                        </MainLayout>
                    </ProtectedRoute>
                } />

                <Route path="/admin/metrics" element={
                    <ProtectedRoute allowedRoles={['SuperAdmin']}>
                        <MainLayout>
                            <GlobalMetrics />
                        </MainLayout>
                    </ProtectedRoute>
                } />

                {/* Diretor */}
                <Route path="/escola" element={
                    <ProtectedRoute allowedRoles={['Diretor']}>
                        <MainLayout>
                            <SchoolManagement />
                        </MainLayout>
                    </ProtectedRoute>
                } />

                <Route path="/professores" element={
                    <ProtectedRoute allowedRoles={['Diretor']}>
                        <MainLayout>
                            <Teachers />
                        </MainLayout>
                    </ProtectedRoute>
                } />

                <Route path="/importar-alunos" element={
                    <ProtectedRoute allowedRoles={['Diretor']}>
                        <MainLayout>
                            <ImportStudents />
                        </MainLayout>
                    </ProtectedRoute>
                } />

                <Route path="/vinculos" element={
                    <ProtectedRoute allowedRoles={['Diretor']}>
                        <MainLayout>
                            <AcademicLinks />
                        </MainLayout>
                    </ProtectedRoute>
                } />

                {/* Professor */}
                <Route path="/alunos" element={
                    <ProtectedRoute allowedRoles={['Professor']}>
                        <MainLayout>
                            <MyStudents />
                        </MainLayout>
                    </ProtectedRoute>
                } />

                <Route path="/pdis" element={
                    <ProtectedRoute allowedRoles={['Professor']}>
                        <MainLayout>
                            <PendingPDIs />
                        </MainLayout>
                    </ProtectedRoute>
                } />

                {/* Pai */}
                <Route path="/filhos" element={
                    <ProtectedRoute allowedRoles={['Pai']}>
                        <MainLayout>
                            <MyChildren />
                        </MainLayout>
                    </ProtectedRoute>
                } />

                <Route path="/codigos-vinculo" element={
                    <ProtectedRoute allowedRoles={['Pai']}>
                        <MainLayout>
                            <ParentLinkCodes />
                        </MainLayout>
                    </ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    </StrictMode>
);
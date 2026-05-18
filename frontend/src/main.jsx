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
                            <PlaceholderPage />
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
                            <PlaceholderPage />
                        </MainLayout>
                    </ProtectedRoute>
                } />

                {/* Diretor */}
                <Route path="/escola" element={
                    <ProtectedRoute allowedRoles={['Diretor']}>
                        <MainLayout>
                            <PlaceholderPage />
                        </MainLayout>
                    </ProtectedRoute>
                } />

                <Route path="/professores" element={
                    <ProtectedRoute allowedRoles={['Diretor']}>
                        <MainLayout>
                            <PlaceholderPage />
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
                            <PlaceholderPage />
                        </MainLayout>
                    </ProtectedRoute>
                } />

                {/* Professor */}
                <Route path="/alunos" element={
                    <ProtectedRoute allowedRoles={['Professor']}>
                        <MainLayout>
                            <PlaceholderPage />
                        </MainLayout>
                    </ProtectedRoute>
                } />

                <Route path="/pdis" element={
                    <ProtectedRoute allowedRoles={['Professor']}>
                        <MainLayout>
                            <PlaceholderPage />
                        </MainLayout>
                    </ProtectedRoute>
                } />

                {/* Pai */}
                <Route path="/filhos" element={
                    <ProtectedRoute allowedRoles={['Pai']}>
                        <MainLayout>
                            <PlaceholderPage />
                        </MainLayout>
                    </ProtectedRoute>
                } />

                <Route path="/codigos-vinculo" element={
                    <ProtectedRoute allowedRoles={['Pai']}>
                        <MainLayout>
                            <PlaceholderPage />
                        </MainLayout>
                    </ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    </StrictMode>
);
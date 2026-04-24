import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Auth from './pages/Auth';
import Unlock from './pages/Unlock';
import Dashboard from './pages/Dashboard';
import ZkArchitecture from './pages/ZkArchitecture';
import './index.css';

const ProtectedRoute = ({ children, requireUnlock }) => {
    const { isAuthenticated, isUnlocked } = useContext(AuthContext);

    if (!isAuthenticated) {
        return <Navigate to="/auth" />;
    }

    if (requireUnlock && !isUnlocked) {
        return <Navigate to="/unlock" />;
    }

    return children;
};

const AppRoutes = () => {
    const { isAuthenticated, isUnlocked } = useContext(AuthContext);

    return (
        <Routes>
            <Route path="/auth" element={
                isAuthenticated ? <Navigate to="/unlock" /> : <Auth />
            } />
            <Route path="/unlock" element={
                <ProtectedRoute requireUnlock={false}>
                    {isUnlocked ? <Navigate to="/dashboard" /> : <Unlock />}
                </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
                <ProtectedRoute requireUnlock={true}>
                    <Dashboard />
                </ProtectedRoute>
            } />
            <Route path="/architecture" element={
                <ProtectedRoute requireUnlock={true}>
                    <ZkArchitecture />
                </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to={isAuthenticated ? (isUnlocked ? "/dashboard" : "/unlock") : "/auth"} />} />
        </Routes>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;

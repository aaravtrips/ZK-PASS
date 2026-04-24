import { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [vaultMeta, setVaultMeta] = useState(JSON.parse(localStorage.getItem('vaultMeta')));
    const [masterKey, setMasterKey] = useState(null); // CryptoKey object
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);
    const [isUnlocked, setIsUnlocked] = useState(false);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            setIsAuthenticated(true);
        } else {
            localStorage.removeItem('token');
            setIsAuthenticated(false);
        }
    }, [token]);

    useEffect(() => {
        if (vaultMeta) {
            localStorage.setItem('vaultMeta', JSON.stringify(vaultMeta));
        } else {
            localStorage.removeItem('vaultMeta');
        }
    }, [vaultMeta]);

    const login = (tokenData, metaData) => {
        setToken(tokenData);
        setVaultMeta(metaData);
    };

    const unlock = (key) => {
        setMasterKey(key);
        setIsUnlocked(true);
    };

    const logout = () => {
        setToken(null);
        setVaultMeta(null);
        setMasterKey(null);
        setIsUnlocked(false);
    };

    return (
        <AuthContext.Provider value={{
            token, vaultMeta, masterKey, isAuthenticated, isUnlocked, login, unlock, logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

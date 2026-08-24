'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROLES, MOCK_USERS, ROLE_PERMISSIONS, PERMISSIONS } from '@/constants/rbac';

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = 'ic_admin_current_user_id';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(MOCK_USERS);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const savedUserId = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUserId) {
        const found = MOCK_USERS.find((u) => u.id === savedUserId);
        if (found) {
          setCurrentUser(found);
        }
      }
    } catch (e) {
      console.warn('LocalStorage auth load error', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (userId = 'usr-1') => {
    const foundUser = users.find((u) => u.id === userId) || users[0];
    setCurrentUser(foundUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, foundUser.id);
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
    return foundUser;
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn('LocalStorage remove error', e);
    }
  };

  const switchUser = (userId) => {
    return login(userId);
  };

  const switchRole = (role) => {
    const targetUser = users.find((u) => u.role === role);
    if (targetUser) {
      return login(targetUser.id);
    }
  };

  const hasPermission = (permission) => {
    if (!currentUser) return false;
    if (currentUser.role === ROLES.SUPER_ADMIN) return true;

    const defaultRolePerms = ROLE_PERMISSIONS[currentUser.role] || [];
    if (defaultRolePerms.includes(permission)) {
      if (currentUser.role === ROLES.ADMIN) {
        if (
          currentUser.assignedModules?.includes('all') ||
          currentUser.assignedModules?.includes(permission)
        ) {
          return true;
        }
        if (permission === PERMISSIONS.VIEW_PROFILE || permission === PERMISSIONS.EDIT_PROFILE) {
          return true;
        }
        return false;
      }
      return true;
    }
    return false;
  };

  const canAccessRoute = (path) => {
    if (!currentUser) return false;
    if (currentUser.role === ROLES.SUPER_ADMIN) return true;

    if (currentUser.role === ROLES.MEMBER) {
      return path.startsWith('/profile');
    }

    if (currentUser.role === ROLES.ADMIN) {
      if (path.startsWith('/profile') || path === '/dashboard' || path === '/') return true;
      if (path.includes('/website/notices')) return hasPermission(PERMISSIONS.MANAGE_NOTICES);
      if (path.includes('/website/leadership')) return hasPermission(PERMISSIONS.MANAGE_LEADERSHIP);
      if (path.includes('/website/incubations')) return hasPermission(PERMISSIONS.MANAGE_INCUBATIONS);
      if (path.includes('/website/events')) return hasPermission(PERMISSIONS.MANAGE_EVENTS);
      if (path.includes('/website/team')) return hasPermission(PERMISSIONS.MANAGE_TEAM);
      if (path.includes('/website/gallery')) return hasPermission(PERMISSIONS.MANAGE_GALLERY);
      if (path.includes('/website/faqs')) return hasPermission(PERMISSIONS.MANAGE_FAQS);
      if (path.includes('/induction')) return hasPermission(PERMISSIONS.INDUCTION_VIEW);
      if (path.includes('/evaluation')) return hasPermission(PERMISSIONS.INDUCTION_EVALUATE);
      if (path.includes('/activity-log')) return hasPermission(PERMISSIONS.INDUCTION_VIEW);
      if (path.includes('/settings')) return hasPermission(PERMISSIONS.INDUCTION_SETTINGS);
      if (path.includes('/users')) return hasPermission(PERMISSIONS.MANAGE_USERS);
      return false;
    }

    return false;
  };

  const updateProfile = (updatedFields) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.id === currentUser?.id) {
          const updated = { ...u, ...updatedFields };
          setCurrentUser(updated);
          return updated;
        }
        return u;
      })
    );
  };

  const addUser = (newUser) => {
    const createdUser = {
      ...newUser,
      id: `usr-${Date.now()}`,
      status: 'active',
      joinedAt: new Date().toISOString().split('T')[0],
    };
    setUsers((prev) => [...prev, createdUser]);
    return createdUser;
  };

  const updateUserRoleAndPermissions = (userId, newRole, newModules = []) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, role: newRole, assignedModules: newModules };
          if (currentUser?.id === userId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
  };

  const isSuperAdmin = currentUser?.role === ROLES.SUPER_ADMIN;
  const isAdmin = currentUser?.role === ROLES.ADMIN;
  const isMember = currentUser?.role === ROLES.MEMBER;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        isLoading,
        isAuthenticated: Boolean(currentUser),
        isSuperAdmin,
        isAdmin,
        isMember,
        login,
        logout,
        switchUser,
        switchRole,
        hasPermission,
        canAccessRoute,
        updateProfile,
        addUser,
        updateUserRoleAndPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

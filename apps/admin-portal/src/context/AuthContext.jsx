'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { getApiBaseUrl } from '@/lib/env';
import { PERMISSIONS, ROLES } from '@/constants/rbac';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Validate session against the centralized backend API
  const checkSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/users/me');
      if (res && res.user) {
        const primaryRole = res.isSuperAdmin
          ? 'Super Admin'
          : res.roles?.[0]?.name || res.user.role || 'Member';
        const normalizedUser = {
          ...res.user,
          role: primaryRole,
          roles: res.roles || [],
          teams: res.teams || res.user.teams || [],
        };
        setCurrentUser(normalizedUser);
        setRoles(res.roles || []);
        setPermissions(res.permissions || []);
        setIsSuperAdmin(Boolean(res.isSuperAdmin));
        return normalizedUser;
      }
      setCurrentUser(null);
      setRoles([]);
      setPermissions([]);
      setIsSuperAdmin(false);
      return null;
    } catch {
      // 401 Unauthorized or no active session
      setCurrentUser(null);
      setRoles([]);
      setPermissions([]);
      setIsSuperAdmin(false);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  /**
   * Google OAuth Login Initiation
   * Redirects the user directly to BetterAuth Google Social sign-in
   */
  const initiateGoogleSignIn = async () => {
    const apiBaseUrl = getApiBaseUrl();
    const callbackURL = `${window.location.origin}/dashboard`;

    try {
      // 1. First try POST to BetterAuth sign-in social endpoint
      const res = await fetch(`${apiBaseUrl}/auth/sign-in/social`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          provider: 'google',
          callbackURL,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.url) {
          window.location.href = data.url;
          return;
        }
      }
    } catch (err) {
      console.warn('POST /auth/sign-in/social error, falling back to GET navigation:', err);
    }

    // 2. Direct browser navigation to GET /auth/sign-in/social
    window.location.href = `${apiBaseUrl}/auth/sign-in/social?provider=google&callbackURL=${encodeURIComponent(callbackURL)}`;
  };

  /**
   * Server-side Session Invalidation & Logout
   */
  const logout = async () => {
    try {
      await apiClient.post('/auth/sign-out', {});
    } catch (err) {
      console.warn('Error during backend sign out:', err);
    } finally {
      setCurrentUser(null);
      setRoles([]);
      setPermissions([]);
      setIsSuperAdmin(false);
      router.push('/login');
    }
  };

  /**
   * Permission Verification
   * Supports both legacy shorthand keys and backend canonical RBAC keys.
   */
  const hasPermission = (permission) => {
    if (!currentUser) return false;
    if (isSuperAdmin) return true;

    const userRole = roles[0]?.name || currentUser.role;
    if (userRole === ROLES.SUPER_ADMIN || userRole === 'Super Admin') return true;
    if (roles.some((r) => r.name?.toLowerCase() === 'developer')) return true;

    // Check direct match
    if (permissions.includes(permission)) return true;

    // Shorthand <-> Canonical key mapping
    const MAPPINGS = {
      [PERMISSIONS.MANAGE_GALLERY]: ['cms_gallery:manage:any', 'cms_gallery:read:any', 'cms:read:any'],
      [PERMISSIONS.MANAGE_NOTICES]: ['cms_notices:manage:any', 'cms_notices:read:any', 'cms:read:any'],
      [PERMISSIONS.MANAGE_EVENTS]: ['cms_events:manage:any', 'cms_events:read:any', 'cms:read:any'],
      [PERMISSIONS.MANAGE_INCUBATIONS]: ['cms_incubations:manage:any', 'cms_incubations:read:any', 'cms:read:any'],
      [PERMISSIONS.MANAGE_TALKS]: ['cms_talks:manage:any', 'cms_talks:read:any', 'cms:read:any'],
      [PERMISSIONS.MANAGE_FAQS]: ['cms_faqs:manage:any', 'cms_faqs:read:any', 'cms:read:any'],
      [PERMISSIONS.MANAGE_QUERIES]: ['cms_queries:manage:any', 'cms_queries:read:any', 'cms:read:any'],
      [PERMISSIONS.MANAGE_TEAM]: ['cms_team:manage:any', 'cms_team:read:any', 'cms:read:any'],
      [PERMISSIONS.MANAGE_TEAMS]: ['team:read:any', 'team:create:any', 'team:update:any'],
      [PERMISSIONS.MANAGE_USERS]: ['user:read:any', 'user:create:any', 'user:update:any'],
      [PERMISSIONS.INDUCTION_VIEW]: ['induction_application:read:any'],
      [PERMISSIONS.INDUCTION_EVALUATE]: ['induction_evaluation:create:any', 'induction_evaluation:read:any'],
      [PERMISSIONS.INDUCTION_SETTINGS]: ['induction_settings:read:any', 'induction_settings:update:any'],
    };

    const alternatives = MAPPINGS[permission];
    if (alternatives && alternatives.some((alt) => permissions.includes(alt))) {
      return true;
    }

    // Admin default modules fallback
    if (userRole === ROLES.ADMIN || userRole === 'Admin') {
      return true;
    }

    return false;
  };

  /**
   * Route access verification
   */
  const canAccessRoute = (path) => {
    if (!currentUser) return false;
    if (isSuperAdmin) return true;

    const userRole = roles[0]?.name || currentUser.role;
    if (userRole === ROLES.SUPER_ADMIN || userRole === 'Super Admin') return true;
    if (roles.some((r) => r.name?.toLowerCase() === 'developer')) return true;

    if (path.startsWith('/profile') || path.startsWith('/tasks')) return true;
    if (path === '/dashboard' || path === '/') {
      return userRole !== ROLES.MEMBER && userRole !== 'Member';
    }

    if (path.includes('/main-website/notices')) return hasPermission(PERMISSIONS.MANAGE_NOTICES);
    if (path.includes('/main-website/incubations')) return hasPermission(PERMISSIONS.MANAGE_INCUBATIONS);
    if (path.includes('/main-website/events')) return hasPermission(PERMISSIONS.MANAGE_EVENTS);
    if (path.includes('/main-website/team')) return hasPermission(PERMISSIONS.MANAGE_TEAM);
    if (path.includes('/main-website/gallery')) return hasPermission(PERMISSIONS.MANAGE_GALLERY);
    if (path.includes('/main-website/faqs')) return hasPermission(PERMISSIONS.MANAGE_FAQS);
    if (path.includes('/main-website/talks')) return hasPermission(PERMISSIONS.MANAGE_TALKS);
    if (path.includes('/main-website/queries')) return hasPermission(PERMISSIONS.MANAGE_QUERIES);
    if (path.includes('/teams')) return hasPermission(PERMISSIONS.MANAGE_USERS);
    if (path.includes('/induction')) return hasPermission(PERMISSIONS.INDUCTION_VIEW);
    if (path.includes('/evaluation')) return hasPermission(PERMISSIONS.INDUCTION_EVALUATE);
    if (path.includes('/activity-log')) return hasPermission(PERMISSIONS.INDUCTION_VIEW);
    if (path.includes('/settings')) return hasPermission(PERMISSIONS.INDUCTION_SETTINGS);
    if (path.includes('/users')) return hasPermission(PERMISSIONS.MANAGE_USERS);
    if (path.includes('/permissions')) return isSuperAdmin;

    return false;
  };

  /**
   * Update Profile
   */
  const updateProfile = async (formData) => {
    try {
      const res = await apiClient.put('/users/me', formData);
      if (res && res.user) {
        const primaryRole = res.isSuperAdmin
          ? 'Super Admin'
          : res.roles?.[0]?.name || res.user.role || 'Member';
        const normalizedUser = {
          ...res.user,
          role: primaryRole,
          roles: res.roles || [],
          teams: res.teams || res.user.teams || [],
        };
        setCurrentUser(normalizedUser);
        return normalizedUser;
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      throw err;
    }
  };

  const isAdmin = isSuperAdmin || roles.some((r) => r.name === 'Admin' || r.name === ROLES.ADMIN);
  const isMember = roles.some((r) => r.name === 'Member' || r.name === ROLES.MEMBER);
  const isDeveloper = roles.some((r) => r.name?.toLowerCase() === 'developer');
  const canAddUser = isSuperAdmin || isDeveloper;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        roles,
        permissions,
        isLoading,
        isAuthenticated: Boolean(currentUser),
        isSuperAdmin,
        isAdmin,
        isMember,
        isDeveloper,
        canAddUser,
        updateProfile,
        login: initiateGoogleSignIn,
        initiateGoogleSignIn,
        logout,
        checkSession,
        hasPermission,
        canAccessRoute,
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

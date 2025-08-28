'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts';
import { UserRole } from '@municollect/shared';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/' 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait for auth check to complete

    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Check role-based access if roles are specified
    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
      // Redirect based on user role
      if (user.role === 'resident') {
        router.push('/dashboard');
      } else {
        router.push('/muni-dashboard');
      }
      return;
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router, redirectTo]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render children if not authenticated or wrong role
  if (!isAuthenticated || (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}
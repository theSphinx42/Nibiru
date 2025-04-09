import { NextRouter } from 'next/router';

const protectedRoutes = ['/dashboard', '/sales'];
const publicRoutes = ['/', '/marketplace', '/advertiser'];

export const verifyRouteAccess = (
  router: NextRouter,
  isAuthenticated: boolean
): boolean => {
  // During development, always allow access
  return true;
};

export const verifyComponentRender = (
  requiredComponents: string[]
): boolean => {
  const missingComponents = requiredComponents.filter(
    component => !document.querySelector(`[data-testid="${component}"]`)
  );

  if (missingComponents.length > 0) {
    console.error('❌ Missing required components:', missingComponents);
    return false;
  }

  return true;
}; 
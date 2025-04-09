import { useAuth } from '../contexts/AuthContext';

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    requireAuth?: boolean;
    requireAdmin?: boolean;
    redirectTo?: string;
  } = {}
) {
  return function WithAuthComponent(props: P) {
    // During development, always render the component
    return <WrappedComponent {...props} />;
  };
} 
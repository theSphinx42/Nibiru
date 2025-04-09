import { useRouter } from 'next/router';

export const DevNav = () => {
  const router = useRouter();

  const routes = [
    { path: '/', label: '🏠 Home' },
    { path: '/login', label: '🔑 Login' },
    { path: '/signup', label: '📝 Signup' },
    { path: '/marketplace', label: '🛒 Marketplace' },
    { path: '/dashboard', label: '📊 Dashboard' }
  ];

  return (
    <nav className="w-full">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-4">
        <span className="text-purple-400 text-sm">DevNav:</span>
        <div className="flex gap-2">
          {routes.map((route) => (
            <button
              key={route.path}
              onClick={() => router.push(route.path)}
              className={`px-3 py-1 rounded text-sm
                ${router.pathname === route.path
                  ? 'bg-purple-500/20 text-purple-300'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
            >
              {route.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}; 
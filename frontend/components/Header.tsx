import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { FiEdit, FiCheck } from 'react-icons/fi';

const Header = () => {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span 
              onClick={() => router.push('/dashboard')}
              className="text-xl font-bold cursor-pointer"
            >
              Nibiru
            </span>
          </div>
          
          <nav className="flex space-x-4">
            <button
              onClick={() => router.push('/marketplace')}
              className="px-3 py-2 rounded-md text-sm font-medium 
                       text-gray-300 hover:text-white hover:bg-gray-700"
            >
              Marketplace
            </button>
            <button
              onClick={() => router.push('/fact-check')}
              className="px-3 py-2 rounded-md text-sm font-medium 
                       text-gray-300 hover:text-white hover:bg-teal-800 flex items-center"
            >
              <FiCheck className="mr-1" />
              FactCheck
            </button>
            <button
              onClick={() => router.push('/listings/galatea')}
              className="px-3 py-2 rounded-md text-sm font-medium 
                       text-teal-400 hover:text-teal-300 hover:bg-gray-700 flex items-center"
            >
              <FiEdit className="mr-1" />
              Galatea Premium
            </button>
            <button
              onClick={() => router.push('/projects/galatea')}
              className="px-3 py-2 rounded-md text-sm font-medium 
                       text-gray-300 hover:text-white hover:bg-gray-700 flex items-center"
            >
              <FiEdit className="mr-1" />
              Galatea
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-3 py-2 rounded-md text-sm font-medium 
                       text-gray-300 hover:text-white hover:bg-gray-700"
            >
              Dashboard
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 
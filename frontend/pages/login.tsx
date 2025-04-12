import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import StarfieldLoginBG from '../components/StarfieldLoginBG';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
}

const ADMIN_CREDENTIALS = {
  email: 'angelfieroink@hotmail.com',
  password: 'password'
};

const TEST_CREDENTIALS = {
  email: 'login',
  password: 'password'
};

const LoginPage = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFading, setIsFading] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    getValues
  } = useForm<LoginFormData>();

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Call login with email and password
      await login(data.email, data.password);
      
      // Trigger fade transition
      setIsFading(true);
      // Wait for fade animation
      await new Promise(resolve => setTimeout(resolve, 800));
      // Redirect to marketplace
      router.push('/marketplace');
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid login credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Call login with admin credentials
      await login(ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);

      // Trigger fade transition
      setIsFading(true);
      // Wait for fade animation
      await new Promise(resolve => setTimeout(resolve, 800));
      // Redirect to marketplace
      router.push('/marketplace');
    } catch (err) {
      setError('Demo login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <StarfieldLoginBG />
      
      <AnimatePresence>
        {isFading && (
          <motion.div
            className="fixed inset-0 bg-black z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="relative w-full max-w-md p-8 bg-gray-900/80 backdrop-blur-lg rounded-2xl
                   border border-indigo-500/20 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-300">
          Welcome Back
        </h1>

        <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
          <div>
            <input
              {...register('email', { 
                required: 'Email is required'
              })}
              type="text"
              placeholder="Email"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700
                       text-gray-200 focus:outline-none focus:border-indigo-500
                       placeholder-gray-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <input
              {...register('password', { required: 'Password is required' })}
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700
                       text-gray-200 focus:outline-none focus:border-indigo-500
                       placeholder-gray-500"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <p className="text-xs text-gray-400">
              Test Account: login / password
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold
                     hover:bg-indigo-700 transition-colors disabled:opacity-50
                     disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </motion.button>

          <motion.button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-gray-700 text-gray-300 font-semibold
                     hover:bg-gray-600 transition-colors disabled:opacity-50
                     disabled:cursor-not-allowed flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Quick Access</span>
            <span className="text-xs opacity-60">(Admin)</span>
          </motion.button>
        </form>

        <p className="mt-8 text-sm text-gray-400 text-center italic">
          Login system is temporary. SpiritGlyph-based identity coming soon.
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage; 
import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import StarfieldLoginBG from '../components/StarfieldLoginBG';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const SignupPage = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFading, setIsFading] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<SignupFormData>();

  const password = watch('password');

  const handleSignup = async (data: SignupFormData) => {
    setIsLoading(true);
    setError('');
    
    try {
      // For now, we'll just simulate a successful signup and login
      // In a real app, you'd make an API call to create the user
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Login with new user data
      login({
        name: data.name,
        email: data.email,
        role: "USER",
        quantumScore: 10, // New users start with a small quantum score
        id: `user-${Date.now()}`,
        created_at: new Date().toISOString(),
        services_published: 0,
        total_downloads: 0,
        average_rating: 0,
        weekly_stats: {
          views: 0,
          interactions: 0
        },
        monthly_stats: {
          views: 0,
          interactions: 0
        },
        profileImage: undefined // Changed from null to undefined to match type
      });
      
      // Trigger fade transition
      setIsFading(true);
      // Wait for fade animation
      await new Promise(resolve => setTimeout(resolve, 800));
      // Redirect to marketplace after successful signup
      router.push('/marketplace');
    } catch (err) {
      console.error('Signup error:', err);
      setError('An error occurred during signup. Please try again.');
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
                   border border-purple-500/20 shadow-xl m-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-center mb-8 text-purple-300">
          Create Your Account
        </h1>

        <form onSubmit={handleSubmit(handleSignup)} className="space-y-6">
          <div>
            <input
              {...register('name', { 
                required: 'Name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' }
              })}
              type="text"
              placeholder="Your Name"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700
                       text-gray-200 focus:outline-none focus:border-purple-500
                       placeholder-gray-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div>
            <input
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              type="email"
              placeholder="Email Address"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700
                       text-gray-200 focus:outline-none focus:border-purple-500
                       placeholder-gray-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <input
              {...register('password', { 
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700
                       text-gray-200 focus:outline-none focus:border-purple-500
                       placeholder-gray-500"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          <div>
            <input
              {...register('confirmPassword', { 
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match'
              })}
              type="password"
              placeholder="Confirm Password"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700
                       text-gray-200 focus:outline-none focus:border-purple-500
                       placeholder-gray-500"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
            )}
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
            className="w-full py-3 rounded-lg bg-purple-600 text-white font-semibold
                     hover:bg-purple-700 transition-colors disabled:opacity-50
                     disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </motion.button>

          <div className="text-center mt-4">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300">
                Login
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SignupPage; 
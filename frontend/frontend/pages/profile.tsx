import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import UserProfile from '../components/UserProfile';
import ServiceListing from '../components/ServiceListing';
import QuantumBreakdown from '../components/QuantumBreakdown';
import { useToast } from '../components/Toast';
import { withAuth } from '../components/withAuth';
import { Service } from '../types';
import { User } from '../types/user';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const ProfilePage = () => {
  const router = useRouter();
  const { user: authUser, updateDisplayName, updateProfileImage } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        // For now, return empty services array
        setServices([]);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        showToast('Failed to load profile data', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (authUser) {
      fetchProfileData();
    }
  }, [authUser, showToast]);

  const handleUpdateProfile = async (updatedData: Partial<User>) => {
    try {
      setIsLoading(true);
      
      // Update user data in AuthContext first
      if (updatedData.displayName) {
        await updateDisplayName(updatedData.displayName);
      }
      if (updatedData.profileImage) {
        await updateProfileImage(updatedData.profileImage);
      }

      // Create update payload with existing data
      const updatePayload = {
        public_name: updatedData.displayName || authUser?.displayName,
        bio: updatedData.bio || authUser?.bio || '',
        website: updatedData.website || authUser?.website || '',
        twitter: updatedData.twitter || authUser?.twitter || '',
        github: updatedData.github || authUser?.github || '',
        avatar_url: updatedData.profileImage || authUser?.profileImage,
        user_id: authUser?.id
      };

      // In development mode, update local state
      if (process.env.NODE_ENV === 'development') {
        const updatedUser = {
          ...authUser,
          ...updatedData,
          profileImage: updatePayload.avatar_url
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        showToast('Profile updated in development mode', 'success');
        return;
      }

      // If not in development, try to update backend
      const response = await api.put('/api/v1/users/profile', updatePayload);

      // Update local user state with new data
      if (response.data) {
        const updatedUser = {
          ...authUser,
          ...updatedData,
          profileImage: updatePayload.avatar_url
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        showToast('Profile updated successfully', 'success');
      }

    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to update profile';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-12 h-12 border-t-2 border-purple-500 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (!authUser) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              Return Home
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <UserProfile
              user={authUser}
              onUpdate={handleUpdateProfile}
            />
          </div>
          
          <div className="lg:col-span-2 space-y-8">
            <QuantumBreakdown userId={authUser.id} />
            
            <div>
              <h3 className="text-xl font-bold mb-4">Your Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map(service => (
                  <ServiceListing
                    key={service.id}
                    service={service}
                    showActions={true}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default withAuth(ProfilePage); 
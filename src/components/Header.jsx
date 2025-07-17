import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import UserProfile from './UserProfile';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiLogOut, FiUser, FiEdit3 } = FiIcons;

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
      <motion.header
        className="bg-white shadow-sm border-b border-gray-200"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img
                src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/HWRXLf7lstECUAG07eRw/media/1d4135a0-1810-4dfd-ad67-0a7807f68a53.png"
                alt="Fortex Seguros"
                className="h-10 w-auto"
              />
              <h1 className="text-xl font-semibold text-fortex-primary">
                {isAdmin ? 'Panel Administrativo' : 'Portal de Clientes'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <SafeIcon icon={FiUser} className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {user?.firstName || user?.email}
                </span>
                {!isAdmin && (
                  <button
                    onClick={() => setShowProfile(true)}
                    className="p-1 text-gray-400 hover:text-fortex-primary transition-colors"
                    title="Editar perfil"
                  >
                    <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-fortex-primary transition-colors"
              >
                <SafeIcon icon={FiLogOut} className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* User Profile Modal */}
      <UserProfile
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </>
  );
};

export default Header;
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiMail, FiLock } = FiIcons;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, loginDemo, user } = useAuth();
  const [showCredentialLogin, setShowCredentialLogin] = useState(true);
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
      return;
    }
    
    const token = searchParams.get('token');
    if (token) {
      handleMagicLinkLogin(token);
    }
  }, [user, searchParams, navigate]);

  const handleMagicLinkLogin = async (token) => {
    setLoading(true);
    try {
      await login(token);
      toast.success('¡Bienvenido al portal de Fortex!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Token inválido o expirado. Intenta con el acceso demo.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    try {
      loginDemo();
      toast.success('¡Bienvenido al portal demo de Fortex!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Error en acceso demo');
      console.error('Demo login error:', error);
    }
  };

  const handleCredentialLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (credentials.email && credentials.password) {
        await login(credentials.email, credentials.password);
        toast.success('¡Bienvenido al portal de Fortex!');
        navigate('/dashboard');
      } else {
        toast.error('Por favor ingresa email y contraseña');
      }
    } catch (error) {
      toast.error('Error al iniciar sesión: ' + (error.message || 'Credenciales inválidas'));
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fortex-primary to-fortex-secondary flex items-center justify-center p-4">
      <motion.div
        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <img
            src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/HWRXLf7lstECUAG07eRw/media/1d4135a0-1810-4dfd-ad67-0a7807f68a53.png"
            alt="Fortex Seguros"
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Portal de Clientes
          </h1>
          <p className="text-gray-600">
            Gestiona tus reclamos de seguros de manera fácil y segura
          </p>
        </div>

        {showCredentialLogin ? (
          <form onSubmit={handleCredentialLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <SafeIcon
                  icon={FiMail}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                />
                <input
                  type="email"
                  required
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials({ ...credentials, email: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  placeholder="tu@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <SafeIcon
                  icon={FiLock}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                />
                <input
                  type="password"
                  required
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-fortex-primary text-white py-3 px-4 rounded-lg hover:bg-fortex-secondary transition-colors font-medium"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setShowCredentialLogin(false)}
                className="text-fortex-primary hover:text-fortex-secondary text-sm font-medium transition-colors"
              >
                Ver otras opciones de acceso
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                Para acceder al portal, utiliza el enlace enviado a tu correo electrónico,
                accede con tus credenciales o prueba el acceso demo.
              </p>
            </div>

            {/* Botón Credenciales */}
            <motion.button
              onClick={() => setShowCredentialLogin(true)}
              className="w-full bg-fortex-primary text-white py-3 px-4 rounded-lg hover:bg-fortex-secondary transition-colors font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Acceder con Email y Contraseña
            </motion.button>

            <div className="text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">o</span>
                </div>
              </div>
            </div>

            {/* Botón Demo */}
            <motion.button
              onClick={handleDemoLogin}
              className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🚀 Acceder como Demo Cliente
            </motion.button>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600 mb-2">
                ¿No tienes un enlace de acceso?
              </p>
              <p className="text-xs text-gray-500">
                Contacta con nuestro equipo de soporte para obtener acceso
              </p>
              <button
                onClick={() => navigate('/admin')}
                className="text-fortex-primary hover:text-fortex-secondary text-sm font-medium transition-colors mt-4"
              >
                Acceso Administrativo
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
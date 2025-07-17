// Mock authentication service
// In production, this would connect to your backend API

export const authService = {
  async validateMagicLink(token) {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock validation - in production, verify token with backend
        if (token && token.length > 10) {
          resolve({
            id: 'user-123',
            contactId: 'contact-456',
            email: 'cliente@ejemplo.com',
            firstName: 'Juan',
            lastName: 'Pérez',
            phone: '+52 55 1234 5678'
          });
        } else {
          reject(new Error('Invalid token'));
        }
      }, 1000);
    });
  },

  async adminLogin(credentials) {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.email === 'admin@fortex.com' && credentials.password === 'admin123') {
          resolve({
            user: {
              id: 'admin-123',
              email: 'admin@fortex.com',
              firstName: 'Administrador',
              role: 'admin'
            },
            token: 'admin-token-12345'
          });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  },

  async validateAdminToken(token) {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (token === 'admin-token-12345') {
          resolve({
            id: 'admin-123',
            email: 'admin@fortex.com',
            firstName: 'Administrador',
            role: 'admin'
          });
        } else {
          reject(new Error('Invalid admin token'));
        }
      }, 500);
    });
  }
};
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  
  // Show fallback UI
  const root = document.getElementById('root');
  if (root && !root.innerHTML.includes('Portal Fortex')) {
    root.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f9fafb; padding: 20px;">
        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 400px; text-align: center;">
          <h1 style="color: #253C80; margin-bottom: 20px; font-size: 24px;">Portal Fortex Seguros</h1>
          <p style="color: #666; margin-bottom: 20px;">Recarga la página para continuar</p>
          <button onclick="window.location.reload()" style="background: #253C80; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 16px;">
            Recargar Página
          </button>
        </div>
      </div>
    `;
  }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

try {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  
  // Fallback rendering
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f9fafb; padding: 20px;">
        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 400px; text-align: center;">
          <h1 style="color: #253C80; margin-bottom: 20px; font-size: 24px;">Portal Fortex Seguros</h1>
          <p style="color: #666; margin-bottom: 20px;">Error al cargar la aplicación. Recarga la página.</p>
          <button onclick="window.location.reload()" style="background: #253C80; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 16px;">
            Recargar Página
          </button>
        </div>
      </div>
    `;
  }
}
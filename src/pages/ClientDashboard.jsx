import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import ClaimCard from '../components/ClaimCard';
import NewClaimModal from '../components/NewClaimModal';
import { useClaims } from '../contexts/ClaimsContext';
import { claimsService } from '../services/claimsService';
import LoadingSpinner from '../components/LoadingSpinner';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import toast from 'react-hot-toast';

const { FiPlus, FiSearch, FiFilter } = FiIcons;

const ClientDashboard = () => {
  const { claims, loading, fetchClaims } = useClaims();
  const [showNewClaimModal, setShowNewClaimModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    tipoReclamo: '',
    aseguradora: '',
    date: ''
  });

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleNewClaim = () => {
    setShowNewClaimModal(true);
  };

  const handleClaimCreated = (newClaim) => {
    fetchClaims();
  };

  const handleCreateComplemento = (claim) => {
    // Crear un nuevo reclamo complemento copiando datos del reclamo original
    const complementoData = {
      firstName: claim.firstName,
      lastName: claim.lastName,
      email: claim.email,
      phone: claim.phone,
      relacionAsegurado: claim.relacionAsegurado,
      nombreAsegurado: claim.nombreAsegurado,
      emailAsegurado: claim.emailAsegurado,
      numeroPoliza: claim.numeroPoliza,
      digitoVerificador: claim.digitoVerificador,
      aseguradora: claim.aseguradora,
      tipoReclamo: 'reembolso',
      tipoSiniestro: 'complemento',
      numeroReclamo: claim.numeroReclamoAseguradora || ''
    };
    
    claimsService.createClaim(complementoData)
      .then(newClaim => {
        toast.success('Reclamo complemento creado exitosamente');
        fetchClaims();
      })
      .catch(error => {
        toast.error('Error al crear reclamo complemento');
        console.error('Error creating complemento:', error);
      });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Filtrar reclamos
  const filteredClaims = claims.filter(claim => {
    // Filtro de búsqueda por texto
    const matchesSearch = 
      searchTerm === '' || 
      claim.nombreAsegurado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.numeroPoliza?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.aseguradora?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (claim.numeroReclamoAseguradora && claim.numeroReclamoAseguradora.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (claim.numeroReclamo && claim.numeroReclamo.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filtro de estado
    const matchesStatus = !filters.status || claim.status === filters.status;
    
    // Filtro de tipo de reclamo
    const matchesTipoReclamo = !filters.tipoReclamo || claim.tipoReclamo === filters.tipoReclamo;
    
    // Filtro de aseguradora
    const matchesAseguradora = !filters.aseguradora || claim.aseguradora === filters.aseguradora;
    
    // Filtro de fecha
    const matchesDate = !filters.date || new Date(claim.createdAt) >= new Date(filters.date);
    
    return matchesSearch && matchesStatus && matchesTipoReclamo && matchesAseguradora && matchesDate;
  });

  // Obtener opciones únicas para los filtros de selección
  const statusOptions = [...new Set(claims.map(claim => claim.status))];
  const tipoReclamoOptions = [...new Set(claims.map(claim => claim.tipoReclamo))];
  const aseguradoraOptions = [...new Set(claims.map(claim => claim.aseguradora))];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="w-full mx-auto px-[5%] py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Dashboard
                </h2>
                <p className="text-gray-600">
                  Bienvenido a tu portal de reclamos de seguros
                </p>
              </div>
              <button
                onClick={handleNewClaim}
                className="flex items-center space-x-2 px-4 py-2 bg-fortex-primary text-white rounded-lg hover:bg-fortex-secondary transition-colors"
              >
                <SafeIcon icon={FiPlus} className="w-4 h-4" />
                <span>Nuevo Reclamo</span>
              </button>
            </div>
          </div>

          {/* Vista de tabla con filtros */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                <h3 className="text-lg font-semibold text-gray-900">Mis Reclamos</h3>
                <button
                  onClick={handleNewClaim}
                  className="flex items-center space-x-2 px-4 py-2 bg-fortex-primary text-white rounded-lg hover:bg-fortex-secondary transition-colors"
                >
                  <SafeIcon icon={FiPlus} className="w-4 h-4" />
                  <span>Nuevo Reclamo</span>
                </button>
              </div>
            </div>

            {/* Filtros */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Estado */}
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-700">Estado</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  >
                    <option value="">Todos</option>
                    {statusOptions.map(status => (
                      <option key={status} value={status}>
                        {status === 'pending' 
                          ? 'Pendiente'
                          : status === 'verified' 
                            ? 'Aprobado'
                            : status === 'rejected' 
                              ? 'Rechazado'
                              : status === 'sent-to-insurer' 
                                ? 'Enviado a Aseguradora'
                                : status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo */}
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tipo</label>
                  <select
                    value={filters.tipoReclamo}
                    onChange={(e) => handleFilterChange('tipoReclamo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  >
                    <option value="">Todos</option>
                    {tipoReclamoOptions.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>

                {/* Aseguradora */}
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-700">Aseguradora</label>
                  <select
                    value={filters.aseguradora}
                    onChange={(e) => handleFilterChange('aseguradora', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  >
                    <option value="">Todas</option>
                    {aseguradoraOptions.map(aseguradora => (
                      <option key={aseguradora} value={aseguradora}>{aseguradora}</option>
                    ))}
                  </select>
                </div>

                {/* Fecha de Creación */}
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-700">Fecha de Creación</label>
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  />
                </div>

                {/* Búsqueda */}
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-700">Buscar</label>
                  <div className="relative">
                    <SafeIcon
                      icon={FiSearch}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                    />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, email, póliza o número de reclamo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asegurado
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Póliza
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Número de Reclamo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aseguradora
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de Creación
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClaims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-gray-50 cursor-pointer">
                      <td 
                        className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                        onClick={() => window.location.href = `#/claim/${claim.id}`}
                      >
                        R-{claim.id.replace('claim-', '').toUpperCase()}
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        onClick={() => window.location.href = `#/claim/${claim.id}`}
                      >
                        {claim.nombreAsegurado}
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        onClick={() => window.location.href = `#/claim/${claim.id}`}
                      >
                        {claim.numeroPoliza}
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        onClick={() => window.location.href = `#/claim/${claim.id}`}
                      >
                        {claim.numeroReclamoAseguradora || claim.numeroReclamo || '-'}
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        onClick={() => window.location.href = `#/claim/${claim.id}`}
                      >
                        {claim.aseguradora}
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        onClick={() => window.location.href = `#/claim/${claim.id}`}
                      >
                        {claim.tipoReclamo}
                        {claim.tipoReclamo === 'reembolso' && claim.tipoSiniestro && 
                          <span className="ml-1 text-xs">({claim.tipoSiniestro})</span>
                        }
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap"
                        onClick={() => window.location.href = `#/claim/${claim.id}`}
                      >
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          claim.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : claim.status === 'verified' 
                              ? 'bg-green-100 text-green-800'
                              : claim.status === 'rejected' 
                                ? 'bg-red-100 text-red-800'
                                : claim.status === 'sent-to-insurer' 
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                        }`}>
                          {claim.status === 'pending' 
                            ? 'Pendiente'
                            : claim.status === 'verified' 
                              ? 'Aprobado'
                              : claim.status === 'rejected' 
                                ? 'Rechazado'
                                : claim.status === 'sent-to-insurer' 
                                  ? 'Enviado'
                                  : claim.status}
                        </span>
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        onClick={() => window.location.href = `#/claim/${claim.id}`}
                      >
                        {new Date(claim.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {claim.tipoReclamo === 'reembolso' && 
                         claim.tipoSiniestro === 'inicial' && 
                         claim.numeroReclamoAseguradora && (
                          <button
                            onClick={() => handleCreateComplemento(claim)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-fortex-primary text-xs font-medium rounded text-fortex-primary hover:bg-fortex-primary hover:text-white"
                          >
                            <SafeIcon icon={FiPlus} className="w-3 h-3 mr-1" />
                            + Reclamo Complemento
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredClaims.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No se encontraron reclamos con los filtros aplicados</p>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <NewClaimModal
        isOpen={showNewClaimModal}
        onClose={() => setShowNewClaimModal(false)}
        onClaimCreated={handleClaimCreated}
      />
    </div>
  );
};

export default ClientDashboard;
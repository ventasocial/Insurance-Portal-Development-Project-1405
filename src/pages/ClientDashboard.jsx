import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import ClaimCard from '../components/ClaimCard';
import NewClaimModal from '../components/NewClaimModal';
import { useClaims } from '../contexts/ClaimsContext';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { claimsService } from '../services/claimsService';
import toast from 'react-hot-toast';

const { FiPlus, FiFileText, FiSearch, FiFilter } = FiIcons;

const ClientDashboard = () => {
  const { claims, loading, fetchClaims } = useClaims();
  const { user } = useAuth();
  const [showNewClaimModal, setShowNewClaimModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState([
    { field: 'status', label: 'Estado', value: '', include: true },
    { field: 'tipoReclamo', label: 'Tipo', value: '', include: true },
    { field: 'aseguradora', label: 'Aseguradora', value: '', include: true },
    { field: 'date', label: 'Fecha de Creación', value: '', include: true, dateFilter: 'after' }
  ]);
  const [viewMode, setViewMode] = useState('table'); // 'cards' or 'table'

  const handleNewClaim = () => {
    setShowNewClaimModal(true);
  };

  const handleClaimCreated = (newClaim) => {
    // Refresh claims list
    fetchClaims();
  };

  const handleFilterChange = (index, field, value) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [field]: value };
    setFilters(newFilters);
  };

  const applyFilters = (claimsList) => {
    return claimsList.filter(claim => {
      return filters.every(filter => {
        if (!filter.value) return true;
        
        if (filter.field === 'date') {
          const claimDate = new Date(claim.createdAt);
          const filterDate = new Date(filter.value);
          if (filter.dateFilter === 'after') {
            return claimDate >= filterDate;
          } else {
            return claimDate <= filterDate;
          }
        }
        
        if (filter.field === 'status') {
          return filter.include 
            ? claim.status === filter.value
            : claim.status !== filter.value;
        }

        if (filter.field === 'tipoReclamo') {
          return filter.include 
            ? claim.tipoReclamo === filter.value
            : claim.tipoReclamo !== filter.value;
        }

        if (filter.field === 'aseguradora') {
          return filter.include 
            ? claim.aseguradora === filter.value
            : claim.aseguradora !== filter.value;
        }
        
        let fieldValue = claim[filter.field];
        if (typeof fieldValue === 'string') {
          fieldValue = fieldValue.toLowerCase();
        }
        const filterValue = filter.value.toLowerCase();
        const matches = fieldValue && fieldValue.includes(filterValue);
        return filter.include ? matches : !matches;
      });
    }).filter(claim => 
      searchTerm === '' || 
      claim.nombreAsegurado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.numeroPoliza?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.aseguradora?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (claim.numeroReclamoAseguradora && claim.numeroReclamoAseguradora.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (claim.numeroReclamo && claim.numeroReclamo.toLowerCase().includes(searchTerm.toLowerCase()))
    );
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

  const filteredClaims = applyFilters(claims);

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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bienvenido, {user?.firstName || user?.email}
            </h2>
            <p className="text-gray-600">
              Gestiona tus reclamos de seguros de manera fácil y segura
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div className="bg-white rounded-lg shadow-sm p-6" whileHover={{ y: -2 }}>
              <div className="flex items-center">
                <SafeIcon icon={FiFileText} className="w-8 h-8 text-fortex-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reclamos</p>
                  <p className="text-2xl font-bold text-gray-900">{claims.length}</p>
                </div>
              </div>
            </motion.div>
            <motion.div className="bg-white rounded-lg shadow-sm p-6" whileHover={{ y: -2 }}>
              <div className="flex items-center">
                <SafeIcon icon={FiFileText} className="w-8 h-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">En Proceso</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {claims.filter(c => ['pending', 'under-review', 'incomplete'].includes(c.status)).length}
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div className="bg-white rounded-lg shadow-sm p-6" whileHover={{ y: -2 }}>
              <div className="flex items-center">
                <SafeIcon icon={FiFileText} className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Finalizados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {claims.filter(c => c.status === 'finalized').length}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Claims List */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Mis Reclamos
                  </h3>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`px-3 py-2 rounded-lg flex items-center ${
                        viewMode === 'cards'
                          ? 'bg-fortex-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <SafeIcon icon={FiFilter} className="w-4 h-4 mr-2" />
                      <span>Tarjetas</span>
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-3 py-2 rounded-lg flex items-center ${
                        viewMode === 'table'
                          ? 'bg-fortex-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <SafeIcon icon={FiFileText} className="w-4 h-4 mr-2" />
                      <span>Tabla</span>
                    </button>
                    <button
                      onClick={handleNewClaim}
                      className="flex items-center space-x-2 px-4 py-2 bg-fortex-primary text-white rounded-lg hover:bg-fortex-secondary transition-colors"
                    >
                      <SafeIcon icon={FiPlus} className="w-4 h-4" />
                      <span>Nuevo Reclamo</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <SafeIcon
                      icon={FiSearch}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                    />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, póliza, aseguradora o número de reclamo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Estado
                    </label>
                    <select
                      value={filters[0].include ? 'include' : 'exclude'}
                      onChange={(e) => handleFilterChange(0, 'include', e.target.value === 'include')}
                      className="text-xs px-2 py-1 border border-gray-300 rounded"
                    >
                      <option value="include">Incluir</option>
                      <option value="exclude">Excluir</option>
                    </select>
                  </div>
                  <select
                    value={filters[0].value}
                    onChange={(e) => handleFilterChange(0, 'value', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  >
                    <option value="">Todos</option>
                    <option value="pending">Pendiente</option>
                    <option value="verified">Aprobado</option>
                    <option value="sent-to-insurer">Enviado a Aseguradora</option>
                    <option value="rejected">Rechazado</option>
                    <option value="finalized">Finalizado</option>
                  </select>
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Tipo
                    </label>
                    <select
                      value={filters[1].include ? 'include' : 'exclude'}
                      onChange={(e) => handleFilterChange(1, 'include', e.target.value === 'include')}
                      className="text-xs px-2 py-1 border border-gray-300 rounded"
                    >
                      <option value="include">Incluir</option>
                      <option value="exclude">Excluir</option>
                    </select>
                  </div>
                  <select
                    value={filters[1].value}
                    onChange={(e) => handleFilterChange(1, 'value', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  >
                    <option value="">Todos</option>
                    <option value="reembolso">Reembolso</option>
                    <option value="programacion">Programación</option>
                    <option value="maternidad">Maternidad</option>
                  </select>
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Aseguradora
                    </label>
                    <select
                      value={filters[2].include ? 'include' : 'exclude'}
                      onChange={(e) => handleFilterChange(2, 'include', e.target.value === 'include')}
                      className="text-xs px-2 py-1 border border-gray-300 rounded"
                    >
                      <option value="include">Incluir</option>
                      <option value="exclude">Excluir</option>
                    </select>
                  </div>
                  <select
                    value={filters[2].value}
                    onChange={(e) => handleFilterChange(2, 'value', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  >
                    <option value="">Todas</option>
                    <option value="GNP">GNP</option>
                    <option value="AXA">AXA</option>
                    <option value="Qualitas">Qualitas</option>
                  </select>
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Fecha de Creación
                    </label>
                    <select
                      value={filters[3].dateFilter || 'after'}
                      onChange={(e) => handleFilterChange(3, 'dateFilter', e.target.value)}
                      className="text-xs px-2 py-1 border border-gray-300 rounded"
                    >
                      <option value="after">Después de</option>
                      <option value="before">Antes de</option>
                    </select>
                  </div>
                  <input
                    type="date"
                    value={filters[3].value}
                    onChange={(e) => handleFilterChange(3, 'value', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Cards View */}
            {viewMode === 'cards' && (
              <div className="p-6">
                {filteredClaims.length === 0 ? (
                  <div className="text-center py-12">
                    <SafeIcon icon={FiFileText} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No tienes reclamos activos
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Cuando tengas reclamos pendientes, aparecerán aquí
                    </p>
                    <button
                      onClick={handleNewClaim}
                      className="px-6 py-3 bg-fortex-primary text-white rounded-lg hover:bg-fortex-secondary transition-colors"
                    >
                      Crear primer reclamo
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClaims.map((claim) => (
                      <div key={claim.id} className="relative">
                        <ClaimCard key={claim.id} claim={claim} />
                        {claim.tipoReclamo === 'reembolso' && claim.tipoSiniestro === 'inicial' && claim.numeroReclamoAseguradora && (
                          <button
                            onClick={() => handleCreateComplemento(claim)}
                            className="absolute top-2 right-2 bg-fortex-primary text-white rounded-full p-1 hover:bg-fortex-secondary transition-colors"
                            title="Crear reclamo complemento"
                          >
                            <SafeIcon icon={FiPlus} className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && (
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
                        Fecha
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredClaims.length > 0 ? (
                      filteredClaims.map((claim) => (
                        <tr
                          key={claim.id}
                          className="hover:bg-gray-50 cursor-pointer"
                        >
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
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex space-x-2">
                              {claim.tipoReclamo === 'reembolso' && claim.tipoSiniestro === 'inicial' && claim.numeroReclamoAseguradora && (
                                <button
                                  onClick={() => handleCreateComplemento(claim)}
                                  className="inline-flex items-center px-2.5 py-1.5 border border-fortex-primary text-xs font-medium rounded text-fortex-primary hover:bg-fortex-primary hover:text-white"
                                >
                                  <SafeIcon icon={FiPlus} className="w-3 h-3 mr-1" />
                                  Complemento
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="px-6 py-12 text-center">
                          <SafeIcon icon={FiFileText} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No tienes reclamos activos
                          </h3>
                          <p className="text-gray-600 mb-6">
                            Cuando tengas reclamos pendientes, aparecerán aquí
                          </p>
                          <button
                            onClick={handleNewClaim}
                            className="px-6 py-3 bg-fortex-primary text-white rounded-lg hover:bg-fortex-secondary transition-colors"
                          >
                            Crear primer reclamo
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* New Claim Modal */}
      <NewClaimModal
        isOpen={showNewClaimModal}
        onClose={() => setShowNewClaimModal(false)}
        onClaimCreated={handleClaimCreated}
      />
    </div>
  );
};

export default ClientDashboard;
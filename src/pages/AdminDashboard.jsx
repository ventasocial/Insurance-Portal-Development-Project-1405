import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import ClaimCard from '../components/ClaimCard';
import NewClaimModal from '../components/NewClaimModal';
import { useClaims } from '../contexts/ClaimsContext';
import LoadingSpinner from '../components/LoadingSpinner';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import toast from 'react-hot-toast';
import { claimsService } from '../services/claimsService';

const { FiFilter, FiSearch, FiClock, FiList, FiPlus } = FiIcons;

const AdminDashboard = () => {
  const { claims, loading, updateClaimStatus, fetchClaims } = useClaims();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'table'
  const [showNewClaimModal, setShowNewClaimModal] = useState(false);
  const [newClaimData, setNewClaimData] = useState(null);
  const [filters, setFilters] = useState([
    { field: 'status', label: 'Estado', value: '', include: true },
    { field: 'nombreAsegurado', label: 'Asegurado', value: '', include: true },
    { field: 'tipoReclamo', label: 'Tipo', value: '', include: true },
    { field: 'aseguradora', label: 'Aseguradora', value: '', include: true },
    { field: 'date', label: 'Fecha de Creación', value: '', include: true, dateFilter: 'after' }
  ]);

  const columns = [
    { id: 'pending', title: 'Documentación Recibida', status: 'pending' },
    { id: 'verified', title: 'Documentación Aprobada', status: 'verified' },
    { id: 'sent-to-insurer', title: 'Enviado a Aseguradora', status: 'sent-to-insurer' }
  ];

  // Función para capitalizar la primera letra
  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Calculate average processing time (in days)
  const calculateAvgProcessingTime = () => {
    const archivedClaims = claims.filter(claim => 
      claim.status === 'archived' && claim.createdAt && claim.updatedAt
    );
    
    if (archivedClaims.length === 0) return 'N/A';
    
    const totalDays = archivedClaims.reduce((sum, claim) => {
      const createdDate = new Date(claim.createdAt);
      const updatedDate = new Date(claim.updatedAt);
      const diffTime = Math.abs(updatedDate - createdDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);
    
    return (totalDays / archivedClaims.length).toFixed(1);
  };

  const getClaimsByStatus = (status) => {
    return claims.filter(claim => 
      claim.status === status && 
      claim.status !== 'archived' && // Don't show archived claims
      (
        searchTerm === '' ||
        claim.nombreAsegurado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.numeroPoliza?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.aseguradora?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (claim.numeroReclamoAseguradora && claim.numeroReclamoAseguradora.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (claim.numeroReclamo && claim.numeroReclamo.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );
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
          return filter.include ? claim.status === filter.value : claim.status !== filter.value;
        }
        
        if (filter.field === 'tipoReclamo') {
          return filter.include ? claim.tipoReclamo === filter.value : claim.tipoReclamo !== filter.value;
        }
        
        if (filter.field === 'aseguradora') {
          return filter.include ? claim.aseguradora === filter.value : claim.aseguradora !== filter.value;
        }
        
        let fieldValue = claim[filter.field];
        if (typeof fieldValue === 'string') {
          fieldValue = fieldValue.toLowerCase();
        }
        
        const filterValue = filter.value.toLowerCase();
        const matches = fieldValue && fieldValue.includes(filterValue);
        return filter.include ? matches : !matches;
      });
    });
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    
    const newStatus = destination.droppableId;
    
    try {
      await updateClaimStatus(draggableId, newStatus);
      toast.success('Estado del reclamo actualizado');
    } catch (error) {
      toast.error('Error al actualizar el estado');
    }
  };

  const handleNewClaim = () => {
    setNewClaimData(null);
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

    // Establecer los datos para el nuevo reclamo y abrir el modal
    setNewClaimData(complementoData);
    setShowNewClaimModal(true);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const filteredClaims = claims.filter(claim => claim.status !== 'archived');
  const tableFilteredClaims = applyFilters(filteredClaims);
  const kanbanFilteredClaims = applyFilters(claims.filter(claim => claim.status !== 'archived'));

  // Obtener opciones únicas para los filtros de selección
  const statusOptions = [...new Set(filteredClaims.map(claim => claim.status))];
  const tipoReclamoOptions = [...new Set(filteredClaims.map(claim => claim.tipoReclamo))];
  const aseguradoraOptions = [...new Set(filteredClaims.map(claim => claim.aseguradora))];

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
                  Panel Operativo
                </h2>
                <p className="text-gray-600">
                  Gestiona todos los reclamos de seguros
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {columns.map((column) => (
              <motion.div
                key={column.id}
                className="bg-white rounded-lg shadow-sm p-4"
                whileHover={{ y: -2 }}
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-fortex-primary">
                    {getClaimsByStatus(column.status).length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {column.title}
                  </p>
                </div>
              </motion.div>
            ))}
            <motion.div
              className="bg-white rounded-lg shadow-sm p-4"
              whileHover={{ y: -2 }}
            >
              <div className="text-center">
                <div className="flex items-center justify-center">
                  <SafeIcon icon={FiClock} className="w-5 h-5 mr-2 text-fortex-primary" />
                  <p className="text-2xl font-bold text-fortex-primary">
                    {calculateAvgProcessingTime()}
                  </p>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Días promedio de revisión
                </p>
              </div>
            </motion.div>
          </div>

          {/* View Toggle and Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 mb-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`px-3 py-2 rounded-lg flex items-center ${
                    viewMode === 'kanban'
                      ? 'bg-fortex-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <SafeIcon icon={FiFilter} className="w-4 h-4 mr-2" />
                  <span>Vista Kanban</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 rounded-lg flex items-center ${
                    viewMode === 'table'
                      ? 'bg-fortex-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <SafeIcon icon={FiList} className="w-4 h-4 mr-2" />
                  <span>Vista Tabla</span>
                </button>
              </div>
              <div className="flex-1 sm:ml-4">
                <div className="relative">
                  <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, email, póliza, aseguradora o número de reclamo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Filtros avanzados para ambas vistas */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
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
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status === 'pending' ? 'Pendiente' :
                       status === 'verified' ? 'Aprobado' :
                       status === 'sent-to-insurer' ? 'Enviado a Aseguradora' :
                       status === 'rejected' ? 'Rechazado' :
                       capitalizeFirstLetter(status)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Tipo
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
                  <option value="">Todos</option>
                  {tipoReclamoOptions.map(tipo => (
                    <option key={tipo} value={tipo}>{capitalizeFirstLetter(tipo)}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Aseguradora
                  </label>
                  <select
                    value={filters[3].include ? 'include' : 'exclude'}
                    onChange={(e) => handleFilterChange(3, 'include', e.target.value === 'include')}
                    className="text-xs px-2 py-1 border border-gray-300 rounded"
                  >
                    <option value="include">Incluir</option>
                    <option value="exclude">Excluir</option>
                  </select>
                </div>
                <select
                  value={filters[3].value}
                  onChange={(e) => handleFilterChange(3, 'value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                >
                  <option value="">Todas</option>
                  {aseguradoraOptions.map(aseguradora => (
                    <option key={aseguradora} value={aseguradora}>{aseguradora}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Asegurado
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
                <input
                  type="text"
                  placeholder="Filtrar por asegurado"
                  value={filters[1].value}
                  onChange={(e) => handleFilterChange(1, 'value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Fecha de Creación
                  </label>
                  <select
                    value={filters[4].dateFilter || 'after'}
                    onChange={(e) => handleFilterChange(4, 'dateFilter', e.target.value)}
                    className="text-xs px-2 py-1 border border-gray-300 rounded"
                  >
                    <option value="after">Después de</option>
                    <option value="before">Antes de</option>
                  </select>
                </div>
                <input
                  type="date"
                  value={filters[4].value}
                  onChange={(e) => handleFilterChange(4, 'value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                        Reclamo
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
                        Creado
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tableFilteredClaims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-gray-50 cursor-pointer">
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                          onClick={() => window.location.href = `#/admin/claim/${claim.id}`}
                        >
                          R-{claim.id.replace('claim-', '').toUpperCase()}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          onClick={() => window.location.href = `#/admin/claim/${claim.id}`}
                        >
                          {claim.nombreAsegurado}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          onClick={() => window.location.href = `#/admin/claim/${claim.id}`}
                        >
                          {claim.numeroPoliza}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          onClick={() => window.location.href = `#/admin/claim/${claim.id}`}
                        >
                          {claim.numeroReclamoAseguradora || claim.numeroReclamo || '-'}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          onClick={() => window.location.href = `#/admin/claim/${claim.id}`}
                        >
                          {claim.aseguradora}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          onClick={() => window.location.href = `#/admin/claim/${claim.id}`}
                        >
                          {capitalizeFirstLetter(claim.tipoReclamo)}
                          {claim.tipoReclamo === 'reembolso' && claim.tipoSiniestro && (
                            <span className="ml-1 text-xs">({capitalizeFirstLetter(claim.tipoSiniestro)})</span>
                          )}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap"
                          onClick={() => window.location.href = `#/admin/claim/${claim.id}`}
                        >
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            claim.status === 'verified' ? 'bg-green-100 text-green-800' :
                            claim.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            claim.status === 'sent-to-insurer' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {claim.status === 'pending' ? 'Pendiente' :
                             claim.status === 'verified' ? 'Aprobado' :
                             claim.status === 'rejected' ? 'Rechazado' :
                             claim.status === 'sent-to-insurer' ? 'Enviado' :
                             capitalizeFirstLetter(claim.status)}
                          </span>
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          onClick={() => window.location.href = `#/admin/claim/${claim.id}`}
                        >
                          {new Date(claim.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex space-x-2">
                            {claim.tipoReclamo === 'reembolso' && 
                             claim.tipoSiniestro === 'inicial' && 
                             claim.numeroReclamoAseguradora && (
                              <button
                                onClick={() => handleCreateComplemento(claim)}
                                className="inline-flex items-center px-2.5 py-1.5 border border-fortex-primary text-xs font-medium rounded text-fortex-primary hover:bg-fortex-primary hover:text-white"
                              >
                                Complemento
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {tableFilteredClaims.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No se encontraron reclamos con los filtros aplicados</p>
                </div>
              )}
            </div>
          )}

          {/* Kanban Board */}
          {viewMode === 'kanban' && (
            <div className="overflow-x-auto">
              <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex justify-center gap-6" style={{ minWidth: `${columns.length * 350}px` }}>
                  {columns.map((column) => (
                    <div
                      key={column.id}
                      className="bg-gray-100 rounded-lg p-4"
                      style={{ minWidth: '350px', flex: '0 0 350px' }}
                    >
                      <h3 className="font-semibold text-gray-900 mb-4 text-center">
                        {column.title}
                      </h3>
                      <Droppable droppableId={column.status}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`min-h-96 space-y-3 ${
                              snapshot.isDraggingOver
                                ? 'bg-blue-50 border-2 border-blue-300 border-dashed'
                                : ''
                            }`}
                          >
                            {kanbanFilteredClaims
                              .filter(claim => claim.status === column.status)
                              .map((claim, index) => (
                                <Draggable key={claim.id} draggableId={claim.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`${
                                        snapshot.isDragging ? 'transform rotate-5 shadow-lg' : ''
                                      }`}
                                    >
                                      <div className="relative">
                                        <ClaimCard claim={claim} isAdmin={true} />
                                        {claim.tipoReclamo === 'reembolso' && 
                                         claim.tipoSiniestro === 'inicial' && 
                                         claim.numeroReclamoAseguradora && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleCreateComplemento(claim);
                                            }}
                                            className="absolute top-2 right-2 bg-fortex-primary text-white rounded-full p-1 hover:bg-fortex-secondary transition-colors"
                                            title="Crear reclamo complemento"
                                          >
                                            <SafeIcon icon={FiPlus} className="w-4 h-4" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  ))}
                </div>
              </DragDropContext>
            </div>
          )}
        </motion.div>
      </main>

      {/* New Claim Modal */}
      <NewClaimModal
        isOpen={showNewClaimModal}
        onClose={() => setShowNewClaimModal(false)}
        onClaimCreated={handleClaimCreated}
        initialData={newClaimData}
      />
    </div>
  );
};

export default AdminDashboard;
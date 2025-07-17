import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import ClaimCard from '../components/ClaimCard';
import { useClaims } from '../contexts/ClaimsContext';
import LoadingSpinner from '../components/LoadingSpinner';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import toast from 'react-hot-toast';

const { FiFilter, FiSearch } = FiIcons;

const AdminDashboard = () => {
  const { claims, loading, updateClaimStatus } = useClaims();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const columns = [
    { id: 'pending', title: 'Documentación Recibida', status: 'pending' },
    { id: 'incomplete', title: 'Documentación Incompleta', status: 'incomplete' },
    { id: 'verified', title: 'Documentación Verificada', status: 'verified' },
    { id: 'sent-to-insurer', title: 'Enviado a Aseguradora', status: 'sent-to-insurer' },
    { id: 'finalized', title: 'Finalizado', status: 'finalized' }
  ];

  const getClaimsByStatus = (status) => {
    return claims.filter(claim => 
      claim.status === status && 
      (searchTerm === '' || 
        claim.nombreAsegurado?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        claim.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        claim.numeroPoliza?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.aseguradora?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
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

  if (loading) {
    return <LoadingSpinner />;
  }

  const filteredClaims = filterStatus === 'all' 
    ? claims 
    : claims.filter(claim => claim.status === filterStatus);

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
              Panel Administrativo
            </h2>
            <p className="text-gray-600">
              Gestiona todos los reclamos de seguros
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
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
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, email, póliza o aseguradora..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <div className="relative">
                  <SafeIcon icon={FiFilter} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  >
                    <option value="all">Todos los estados</option>
                    {columns.map((column) => (
                      <option key={column.id} value={column.status}>
                        {column.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Kanban Board */}
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {columns.map((column) => (
                <div key={column.id} className="bg-gray-100 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4 text-center">
                    {column.title}
                  </h3>
                  <Droppable droppableId={column.status}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-96 space-y-3 ${snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''}`}
                      >
                        {getClaimsByStatus(column.status).map((claim, index) => (
                          <Draggable key={claim.id} draggableId={claim.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`${snapshot.isDragging ? 'transform rotate-5 shadow-lg' : ''}`}
                              >
                                <ClaimCard claim={claim} isAdmin={true} />
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
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboard;
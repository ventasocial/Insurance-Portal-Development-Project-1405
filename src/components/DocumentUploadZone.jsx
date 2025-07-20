import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import toast from 'react-hot-toast';

const { FiUpload, FiFile, FiX, FiLoader } = FiIcons;

const DocumentUploadZone = ({ onFileUpload, acceptedFiles = [], documentType, maxFiles = 5 }) => {
  const [uploading, setUploading] = useState(false);
  
  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      toast.error('Algunos archivos no son válidos. Solo se permiten PDF, JPG, PNG.');
      return;
    }

    if (acceptedFiles.length + acceptedFiles.length > maxFiles) {
      toast.error(`Solo se permiten máximo ${maxFiles} archivos.`);
      return;
    }

    try {
      setUploading(true);
      
      // Process files sequentially
      for (const file of acceptedFiles) {
        await onFileUpload(file, documentType);
      }
      
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error al subir el archivo. Intente nuevamente.');
    } finally {
      setUploading(false);
    }
  }, [onFileUpload, documentType, maxFiles, acceptedFiles.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: maxFiles - acceptedFiles.length,
    disabled: uploading
  });

  const removeFile = (index) => {
    // This should be handled by parent component
    console.log('Remove file at index:', index);
  };

  return (
    <div className="space-y-4">
      <motion.div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDragActive ? 'border-fortex-primary bg-fortex-primary bg-opacity-10' : 'border-gray-300'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-fortex-primary hover:bg-gray-50'}`}
        whileHover={!uploading ? { scale: 1.02 } : {}}
        whileTap={!uploading ? { scale: 0.98 } : {}}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="flex flex-col items-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 text-fortex-primary mb-4"
            >
              <SafeIcon icon={FiLoader} className="w-12 h-12 text-fortex-primary" />
            </motion.div>
            <p className="text-lg font-medium text-gray-700 mb-2">Subiendo archivo...</p>
            <p className="text-sm text-gray-500">Por favor espere</p>
          </div>
        ) : (
          <>
            <SafeIcon icon={FiUpload} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              {isDragActive ? 'Suelta los archivos aquí' : 'Arrastra archivos o haz clic para seleccionar'}
            </p>
            <p className="text-sm text-gray-500">
              PDF, JPG, PNG hasta 10MB cada uno
            </p>
          </>
        )}
      </motion.div>

      {acceptedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Archivos seleccionados:</h4>
          {acceptedFiles.map((file, index) => (
            <motion.div 
              key={index} 
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiFile} className="w-5 h-5 text-fortex-primary" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button 
                onClick={() => removeFile(index)} 
                className="p-1 text-red-500 hover:text-red-700 transition-colors"
              >
                <SafeIcon icon={FiX} className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentUploadZone;
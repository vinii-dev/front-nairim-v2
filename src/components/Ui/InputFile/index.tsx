/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Eye, FileText, Download, Image as ImageIcon, ChevronRight, ChevronLeft } from 'lucide-react';
import Label from '../Label';
import Image from 'next/image';

interface DocumentItem {
  id?: string;
  file_name: string;
  file_url: string;
  type?: string;
  mime_type?: string;
  description?: string;
}

interface FilePreview {
  type: 'image' | 'pdf' | 'other';
  name: string;
  url: string;
  file?: File;
  fileUrl?: string;
  id?: string;
  mimeType?: string;
  documentType?: string;
}

export interface InputFileProps {
  id: string;
  label: string;
  accept: string;
  textButton?: string;
  value?: DocumentItem[] | File[];
  onChange?: (files: File[]) => void;
  svg?: React.ReactNode;
  multiple?: boolean;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  maxFiles?: number;
  isViewMode?: boolean;
}

export default function InputFile({
  id,
  label,
  accept,
  textButton = "Selecionar Arquivos",
  value = [],
  onChange,
  svg,
  multiple = false,
  disabled = false,
  required = false,
  placeholder = "Nenhum arquivo selecionado",
  maxFiles = 10,
  isViewMode = false,
}: InputFileProps) {
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determinar se estamos em modo de visualização (apenas exibir) ou modo de edição/cadastro
  const isEditMode = !isViewMode && !disabled;

  const images = previews.filter(p => p.type === 'image');
  const documents = previews.filter(p => p.type !== 'image');
  
  const imageGridClass = isViewMode 
    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'
    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3';
    
  const documentGridClass = isViewMode 
    ? 'grid-cols-1 sm:grid-cols-1 gap-4'
    : 'grid-cols-1 sm:grid-cols-1 gap-4';

  const getDocumentTypeName = (type?: string): string => {
    if (!type) return 'Documento';
    
    const typeMap: Record<string, string> = {
      'REGISTRATION': 'Matrícula',
      'PROPERTY_RECORD': 'Registro',
      'TITLE_DEED': 'Escritura',
      'IMAGE': 'Imagem',
      'OTHER': 'Outro Documento'
    };
    
    return typeMap[type] || type;
  };

  const getDisplayName = (preview: FilePreview): string => {
    return preview.name;
  };

  // Função para detectar se um item é um DocumentItem (do backend) ou File (novo upload)
  const isDocumentItem = (item: any): item is DocumentItem => {
    return item && 
      typeof item === 'object' && 
      'file_name' in item && 
      'file_url' in item &&
      !(item instanceof File);
  };

  // Função para detectar se é um arquivo novo
  const isFileInstance = (item: any): item is File => {
    return item instanceof File;
  };

  useEffect(() => {
    const generatePreviews = async () => {
      const newPreviews: FilePreview[] = [];
      
      // Se não for modo de edição (ou seja, é visualização ou disabled), trata como DocumentItem[]
      if (!isEditMode) {
        // Trata todos os itens como DocumentItem (vindos do backend)
        const items = value as DocumentItem[];
        for (const item of items) {
          if (item && isDocumentItem(item)) {
            const fileName = item.file_name || item.description || getDocumentTypeName(item.type);
            const fileUrl = item.file_url;
            const fileType = item.type || '';
            const mimeType = item.mime_type || '';
            
            let type: 'image' | 'pdf' | 'other' = 'other';
            
            if (fileType === 'IMAGE' || mimeType.startsWith('image/') || 
                fileName.match(/\.(jpeg|jpg|gif|png|webp|bmp|svg)$/i)) {
              type = 'image';
            } else if (fileType === 'REGISTRATION' || fileType === 'PROPERTY_RECORD' || 
                      fileType === 'TITLE_DEED' || mimeType === 'application/pdf' ||
                      fileName.toLowerCase().endsWith('.pdf')) {
              type = 'pdf';
            }
            
            newPreviews.push({
              type,
              name: fileName,
              url: fileUrl,
              fileUrl: fileUrl,
              id: item.id,
              mimeType: mimeType,
              documentType: item.type,
            });
          }
        }
      } else {
        // Modo de edição: pode ter DocumentItems (existentes) e Files (novos)
        const items = value as any[];
        for (const item of items) {
          if (item && isDocumentItem(item)) {
            // DocumentItem existente do backend
            const fileName = item.file_name || item.description || getDocumentTypeName(item.type);
            const fileUrl = item.file_url;
            const fileType = item.type || '';
            const mimeType = item.mime_type || '';
            
            let type: 'image' | 'pdf' | 'other' = 'other';
            
            if (fileType === 'IMAGE' || mimeType.startsWith('image/') || 
                fileName.match(/\.(jpeg|jpg|gif|png|webp|bmp|svg)$/i)) {
              type = 'image';
            } else if (fileType === 'REGISTRATION' || fileType === 'PROPERTY_RECORD' || 
                      fileType === 'TITLE_DEED' || mimeType === 'application/pdf' ||
                      fileName.toLowerCase().endsWith('.pdf')) {
              type = 'pdf';
            }
            
            newPreviews.push({
              type,
              name: fileName,
              url: fileUrl,
              fileUrl: fileUrl,
              id: item.id,
              mimeType: mimeType,
              documentType: item.type,
            });
          } else if (item && isFileInstance(item)) {
            // File novo do usuário
            if (item.type.startsWith('image/')) {
              const url = URL.createObjectURL(item);
              newPreviews.push({
                type: 'image',
                name: item.name,
                url,
                file: item,
                mimeType: item.type,
              });
            } else if (item.type === 'application/pdf') {
              newPreviews.push({
                type: 'pdf',
                name: item.name,
                url: URL.createObjectURL(item),
                file: item,
                mimeType: item.type,
              });
            } else {
              newPreviews.push({
                type: 'other',
                name: item.name,
                url: '#',
                file: item,
                mimeType: item.type,
              });
            }
          }
        }
      }
      
      setPreviews(newPreviews);
    };

    if (value && (Array.isArray(value) ? value.length > 0 : true)) {
      generatePreviews();
    } else {
      setPreviews([]);
    }

    return () => {
      previews.forEach(preview => {
        if (preview.url.startsWith('blob:')) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [value, isEditMode, disabled]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !onChange) return;

    const fileArray = Array.from(files);
    
    // Criar um array de FilePreview para os novos arquivos
    const newPreviews: FilePreview[] = fileArray.map(file => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        return {
          type: 'image',
          name: file.name,
          url,
          file,
          mimeType: file.type,
        };
      } else if (file.type === 'application/pdf') {
        return {
          type: 'pdf',
          name: file.name,
          url: URL.createObjectURL(file),
          file,
          mimeType: file.type,
        };
      } else {
        return {
          type: 'other',
          name: file.name,
          url: '#',
          file,
          mimeType: file.type,
        };
      }
    });

    // Atualizar previews mantendo os existentes
    setPreviews(prev => [...prev, ...newPreviews]);

    if (multiple) {
      // Em modo de edição, combinar arquivos existentes com novos
      const currentItems = value as any[];
      
      // Separar DocumentItems existentes dos Files
      const existingDocumentItems = currentItems.filter(isDocumentItem);
      const existingFiles = currentItems.filter(isFileInstance);
      
      // Combinar arquivos existentes com novos
      const combinedFiles = [...existingDocumentItems, ...existingFiles, ...fileArray].slice(0, maxFiles) as any;
      onChange(combinedFiles);
    } else {
      onChange(fileArray.slice(0, 1));
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Modificar o handleRemoveFile para lidar com DocumentItems e Files corretamente:
  const handleRemoveFile = (index: number) => {
    if (!onChange || !isEditMode) return;
    
    // Encontrar o item a ser removido nas previews
    const itemToRemove = previews[index];
    
    // Remover do array de previews
    setPreviews(prev => prev.filter((_, i) => i !== index));
    
    // Se for um DocumentItem (tem id), precisamos marcar para remover no back-end
    const currentItems = value as any[];
    
    // Filtrar o item removido do array principal
    const newItems = currentItems.filter((item, i) => {
      // Se for um DocumentItem, comparar pelo id
      if (isDocumentItem(item) && item.id === itemToRemove.id) {
        return false;
      }
      // Se for um File, comparar pelo objeto File
      if (isFileInstance(item) && itemToRemove.file && item === itemToRemove.file) {
        return false;
      }
      return true;
    });
    
    onChange(newItems);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const openImageModal = (imageUrl: string, index: number) => {
    setModalImage(imageUrl);
    setCurrentImageIndex(index);
  };

  const closeModal = () => {
    setModalImage(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (images.length === 0) return;
    const nextIndex = (currentImageIndex + 1) % images.length;
    setCurrentImageIndex(nextIndex);
    setModalImage(images[nextIndex].fileUrl || images[nextIndex].url);
  };

  const prevImage = () => {
    if (images.length === 0) return;
    const prevIndex = (currentImageIndex - 1 + images.length) % images.length;
    setCurrentImageIndex(prevIndex);
    setModalImage(images[prevIndex].fileUrl || images[prevIndex].url);
  };

  const handleDownload = async (preview: FilePreview) => {
    try {
      if (preview.fileUrl && preview.fileUrl !== '#') {
        const link = document.createElement('a');
        link.href = preview.fileUrl;
        link.download = preview.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (preview.file) {
        const url = URL.createObjectURL(preview.file);
        const link = document.createElement('a');
        link.href = url;
        link.download = preview.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      if (preview.fileUrl && preview.fileUrl !== '#') {
        window.open(preview.fileUrl, '_blank');
      }
    }
  };

  const handleOpenFile = (preview: FilePreview) => {
    if (preview.fileUrl && preview.fileUrl !== '#') {
      if (preview.type === 'image') {
        const imageIndex = images.findIndex(img => 
          (img.fileUrl || img.url) === (preview.fileUrl || preview.url)
        );
        openImageModal(preview.fileUrl, imageIndex);
      } else {
        window.open(preview.fileUrl, '_blank');
      }
    } else if (preview.file) {
      if (preview.type === 'image') {
        const url = URL.createObjectURL(preview.file);
        openImageModal(url, 0);
      } else {
        const url = URL.createObjectURL(preview.file);
        window.open(url, '_blank');
      }
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const renderImages = () => {
    if (images.length === 0) return null;

    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">
            Imagens ({images.length})
          </h4>
        </div>
        <div className={`grid ${imageGridClass}`}>
          {images.map((preview, index) => (
            <div
              key={preview.id || `image-${index}`}
              className="group relative border rounded-lg overflow-hidden bg-white hover:border-[#8B5CF6] transition-all duration-200"
            >
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => handleRemoveFile(previews.findIndex(p => p === preview))}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 
                           opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <X size={16} />
                </button>
              )}

              <div 
                className="relative w-full cursor-pointer"
                onClick={() => openImageModal(preview.fileUrl || preview.url, index)}
              >
                <div className="relative flex justify-center items-center w-full max-h-[100px] h-full">
                  <Image
                    src={preview.fileUrl || preview.url}
                    alt={preview.name}
                    width={100}
                    height={100}
                    className="object-cover hover:scale-105 transition-transform duration-200 max-w-[100px] min-w-[100px] max-h-[100px] min-h-[100px]"
                    unoptimized
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/300x300?text=Imagem';
                    }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Eye size={24} className="opacity-0 group-hover:opacity-100 text-white bg-black bg-opacity-40 p-1 rounded-full transition-opacity duration-200" />
                </div>
              </div>
              
              <div className="p-3">
                <p className="text-xs font-medium text-gray-800 truncate mb-1">
                  {getDisplayName(preview)}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {preview.file && formatFileSize(preview.file.size)}
                  </span>
                  {!isEditMode && (
                    <button
                      type="button"
                      onClick={() => handleDownload(preview)}
                      className="text-xs text-[#10B981] hover:text-[#059669] hover:underline flex items-center gap-1"
                    >
                      <Download size={12} />
                      Baixar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDocuments = () => {
    if (documents.length === 0) return null;

    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">
            Documentos ({documents.length})
          </h4>
        </div>
        <div className={`grid ${documentGridClass}`}>
          {documents.map((preview, index) => {
            const globalIndex = previews.findIndex(p => p === preview);
            
            return (
              <div
                key={preview.id || `doc-${index}`}
                className="group relative border rounded-lg p-4 bg-white hover:border-[#8B5CF6] transition-all duration-200"
              >
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(globalIndex)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 
                             opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <X size={16} />
                  </button>
                )}

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {preview.type === 'pdf' ? (
                      <div className="p-2 bg-red-50 rounded-lg">
                        <FileText size={24} className="text-red-500" />
                      </div>
                    ) : (
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <FileText size={24} className="text-gray-500" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate mb-1">
                      {getDisplayName(preview)}
                    </p>
                    {preview.file && (
                      <p className="text-xs text-gray-500 mb-2">
                        {formatFileSize(preview.file.size)}
                      </p>
                    )}
                    
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleOpenFile(preview)}
                        className="text-xs text-[#8B5CF6] hover:text-[#7C3AED] hover:underline flex items-center gap-1"
                      >
                        <Eye size={12} />
                        Visualizar
                      </button>
                      {!isEditMode && (
                        <button
                          type="button"
                          onClick={() => handleDownload(preview)}
                          className="text-xs text-[#10B981] hover:text-[#059669] hover:underline flex items-center gap-1"
                        >
                          <Download size={12} />
                          Baixar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full">
      {modalImage && images.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-6xl max-h-[90vh] w-full">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10"
            >
              <X size={24} />
            </button>

            {images.length > 1 && (
              <button
                onClick={prevImage}
                type="button"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            <div className="relative w-full h-[80vh] bg-white">
              <Image
                src={modalImage}
                alt={`Imagem ${currentImageIndex + 1} de ${images.length}`}
                fill
                className="object-contain rounded-lg"
                unoptimized
              />
            </div>

            {images.length > 1 && (
              <button
                onClick={nextImage}
                type="button"  
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10"
              >
                <ChevronRight size={24} />
              </button>
            )}

            {images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setModalImage(img.fileUrl || img.url);
                    }}
                    type="button"
                    className={`relative w-12 h-12 rounded overflow-hidden border-2 ${
                      index === currentImageIndex 
                        ? 'border-[#8B5CF6]' 
                        : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={img.fileUrl || img.url}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}

      <Label id={id} label={label} required={required} svg={svg} />

      <div className={`
        flex flex-col w-full p-5 border-2 ${isViewMode ? 'border-solid' : 'border-dashed'} rounded-lg
        ${disabled ? 'bg-[#EDEDED] border-[#CCCCCC]' : 'bg-white border-[#CCCCCC] hover:border-[#8B5CF6]'}
        transition-colors duration-200 h-full
      `}>
        {isEditMode && (
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-2">
            <button
              type="button"
              onClick={handleButtonClick}
              disabled={disabled}
              className={`
                flex justify-center items-center px-6 py-2.5 rounded-lg
                text-[16px] font-medium transition-all duration-200
                whitespace-nowrap
                ${disabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white hover:shadow-lg hover:shadow-purple-500/25'
                }
              `}
            >
              {textButton}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              id={id}
              accept={accept}
              onChange={handleFileChange}
              multiple={multiple}
              disabled={disabled}
              required={required && (value as File[]).length === 0}
              className="hidden"
            />

            <div className="flex-1 min-w-0">
              <p className="text-[14px] text-[#666666] truncate">
                {(value as any[]).length > 0 
                  ? `${(value as any[]).length} arquivo(s) selecionado(s)` 
                  : placeholder
                }
              </p>
              {accept && (
                <p className="text-[12px] text-[#999999] mt-1">
                  Formatos aceitos: {accept}
                </p>
              )}
            </div>
          </div>
        )}

        {previews.length > 0 ? (
          <div className={`${isViewMode ? 'mt-0' : 'mt-2'}`}>
            {renderImages()}
            {renderDocuments()}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mb-4">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600">
              {isViewMode ? 'Nenhum arquivo anexado' : placeholder}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
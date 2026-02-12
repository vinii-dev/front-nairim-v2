'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Search, User, Phone, Mail, Smartphone, X, Edit2, Loader2, Check } from 'lucide-react';
import { formatPhone } from '@/util/formatters';

interface Contact {
  id?: string;
  contact?: string;
  phone?: string;
  cellphone?: string;
  email?: string;
}

interface ContactManagerProps {
  value?: Contact[];
  onChange?: (contacts: Contact[]) => void;
  resourceType: 'owners' | 'tenants' | 'agencies';
  readOnly?: boolean;
}

const maskPhoneInput = (value: string) => {
  if (!value) return "";
  value = value.replace(/\D/g, "");
  value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
  value = value.replace(/(\d)(\d{4})$/, "$1-$2");
  return value.slice(0, 15);
};

export default function ContactManager({ value = [], onChange, resourceType, readOnly = false }: ContactManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'existing'>('new');
  const [contacts, setContacts] = useState<Contact[]>(value || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [tempContact, setTempContact] = useState<Contact>({
    contact: '',
    phone: '',
    cellphone: '',
    email: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  useEffect(() => {
    if (JSON.stringify(value) !== JSON.stringify(contacts)) {
      setContacts(value || []);
    }
  }, [value]);

  const fetchContacts = useCallback(async (search: string = '') => {
    setIsLoadingList(true);
    try {
      const query = search ? `?search=${search}` : '';
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/${resourceType}/suggestions/contacts${query}`);
      const data = await response.json();
      
      if (data.success) {
        setAvailableContacts(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingList(false);
    }
  }, [resourceType]);

  useEffect(() => {
    if (isModalOpen && activeTab === 'existing') {
      fetchContacts(searchTerm);
    }
  }, [isModalOpen, activeTab, fetchContacts, searchTerm]);

  useEffect(() => {
    if (activeTab !== 'existing') return;
    const timeoutId = setTimeout(() => {
      if (searchTerm) fetchContacts(searchTerm);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, activeTab, fetchContacts]);

  const openModal = (mode: 'add' | 'edit', index?: number) => {
    if (readOnly) return;
    
    if (mode === 'edit' && index !== undefined) {
      setEditingIndex(index);
      setTempContact({ ...contacts[index] });
      setActiveTab('new');
    } else {
      setEditingIndex(null);
      setTempContact({ contact: '', phone: '', cellphone: '', email: '' });
      setActiveTab('new');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingIndex(null);
    setTempContact({ contact: '', phone: '', cellphone: '', email: '' });
    setSearchTerm('');
  };

  const handleSaveContact = () => {
    if (!tempContact.contact && !tempContact.email && !tempContact.phone && !tempContact.cellphone) {
      return; 
    }

    const newContacts = [...contacts];

    if (editingIndex !== null) {
      newContacts[editingIndex] = tempContact;
    } else {
      newContacts.push(tempContact);
    }

    setContacts(newContacts);
    if (onChange) onChange(newContacts);
    closeModal();
  };

  const handleSelectExisting = (contact: Contact) => {
    const newContactToAdd = {
      contact: contact.contact,
      phone: contact.phone,
      cellphone: contact.cellphone,
      email: contact.email
    };
    
    const newContacts = [...contacts, newContactToAdd];
    setContacts(newContacts);
    if (onChange) onChange(newContacts);
    closeModal();
  };

  const handleRemoveContact = (index: number) => {
    if (readOnly) return;
    const newContacts = contacts.filter((_, i) => i !== index);
    setContacts(newContacts);
    if (onChange) onChange(newContacts);
  };

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {contacts.map((c, idx) => (
          <div 
            key={idx} 
            className={`relative rounded-xl p-4 shadow-sm transition-shadow group border ${
              readOnly 
                ? 'bg-[#ededed] border-[#ccc]' 
                : 'bg-white border-gray-200 hover:shadow-md'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="font-semibold text-gray-800 flex items-center gap-2 truncate pr-2 w-full">
                <div className="bg-purple-100 p-1.5 rounded-full shrink-0">
                  <User size={16} className="text-purple-600" />
                </div>
                <span className="truncate text-sm" title={c.contact}>{c.contact || 'Sem nome'}</span>
              </div>
              
              {!readOnly && (
                <div className="flex items-center gap-1 shrink-0">
                  <button 
                    type="button"
                    onClick={() => openModal('edit', idx)}
                    className="text-gray-400 hover:text-blue-500 transition-colors p-1.5 rounded-full hover:bg-blue-50"
                    title="Editar"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleRemoveContact(idx)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-50"
                    title="Remover"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              {(c.cellphone || c.phone) && (
                <div className={`text-xs text-gray-600 flex items-center gap-2 p-1.5 rounded ${readOnly ? 'bg-white/50' : 'bg-gray-50'}`}>
                  {c.cellphone ? <Smartphone size={13} className="text-gray-400" /> : <Phone size={13} className="text-gray-400" />}
                  <span className="truncate">{c.cellphone ? formatPhone(c.cellphone) : formatPhone(c.phone || '')}</span>
                </div>
              )}
              
              {c.email && (
                <div className={`text-xs text-gray-600 flex items-center gap-2 p-1.5 rounded ${readOnly ? 'bg-white/50' : 'bg-gray-50'}`}>
                  <Mail size={13} className="text-gray-400" />
                  <span className="truncate" title={c.email}>{c.email}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {!readOnly && (
          <button
            type="button"
            onClick={() => openModal('add')}
            className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-4 text-gray-500 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-all min-h-[130px] group"
          >
            <div className="bg-gray-100 group-hover:bg-purple-200 p-3 rounded-full transition-colors">
              <Plus size={24} />
            </div>
            <span className="font-medium text-sm">Adicionar Contato</span>
          </button>
        )}
      </div>

      {isModalOpen && !readOnly && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                {editingIndex !== null ? (
                  <>
                    <Edit2 size={20} className="text-purple-600" />
                    Editar Contato
                  </>
                ) : (
                  <>
                    <Plus size={20} className="text-purple-600" />
                    Adicionar Contato
                  </>
                )}
              </h3>
              <button 
                type="button" 
                onClick={closeModal} 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {editingIndex === null && (
              <div className="flex border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('new')}
                  className={`flex-1 py-3 text-sm font-medium text-center transition-colors border-b-2 ${
                    activeTab === 'new' 
                      ? 'border-purple-600 text-purple-700 bg-purple-50/50' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Novo Contato Manual
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('existing')}
                  className={`flex-1 py-3 text-sm font-medium text-center transition-colors border-b-2 ${
                    activeTab === 'existing' 
                      ? 'border-purple-600 text-purple-700 bg-purple-50/50' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Buscar Existente
                </button>
              </div>
            )}

            <div className="p-6 overflow-y-auto">
              {activeTab === 'new' && (
                <div className="space-y-5 animate-in fade-in slide-in-from-left-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome Completo *</label>
                      <input
                        type="text"
                        value={tempContact.contact || ''}
                        onChange={(e) => setTempContact({...tempContact, contact: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        placeholder="Ex: Maria Silva"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Celular</label>
                      <input
                        type="tel"
                        value={maskPhoneInput(tempContact.cellphone || '')}
                        onChange={(e) => setTempContact({...tempContact, cellphone: maskPhoneInput(e.target.value)})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone Fixo</label>
                      <input
                        type="tel"
                        value={maskPhoneInput(tempContact.phone || '')}
                        onChange={(e) => setTempContact({...tempContact, phone: maskPhoneInput(e.target.value)})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        placeholder="(00) 0000-0000"
                        maxLength={14}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
                      <input
                        type="email"
                        value={tempContact.email || ''}
                        onChange={(e) => setTempContact({...tempContact, email: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'existing' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 h-full flex flex-col">
                  <div className="relative shrink-0">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
                      placeholder="Pesquisar por nome, telefone ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      autoFocus
                    />
                    {isLoadingList && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="grow overflow-y-auto pr-1 max-h-[300px] min-h-[200px] custom-scrollbar">
                    {availableContacts.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {availableContacts.map((contact, index) => (
                          <button
                            key={contact.id || index}
                            type="button"
                            onClick={() => handleSelectExisting(contact)}
                            className="flex flex-col text-left bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-200 rounded-lg p-3 transition-all duration-200 group h-full relative"
                          >
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-purple-600 text-white p-1 rounded-full">
                                    <Plus size={12} />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mb-2 w-full pr-6">
                              <div className="bg-white p-1.5 rounded-full border border-gray-100 group-hover:border-purple-100">
                                <User size={14} className="text-gray-500 group-hover:text-purple-600" />
                              </div>
                              <span className="font-semibold text-gray-800 text-sm truncate w-full">
                                {contact.contact}
                              </span>
                            </div>
                            
                            <div className="space-y-1 w-full">
                              {(contact.cellphone || contact.phone) && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 group-hover:text-gray-700">
                                  <Phone size={12} />
                                  <span className="truncate">{contact.cellphone ? formatPhone(contact.cellphone) : formatPhone(contact.phone || '')}</span>
                                </div>
                              )}
                              {contact.email && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 group-hover:text-gray-700">
                                  <Mail size={12} />
                                  <span className="truncate">{contact.email}</span>
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <Search className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                        <p className="text-gray-500 font-medium">Nenhum contato encontrado.</p>
                        <p className="text-gray-400 text-sm mt-1">Tente buscar por outro termo.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancelar
              </button>
              {activeTab === 'new' && (
                <button
                  type="button"
                  onClick={handleSaveContact}
                  disabled={!tempContact.contact}
                  className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm transition-all active:scale-95"
                >
                  <Check size={18} />
                  {editingIndex !== null ? 'Salvar Alterações' : 'Adicionar Contato'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
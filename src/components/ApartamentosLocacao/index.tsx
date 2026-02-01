"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import { useState } from "react";

interface ApartamentoProps {
    id: number;
    nome: string;
    local: string;
    preco: number;
    quartos: number;
    banheiros: number;
    vagas: number;
    area: number;
    mobilia: boolean;
    andar: number;
    condominio: boolean;
}

const apartamentosExemplo: ApartamentoProps[] = [
    { id: 1, nome: "Apartamento Moderno", local: "Alphaville, Barueri", preco: 4500, quartos: 3, banheiros: 2, vagas: 2, area: 120, mobilia: true, andar: 12, condominio: true },
    { id: 2, nome: "Apartamento Alto Padrão", local: "Morumbi, São Paulo", preco: 6800, quartos: 4, banheiros: 3, vagas: 3, area: 180, mobilia: false, andar: 8, condominio: true },
    { id: 3, nome: "Apartamento com Vista", local: "Moema, São Paulo", preco: 5200, quartos: 2, banheiros: 2, vagas: 1, area: 85, mobilia: true, andar: 15, condominio: false },
    { id: 4, nome: "Apartamento de Condomínio", local: "Jardins, São Paulo", preco: 7500, quartos: 3, banheiros: 3, vagas: 2, area: 150, mobilia: true, andar: 5, condominio: true },
];

export default function ApartamentosLocacao() {
    const [apartamentos] = useState<ApartamentoProps[]>(apartamentosExemplo);

    return (
        <div className="w-full py-8">
            <div className="container mx-auto px-4">
                {/* Cabeçalho */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Apartamentos para Locação</h1>
                    <p className="text-gray-600">Encontre o apartamento ideal para você</p>
                </div>

                {/* Grid de Apartamentos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {apartamentos.map((apartamento) => (
                        <div key={apartamento.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                            {/* Imagem com placeholder */}
                            <div className="relative h-48 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                                    <Image 
                                        src="/CasasLocacao.jpg" 
                                        alt={apartamento.nome}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                    />
                                </div>
                                
                                {/* Overlay e badges */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                
                                {/* Badge de condomínio - agora mostra "Condomínio" ou "Sem condomínio" */}
                                <div className="absolute top-4 left-4 z-10">
                                    <span className={`px-3 py-1 text-white text-xs font-medium rounded-full ${
                                        apartamento.condominio ? "bg-blue-600" : "bg-gray-500"
                                    }`}>
                                        {apartamento.condominio ? "Condomínio" : "Sem condomínio"}
                                    </span>
                                </div>
                            </div>

                            {/* Conteúdo */}
                            <div className="p-5 h-full flex flex-col">
                                {/* Nome e Localização */}
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">{apartamento.nome}</h3>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Icon icon="mingcute:map-pin-line" className="w-4 h-4" />
                                        <span className="text-sm">{apartamento.local}</span>
                                    </div>
                                </div>

                                {/* Preço */}
                                <div className="mb-4">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-purple-900">R$ {apartamento.preco.toLocaleString('pt-BR')}</span>
                                        <span className="text-gray-500">/mês</span>
                                    </div>
                                    <div className="mt-1 flex gap-2">
                                        {apartamento.mobilia ? (
                                            <span className="inline-block px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">
                                                Mobiliado
                                            </span>
                                        ) : (
                                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                Não mobiliado
                                            </span>
                                        )}
                                        <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                                            {apartamento.andar}º andar
                                        </span>
                                    </div>
                                </div>

                                {/* Ícones de Características */}
                                <div className="grid grid-cols-4 gap-4 py-4 border-y border-gray-100 mb-4">
                                    <div className="flex flex-col items-center">
                                        <div className="p-2 bg-purple-50 rounded-lg mb-2">
                                            <Icon icon="mingcute:bed-line" className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-500">{apartamento.quartos}</span>
                                        <span className="text-xs text-gray-500">Quartos</span>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <div className="p-2 bg-blue-50 rounded-lg mb-2">
                                            <Icon icon="mingcute:shower-line" className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-500">{apartamento.banheiros}</span>
                                        <span className="text-xs text-gray-500">Banheiros</span>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <div className="p-2 bg-green-50 rounded-lg mb-2">
                                            <Icon icon="mingcute:car-line" className="w-5 h-5 text-green-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-500">{apartamento.vagas}</span>
                                        <span className="text-xs text-gray-500">Vagas</span>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <div className="p-2 bg-yellow-50 rounded-lg mb-2">
                                            <Icon icon="mingcute:ruler-line" className="w-5 h-5 text-yellow-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-500">{apartamento.area}m²</span>
                                        <span className="text-xs text-gray-500">Área</span>
                                    </div>
                                </div>

                                {/* Botão de Ação */}
                                <div className="mt-auto">
                                    <button className="w-full py-2.5 bg-purple-900 text-white rounded-lg font-medium hover:bg-purple-800 transition-colors">
                                        Ver Detalhes
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Nenhum apartamento encontrado */}
                {apartamentos.length === 0 && (
                    <div className="text-center py-12">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Icon icon="mingcute:building-2-line" className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">Nenhum apartamento encontrado</h3>
                        <p className="text-gray-600">Tente ajustar seus filtros para encontrar mais opções.</p>
                    </div>
                )}

                {/* Paginação */}
                <div className="mt-8 flex justify-center">
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                            <Icon icon="mingcute:left-line" className="w-4 h-4" />
                        </button>
                        <button className="w-10 h-10 rounded-lg bg-purple-900 text-white font-medium">1</button>
                        <button className="w-10 h-10 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">2</button>
                        <button className="w-10 h-10 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">3</button>
                        <button className="w-10 h-10 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">4</button>
                        <button className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                            <Icon icon="mingcute:right-line" className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
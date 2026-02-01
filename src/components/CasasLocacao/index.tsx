"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import { useState } from "react";

interface CasaProps {
    id: number;
    nome: string;
    local: string;
    preco: number;
    quartos: number;
    banheiros: number;
    vagas: number;
    area: number;
    mobilia: boolean;
}

const casasExemplo: CasaProps[] = [
    { id: 1, nome: "Casa Moderna Alphaville", local: "Alphaville, Barueri", preco: 8500, quartos: 4, banheiros: 5, vagas: 3, area: 350, mobilia: true },
    { id: 2, nome: "Sobrado Familiar", local: "Morumbi, São Paulo", preco: 12000, quartos: 5, banheiros: 6, vagas: 4, area: 450, mobilia: false },
    { id: 3, nome: "Casa Com Piscina", local: "Moema, São Paulo", preco: 9500, quartos: 3, banheiros: 4, vagas: 2, area: 280, mobilia: true },
    { id: 4, nome: "Casa de Condomínio", local: "Jardins, São Paulo", preco: 15000, quartos: 6, banheiros: 7, vagas: 4, area: 520, mobilia: true },
];

export default function CasasLocacao() {
    const [casas] = useState<CasaProps[]>(casasExemplo);

    return (
        <div className="w-full py-8">
            <div className="container mx-auto px-4">
                {/* Cabeçalho */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Casas para Locação</h1>
                    <p className="text-gray-600">Encontre a casa perfeita para sua família</p>
                </div>

                {/* Grid de Casas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                    {casas.map((casa) => (
                        <div key={casa.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                            {/* Imagem com placeholder */}
                            <div className="relative h-48 overflow-hidden">
                                {/* Imagem de placeholder - você pode substituir por uma imagem real */}
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center">
                                    {/* Se você tem uma imagem chamada CasasLocacao, use assim: */}
                                    <Image 
                                        src="/CasasLocacao.jpg" 
                                        alt={casa.nome}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                    />
                                </div>
                                
                                {/* Overlay escuro para melhor legibilidade do conteúdo que vier depois */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>

                            {/* Conteúdo */}
                            <div className="p-5 h-full flex flex-col">
                                {/* Nome e Localização */}
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">{casa.nome}</h3>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Icon icon="mingcute:map-pin-line" className="w-4 h-4" />
                                        <span className="text-sm">{casa.local}</span>
                                    </div>
                                </div>

                                {/* Preço */}
                                <div className="mb-4">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-purple-900">R$ {casa.preco.toLocaleString('pt-BR')}</span>
                                        <span className="text-gray-500">/mês</span>
                                    </div>
                                    <div className="mt-1">
                                        {casa.mobilia ? (
                                            <span className="inline-block px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">
                                                Mobiliado
                                            </span>
                                        ) : (
                                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                Não mobiliado
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Ícones de Características */}
                                <div className="grid grid-cols-4 gap-4 py-4 border-y border-gray-100 mb-4">
                                    <div className="flex flex-col items-center">
                                        <div className="p-2 bg-purple-50 rounded-lg mb-2">
                                            <Icon icon="mingcute:bed-line" className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-500">{casa.quartos}</span>
                                        <span className="text-xs text-gray-500">Quartos</span>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <div className="p-2 bg-blue-50 rounded-lg mb-2">
                                            <Icon icon="mingcute:shower-line" className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-500">{casa.banheiros}</span>
                                        <span className="text-xs text-gray-500">Banheiros</span>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <div className="p-2 bg-green-50 rounded-lg mb-2">
                                            <Icon icon="mingcute:car-line" className="w-5 h-5 text-green-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-500">{casa.vagas}</span>
                                        <span className="text-xs text-gray-500">Vagas</span>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <div className="p-2 bg-yellow-50 rounded-lg mb-2">
                                            <Icon icon="mingcute:ruler-line" className="w-5 h-5 text-yellow-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-500">{casa.area}m²</span>
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
            </div>
        </div>
    );
}
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Ícone personalizado para os marcadores (Pin Roxo)
const customIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapCoordinate {
  lat: number;
  lng: number;
  info: string;
}

interface LeafletMapProps {
  data: MapCoordinate[];
  loading?: boolean;
}

// Componente auxiliar para controlar o Zoom e a Máscara
function MapController({ 
  selectedLocation, 
  allLocations, 
  worldData 
}: { 
  selectedLocation: MapCoordinate | null, 
  allLocations: MapCoordinate[],
  worldData: any 
}) {
  const map = useMap();

  // 1. Lógica de Zoom Automático
  useEffect(() => {
    if (selectedLocation) {
      // Se selecionou um imóvel específico, voa baixo (Zoom 16 - Rua)
      map.flyTo([selectedLocation.lat, selectedLocation.lng], 16, {
        duration: 1.5
      });
    } else if (allLocations.length > 0) {
      // Se não tem seleção, ajusta a câmera para caber TODOS os imóveis
      const bounds = L.latLngBounds(allLocations.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [selectedLocation, allLocations, map]);

  // 2. Estilização da Máscara (Mundo Cinza vs Brasil Colorido)
  const geoJsonStyle = (feature: any) => {
    // Se for Brasil, deixa transparente para ver o mapa de ruas abaixo
    if (feature.properties.name === "Brazil") {
      return {
        fillColor: "transparent",
        fillOpacity: 0,
        color: "#8B5CF6", // Borda roxa para destacar o país
        weight: 2,
      };
    }
    // O resto do mundo fica com uma camada cinza por cima
    return {
      fillColor: "#374151", // Cinza escuro
      fillOpacity: 0.7,     // Opacidade alta para "apagar" o resto
      color: "#4B5563",     // Borda cinza
      weight: 1,
    };
  };

  if (!worldData) return null;

  return (
    <GeoJSON 
      data={worldData} 
      style={geoJsonStyle} 
      // Desativa cliques nos países cinzas para não atrapalhar
      interactive={false} 
    />
  );
}

export default function LeafletMap({ data = [], loading = false }: LeafletMapProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPoint, setSelectedPoint] = useState<MapCoordinate | null>(null);
  const [worldGeoJson, setWorldGeoJson] = useState<any>(null);

  // Carrega as fronteiras do mundo para fazer o efeito de máscara
  useEffect(() => {
    fetch("https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json")
      .then(res => res.json())
      .then(data => setWorldGeoJson(data))
      .catch(err => console.error("Erro ao carregar fronteiras:", err));
  }, []);

  // Filtra sugestões no input
  const filteredSuggestions = useMemo(() => {
    if (!searchTerm) return [];
    return data.filter(item => 
      item.info.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, data]);

  const handleSelect = (point: MapCoordinate) => {
    setSearchTerm(point.info);
    setSelectedPoint(point);
  };

  const handleClear = () => {
    setSearchTerm("");
    setSelectedPoint(null);
  };

  if (loading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[500px] bg-white rounded-xl border border-[#DDE1E6] shadow-sm overflow-hidden group z-0">
      
      {/* --- INPUT DE BUSCA FLUTUANTE --- */}
      <div className="absolute top-4 left-4 z-[1000] w-full max-w-md px-2">
        <div className="relative shadow-lg">
          <input
            type="text"
            placeholder="Buscar rua, bairro ou imóvel..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (!e.target.value) setSelectedPoint(null);
            }}
            className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
          <div className="absolute left-3 top-3 text-gray-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          {searchTerm && (
            <button 
              onClick={handleClear}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        
        {/* Lista de Sugestões */}
        {searchTerm && filteredSuggestions.length > 0 && !selectedPoint && (
          <div className="mt-2 bg-white rounded-lg shadow-xl border border-gray-100 max-h-60 overflow-y-auto">
            {filteredSuggestions.map((item, idx) => (
              <div 
                key={idx}
                className="px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 cursor-pointer border-b border-gray-50 last:border-0 truncate flex flex-col"
                onClick={() => handleSelect(item)}
              >
                <span className="font-medium text-gray-900">{item.info}</span>
                <span className="text-xs text-gray-500">Clique para ver no mapa</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MAPA --- */}
      <MapContainer 
        center={[-14.2350, -51.9253]} // Centro inicial Brasil
        zoom={4} 
        style={{ width: "100%", height: "100%" }}
        zoomControl={false} // Vamos reposicionar se quiser, ou deixar padrão
      >
        {/* 1. Camada de Ruas (OpenStreetMap) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 2. Camada de Máscara (Mundo Cinza) e Controlador de Zoom */}
        <MapController 
          selectedLocation={selectedPoint} 
          allLocations={data}
          worldData={worldGeoJson} 
        />

        {/* 3. Marcadores dos Imóveis */}
        {data.map((point, idx) => (
          <Marker 
            key={idx} 
            position={[point.lat, point.lng]} 
            icon={customIcon}
            eventHandlers={{
              click: () => handleSelect(point),
            }}
          >
            <Popup className="custom-popup">
              <div className="p-1">
                <strong className="block text-sm text-purple-700 mb-1">Imóvel Encontrado</strong>
                <p className="text-gray-700 text-xs m-0">{point.info}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Legenda Fixa */}
      <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur px-4 py-3 rounded-xl shadow-lg border border-gray-200 text-xs text-gray-600 z-[1000] flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#8B5CF6] border border-white shadow-sm"></span>
          <span className="font-medium">{data.length} Imóveis Disponíveis</span>
        </div>
        <div className="flex items-center gap-2 opacity-60">
          <span className="w-3 h-3 rounded bg-gray-500"></span>
          <span>Áreas sem atuação</span>
        </div>
      </div>
    </div>
  );
}
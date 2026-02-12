/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import * as echarts from "echarts";
import DataModal from "../DataModal";
import { MetricDataItem } from "@/types/types";

interface GaugeCardProps {
  value: number;
  max?: number;
  label?: string;
  color?: string;
  loading?: boolean;
  detailData?: MetricDataItem[];
  detailColumns?: Array<{ key: string; label: string; format?: (value: any) => string }>;
}

export default function EChartsGauge({
  value,
  max = 100,
  label = "",
  color = "#8B5CF6",
  detailData = [],
  detailColumns = []
}: GaugeCardProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const gaugeChartRef = useRef<HTMLDivElement>(null);
  const gaugeChartInstance = useRef<echarts.ECharts | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  const percentage = Math.min(Math.max(value / max, 0), 1) * 100;

  const initChart = useCallback((container: HTMLDivElement, isLarge = false) => {
    const chart = echarts.init(container);
    
    // Calcular dimensões responsivas baseadas no tamanho do container
    const containerWidth = container.clientWidth;
    const isMobile = containerWidth < 768;
    
    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: `<div style="padding: 8px 12px; background: #1f2937; border-radius: 8px; border-left: 4px solid ${color}; min-width: 180px;">
          <div style="font-weight: 600; color: #fff; margin-bottom: 6px; font-size: 14px;">${label}</div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: #d1d5db; font-size: 13px;">Percentual:</span>
            <span style="color: ${color}; font-weight: 600; font-size: 13px;">${percentage.toFixed(1)}%</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #d1d5db; font-size: 13px;">Valor:</span>
            <span style="color: ${color}; font-weight: 600; font-size: 13px;">${value.toFixed(2)}/${max}</span>
          </div>
          <div style="color: #9ca3af; font-size: 12px; margin-top: 6px; padding-top: 6px; border-top: 1px solid #374151;">
            Clique no percentual para ver detalhes
          </div>
        </div>`,
        backgroundColor: 'transparent',
        borderWidth: 0,
        extraCssText: 'box-shadow: 0 8px 30px rgba(0,0,0,0.25);',
        textStyle: {
          color: '#fff'
        }
      },
      series: [
        {
          type: 'gauge',
          radius: isLarge ? (isMobile ? '75%' : '85%') : '100%',
          center: isLarge ? ['50%', '55%'] : ['50%', '60%'],
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: max,
          splitNumber: isLarge ? 10 : 0,
          axisLine: {
            lineStyle: {
              width: isLarge ? (isMobile ? 20 : 25) : 22,
              color: [
                [percentage / 100, color],
                [1, '#e5e7eb']
              ],
              shadowColor: 'rgba(0, 0, 0, 0.1)',
              shadowBlur: 4
            }
          },
          progress: {
            show: true,
            width: isLarge ? (isMobile ? 20 : 25) : 22,
            itemStyle: {
              color: color,
              shadowColor: color,
              shadowBlur: 6
            }
          },
          pointer: {
            show: isLarge,
            length: isLarge ? (isMobile ? '70%' : '75%') : '65%',
            width: isLarge ? (isMobile ? 4 : 5) : 4,
            itemStyle: {
              color: '#374151',
              shadowColor: 'rgba(0, 0, 0, 0.2)',
              shadowBlur: 2
            }
          },
          axisTick: {
            show: isLarge,
            distance: isLarge ? (isMobile ? -30 : -35) : -35,
            length: isLarge ? (isMobile ? 5 : 6) : 6,
            splitNumber: isLarge ? (isMobile ? 5 : 10) : 10,
            lineStyle: {
              color: '#9ca3af',
              width: 1
            }
          },
          splitLine: {
            show: isLarge,
            distance: isLarge ? (isMobile ? -35 : -40) : -40,
            length: isLarge ? (isMobile ? 8 : 10) : 10,
            lineStyle: {
              color: '#9ca3af',
              width: 2
            }
          },
          axisLabel: {
            show: isLarge,
            distance: isLarge ? (isMobile ? -25 : -28) : -28,
            color: '#6b7280',
            fontSize: isLarge ? (isMobile ? 10 : 12) : 12,
            formatter: (val: number) => `${val}`
          },
          anchor: {
            show: isLarge,
            size: 5,
            itemStyle: {
              borderWidth: 2,
              borderColor: color
            }
          },
          title: {
            show: false
          },
          detail: {
            show: true,
            valueAnimation: true,
            formatter: '{value}%',
            color: color,
            fontSize: isLarge ? (isMobile ? 22 : 28) : 24,
            fontWeight: 'bold',
            offsetCenter: [0, isLarge ? (isMobile ? '10%' : '5%') : '0%'],
            backgroundColor: isLarge ? 'transparent' : 'rgba(255, 255, 255, 0.95)',
            borderColor: isLarge ? 'transparent' : color,
            borderWidth: isLarge ? 0 : 1,
            borderRadius: isLarge ? 0 : 20,
            padding: isLarge ? 0 : [6, 12],
            shadowColor: isLarge ? 'transparent' : 'rgba(0, 0, 0, 0.1)',
            shadowBlur: isLarge ? 0 : 6,
            // Adicionando estilo de cursor pointer para indicar que é clicável
            ...(!isLarge && {
              extraCssText: 'cursor: pointer;'
            })
          },
          data: [
            {
              value: percentage
            }
          ]
        }
      ]
    };

    chart.setOption(option);
    
    // Adicionar evento de clique no detalhe (porcentagem) apenas para gráfico pequeno
    if (!isLarge) {
      chart.on('click', (params: any) => {
        if (params.componentType === 'series' && params.seriesType === 'gauge') {
          if (params.dataIndex === 0 && detailData && detailData.length > 0) {
            setIsModalOpen(true);
          }
        }
      });
      
      // Mudar cursor quando passar sobre a porcentagem
      chart.getZr().on('mouseover', (params: any) => {
        if (params.target && params.target.style) {
          const style = params.target.style;
          if (style.text === `${percentage.toFixed(1)}%`) {
            chart.getZr().setCursorStyle('pointer');
          }
        }
      });
      
      chart.getZr().on('mouseout', () => {
        chart.getZr().setCursorStyle('default');
      });
    }

    return chart;
  }, [value, max, label, color, percentage, detailData]);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = initChart(chartRef.current);
    chartInstance.current = chart;

    const handleResize = () => {
      chart.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
      chartInstance.current = null;
    };
  }, [initChart]);

  useEffect(() => {
    if (isFullscreenModalOpen && gaugeChartRef.current) {
      gaugeChartInstance.current = initChart(gaugeChartRef.current, true);

      gaugeChartInstance.current.on('click', (params: any) => {
        if (params.componentType === 'series' && params.seriesType === 'gauge') {
          if (params.dataIndex === 0 && detailData && detailData.length > 0) {
            setIsFullscreenModalOpen(false);
            setTimeout(() => setIsModalOpen(true), 300);
          }
        }
      });

      const handleResizeModal = () => {
        if (gaugeChartInstance.current) {
          gaugeChartInstance.current.resize();
        }
      };
      window.addEventListener('resize', handleResizeModal);

      return () => {
        window.removeEventListener('resize', handleResizeModal);
        if (gaugeChartInstance.current) {
          gaugeChartInstance.current.dispose();
        }
      };
    }
  }, [isFullscreenModalOpen, initChart, detailData]);

  const handleChartClick = (e: React.MouseEvent) => {
    if (!detailData || detailData.length === 0) return;
    
    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2 * 0.6; // Ajustado para onde está o texto
    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    
    if (distance < 50) {
      setIsModalOpen(true);
      return;
    }
    
    setIsFullscreenModalOpen(true);
  };

  return (
    <>
      {/* Card do Gauge */}
      <div className="bg-white rounded-xl p-4 border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#8B5CF6]/20 group h-full">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-semibold text-[#1F2937] text-start truncate">
            {label}
          </h3>
          
          <div className="flex gap-1">
            <button
              onClick={() => setIsFullscreenModalOpen(true)}
              className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Expandir gráfico"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            </button>
            
            {detailData && detailData.length > 0 && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title="Ver dados detalhados"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                  <path d="M9 10h6" />
                  <path d="M9 14h6" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Container do gráfico - Aumentado */}
        <div 
          className="relative h-48 cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center"
          onClick={handleChartClick}
          title="Clique para expandir o gráfico | Clique no percentual para ver detalhes"
        >
          <div ref={chartRef} className="w-full h-full" />
        </div>
      </div>

      {/* Modal de Detalhes */}
      <DataModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Detalhes - ${label}`}
        data={detailData}
        columns={detailColumns}
      />

      {/* Modal Fullscreen do Gauge - Responsivo */}
      {isFullscreenModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4"
          onClick={() => setIsFullscreenModalOpen(false)}
        >
          <div 
            className="bg-white rounded-xl w-full max-w-6xl h-[90vh] sm:h-[85vh] flex flex-col shadow-2xl mx-2 sm:mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b border-gray-200 gap-3 sm:gap-0">
              <div className="w-full sm:w-auto">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{label}</h2>
              </div>
              
              <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                {detailData && detailData.length > 0 && (
                  <button
                    onClick={() => {
                      setIsFullscreenModalOpen(false);
                      setTimeout(() => setIsModalOpen(true), 300);
                    }}
                    className="px-3 sm:px-4 py-2 bg-[#8B5CF6] text-white rounded-lg hover:bg-[#7C3AED] transition-colors flex items-center gap-2 text-sm font-medium w-full sm:w-auto justify-center"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                      <path d="M9 10h6" />
                      <path d="M9 14h6" />
                    </svg>
                    Ver Dados
                  </button>
                )}
                
                <button
                  onClick={() => setIsFullscreenModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                  title="Fechar"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x2="18" y2="18" x1="6" y1="6" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 sm:p-6 md:p-8">
              <div ref={gaugeChartRef} className="w-full h-full min-h-[510px]" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
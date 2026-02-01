/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/cep/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const { searchParams } = new URL(request.url);
    const cep = searchParams.get('cep');
    const country = searchParams.get('country') || 'BR';
    
    if (!cep) {
      return NextResponse.json(
        { error: 'CEP é obrigatório' },
        { status: 400, headers }
      );
    }

    const cleanCEP = cep.replace(/\D/g, '');
    
    if (cleanCEP.length !== 8) {
      return NextResponse.json(
        { error: 'CEP deve conter 8 dígitos' },
        { status: 400, headers }
      );
    }

    let viaCepData;
    
    // Consulta ViaCEP
    const viaCepResponse = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!viaCepResponse.ok) {
      console.error('ViaCEP API error:', viaCepResponse.status);
      return NextResponse.json(
        { error: 'Erro ao consultar ViaCEP' },
        { status: viaCepResponse.status, headers }
      );
    }
    
    // eslint-disable-next-line prefer-const
    viaCepData = await viaCepResponse.json();
    
    if (viaCepData.erro) {
      return NextResponse.json(
        { error: 'CEP não encontrado' },
        { status: 404, headers }
      );
    }

    const formattedData = {
      logradouro: viaCepData.logradouro || '',
      bairro: viaCepData.bairro || '',
      localidade: viaCepData.localidade || '',
      uf: viaCepData.uf || '',
      pais: 'Brasil',
      cep: viaCepData.cep || cleanCEP
    };

    return NextResponse.json(formattedData, { headers });
    
  } catch (error: any) {
    console.error('Erro na API de CEP:', error);
    return NextResponse.json(
      { error: `Erro interno: ${error.message}` },
      { status: 500, headers }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS, POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
import type { PlanRequest, PlanResponse, ComprasRequest, ComprasResponse, ModificarRecetaRequest, Receta } from '../types/plan';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const generarPlan = async (request: PlanRequest): Promise<PlanResponse> => {
  const response = await fetch(`${API_URL}/generar-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) throw new Error('Error al generar el plan.');
  return response.json();
};

export const generarListaCompras = async (request: ComprasRequest): Promise<ComprasResponse> => {
  const response = await fetch(`${API_URL}/generar-lista-compras`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) throw new Error('Error al buscar la receta.');
  return response.json();
};

export const generarSorpresa = async (ingredientes: string[]): Promise<PlanResponse> => {
  const response = await fetch(`${API_URL}/sorprendeme`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredientes }),
  });

  if (!response.ok) throw new Error('Error al generar la sorpresa.');
  return response.json();
};

export const modificarReceta = async (request: ModificarRecetaRequest): Promise<Receta> => {
  const response = await fetch(`${API_URL}/modificar-receta`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) throw new Error('Error al modificar la receta.');
  return response.json();
};
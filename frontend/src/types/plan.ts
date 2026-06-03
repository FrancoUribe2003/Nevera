export interface PlanRequest {
  ingredientes: string[];
  personas: number;
  dias: number;
}

export interface Receta {
  dia: string;
  nombre: string;
  economica?: boolean; 
  ingredientes_usados: string[];
  ingredientes_faltantes: string[];
  pasos: string[];
  tiempo_minutos: number;
}

export interface PlanResponse {
  plan: Receta[];
}

export interface ComprasRequest {
  comidas: string[];
}

export interface RecetaRequerida {
  nombre: string;
  tiempo_minutos: number;
  ingredientes: string[];
  pasos: string[];
}

export interface ComprasResponse {
  recetas_pedidas: RecetaRequerida[];
}

export interface ModificarRecetaRequest {
  receta: Receta;
  ingredientes_a_reemplazar: string[];
}
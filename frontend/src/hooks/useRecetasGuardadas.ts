import { useState, useEffect } from 'react';
import type { Receta } from '../types/plan';

const STORAGE_KEY = 'recetas_guardadas';

export function useRecetasGuardadas() {
  const [recetasGuardadas, setRecetasGuardadas] = useState<Receta[]>([]);

  // Cargar recetas iniciales
  useEffect(() => {
    try {
      const almacenadas = localStorage.getItem(STORAGE_KEY);
      if (almacenadas) {
        setRecetasGuardadas(JSON.parse(almacenadas));
      }
    } catch (error) {
      console.error('Error al cargar recetas del localStorage:', error);
    }
  }, []);

  const guardarReceta = (receta: Receta) => {
    setRecetasGuardadas(prev => {
      const yaExiste = prev.some(r => r.nombre === receta.nombre);
      if (yaExiste) return prev; // No duplicar
      
      const nuevas = [...prev, receta];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevas));
      } catch (e) {
        console.error('Error al guardar en localStorage', e);
      }
      return nuevas;
    });
  };

  const eliminarReceta = (nombre: string) => {
    setRecetasGuardadas(prev => {
      const nuevas = prev.filter(r => r.nombre !== nombre);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevas));
      } catch (e) {
        console.error('Error al eliminar de localStorage', e);
      }
      return nuevas;
    });
  };

  const actualizarReceta = (nombreOriginal: string, recetaNueva: Receta) => {
    setRecetasGuardadas(prev => {
      const nuevas = prev.map(r => r.nombre === nombreOriginal ? recetaNueva : r);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevas));
      } catch (e) {
        console.error('Error al actualizar en localStorage', e);
      }
      return nuevas;
    });
  };

  const estaGuardada = (nombre: string) => {
    return recetasGuardadas.some(r => r.nombre === nombre);
  };

  return {
    recetasGuardadas,
    guardarReceta,
    eliminarReceta,
    actualizarReceta, // <-- AÑADIDO ACÁ
    estaGuardada
  };
}
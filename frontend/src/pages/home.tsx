import { useState } from 'react';
import { generarPlan, generarListaCompras, generarSorpresa, modificarReceta } from '../services/api';
import type { PlanResponse, ComprasResponse, Receta } from '../types/plan';
import { useRecetasGuardadas } from '../hooks/useRecetasGuardadas';

export default function Home() {
  const [modo, setModo] = useState<'PLAN' | 'RECETA'>('PLAN');
  
  const [itemsInput, setItemsInput] = useState('');
  const [items, setItems] = useState<string[]>([]);
  const [personas, setPersonas] = useState(2);
  const [dias, setDias] = useState(3);
  
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [recetaInfo, setRecetaInfo] = useState<ComprasResponse | null>(null);
  
  // Estado para saber qué ingrediente exacto de qué receta está cargando
  const [edicionReceta, setEdicionReceta] = useState<{ index: number, excluidos: string[] } | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { guardarReceta, eliminarReceta, actualizarReceta, estaGuardada } = useRecetasGuardadas();

  const agregarItem = () => {
    if (itemsInput.trim() && !items.includes(itemsInput.trim())) {
      setItems([...items, itemsInput.trim()]);
      setItemsInput('');
    }
  };

  const eliminarItem = (itemAEliminar: string) => {
    setItems(items.filter(i => i !== itemAEliminar));
  };

  const cambiarModo = (nuevoModo: 'PLAN' | 'RECETA') => {
    setModo(nuevoModo);
    setItems([]);     
    setPlan(null);    
    setRecetaInfo(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError(modo === 'PLAN' ? 'Agrega al menos un ingrediente' : 'Agrega al menos una receta');
      return;
    }
    
    setLoading(true);
    setError('');
    setPlan(null);
    setRecetaInfo(null);

    try {
      if (modo === 'PLAN') {
        const data = await generarPlan({ ingredientes: items, personas, dias });
        setPlan(data);
      } else {
        const data = await generarListaCompras({ comidas: items });
        setRecetaInfo(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSorpresa = async () => {
    setLoading(true);
    setError('');
    setPlan(null);
    setRecetaInfo(null);

    try {
      const data = await generarSorpresa(items);
      setPlan(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReemplazarMultiples = async (recetaActual: Receta, indexReceta: number, excluidos: string[]) => {
    if (excluidos.length === 0) return setEdicionReceta(null);
    
    setLoading(true);
    try {
      const recetaModificada = await modificarReceta({ 
        receta: recetaActual, 
        ingredientes_a_reemplazar: excluidos 
      });
      
      if (plan) {
        const nuevoPlan = [...plan.plan];
        nuevoPlan[indexReceta] = recetaModificada;
        setPlan({ ...plan, plan: nuevoPlan });
      }

      if (estaGuardada(recetaActual.nombre)) {
        actualizarReceta(recetaActual.nombre, recetaModificada);
      }
    } catch (err) {
      alert("Hubo un problema al modificar la receta");
    } finally {
      setLoading(false);
      setEdicionReceta(null);
    }
  };


  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Buscar Recetas 🍳</h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => cambiarModo('PLAN')}
          style={{ padding: '0.5rem 1rem', background: modo === 'PLAN' ? '#333' : '#eee', color: modo === 'PLAN' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Armar Menú (Tengo ingredientes)
        </button>
        <button 
          onClick={() => cambiarModo('RECETA')}
          style={{ padding: '0.5rem 1rem', background: modo === 'RECETA' ? '#333' : '#eee', color: modo === 'RECETA' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Consultar Receta (Quiero cocinar algo)
        </button>
      </div>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label>{modo === 'PLAN' ? 'Ingredientes que tienes:' : '¿Qué platillos quieres preparar?:'}</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input 
              type="text" 
              value={itemsInput}
              onChange={(e) => setItemsInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarItem())}
              placeholder={modo === 'PLAN' ? "Ej: pollo, arroz..." : "Ej: Milanesa con puré..."}
              style={{ padding: '0.5rem', flex: 1 }}
            />
            <button type="button" onClick={agregarItem} style={{ padding: '0.5rem 1rem' }}>Agregar</button>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            {items.map(item => (
              <span key={item} style={{ background: '#eee', padding: '0.3rem 0.6rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {item} <button type="button" onClick={() => eliminarItem(item)} style={{ cursor: 'pointer', border: 'none', background: 'transparent', color: 'red' }}>x</button>
              </span>
            ))}
          </div>
        </div>

        {modo === 'PLAN' && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label>Personas: </label>
              <input type="number" min="1" value={personas} onChange={(e) => setPersonas(Number(e.target.value))} style={{ padding: '0.5rem', width: '60px' }} />
            </div>
            <div>
              <label>Días / Opciones (1-7): </label>
              <input type="number" min="1" max="7" value={dias} onChange={(e) => setDias(Number(e.target.value))} style={{ padding: '0.5rem', width: '60px' }} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" disabled={loading} style={{ padding: '0.75rem 1.5rem', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 }}>
            {loading ? 'Pensando...' : (modo === 'PLAN' ? 'Generar Plan' : 'Ver Ingredientes y Pasos')}
          </button>
          
          {modo === 'PLAN' && (
            <button 
              type="button" 
              onClick={handleSorpresa}
              disabled={loading} 
              style={{ padding: '0.75rem 1.5rem', background: '#9c27b0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✨ Sorpréndeme
            </button>
          )}
        </div>
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      </form>

      {/* RESULTADO MODO: PLAN SEMANAL */}
      {plan && modo === 'PLAN' && (
        <div>
          <h2>Opciones de Menú:</h2>
          {plan.plan.map((receta, index) => {
            const isSaved = estaGuardada(receta.nombre);

            return (
              <div key={index} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', position: 'relative' }}>
                {receta.economica && (
                  <span style={{ position: 'absolute', top: 10, right: 10, background: '#4CAF50', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>Económica</span>
                )}
                
                <h3 style={{ marginTop: 0 }}>{receta.dia && `${receta.dia}: `}{receta.nombre} ⏱️ {receta.tiempo_minutos} min</h3>
                
                <button 
                  onClick={() => isSaved ? eliminarReceta(receta.nombre) : guardarReceta(receta)}
                  style={{ marginBottom: '1rem', padding: '0.4rem 0.8rem', background: isSaved ? '#f44336' : '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  {isSaved ? 'Quitar de guardadas' : '⭐ Guardar receta'}
                </button>

                <div style={{ marginBottom: '1rem' }}>
                  <strong>Usa: </strong><br/>
                  <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0' }}>
                    {receta.ingredientes_usados.map((ing, i) => <li key={i}>{ing}</li>)}
                  </ul>
                </div>

                {receta.ingredientes_faltantes.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Falta comprar: </strong>
                    <button 
                      onClick={() => setEdicionReceta(edicionReceta?.index === index ? null : { index, excluidos: [] })}
                      style={{ marginLeft: '1rem', padding: '0.2rem 0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      ✏️ Modificar
                    </button>
                    <br/>
                    
                    <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                      {receta.ingredientes_faltantes.map((ing, i) => {
                        // Checamos si el usuario tachó este ingrediente
                        const estaExcluido = edicionReceta?.index === index && edicionReceta.excluidos.includes(ing);
                        
                        return (
                          <li key={i} style={{ textDecoration: estaExcluido ? 'line-through' : 'none', color: estaExcluido ? '#aaa' : 'inherit' }}>
                            {ing} 
                            {edicionReceta?.index === index && (
                              <button 
                                onClick={() => {
                                  if (estaExcluido) {
                                    setEdicionReceta({ index, excluidos: edicionReceta.excluidos.filter(e => e !== ing) });
                                  } else {
                                    setEdicionReceta({ index, excluidos: [...edicionReceta.excluidos, ing] });
                                  }
                                }}
                                style={{ marginLeft: '0.5rem', cursor: 'pointer', border: 'none', background: 'transparent' }}
                              >
                                {estaExcluido ? '↩️' : '❌'}
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                    
                    {/* Botón para confirmar los cambios si modificó algo */}
                    {edicionReceta?.index === index && edicionReceta.excluidos.length > 0 && (
                      <button 
                        onClick={() => handleReemplazarMultiples(receta, index, edicionReceta.excluidos)}
                        style={{ padding: '0.5rem 1rem', background: '#9c27b0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '0.5rem' }}
                        disabled={loading}
                      >
                        {loading ? 'Pensando...' : `Generar alternativa sin ${edicionReceta.excluidos.length} ingredientes`}
                      </button>
                    )}
                  </div>
                )}
                
                <h4>Pasos:</h4>
                <ol>{receta.pasos.map((paso, i) => <li key={i}>{paso}</li>)}</ol>
              </div>
            );
          })}
        </div>
      )}

      {/* RESULTADO MODO: CONSULTAR RECETA */}
      {recetaInfo && modo === 'RECETA' && (
        <div style={{ borderTop: '2px dashed #ddd', paddingTop: '2rem', marginTop: '2rem' }}>
          <h2>Detalles de la Receta:</h2>
          {recetaInfo.recetas_pedidas.map((receta, index) => (
            <div key={index} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <h3 style={{ marginTop: 0 }}>{receta.nombre} ⏱️ {receta.tiempo_minutos} min</h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <strong>Ingredientes: </strong>
                <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0' }}>
                  {receta.ingredientes?.map((ing, i) => <li key={i}>{ing}</li>)}
                </ul>
              </div>
              
              <h4>Pasos:</h4>
              <ol>
                {receta.pasos?.map((paso, i) => <li key={i}>{paso}</li>)}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
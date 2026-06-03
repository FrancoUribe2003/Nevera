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
    <div>
      <h1>Buscar Recetas</h1>
      
      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>
              {modo === 'PLAN' ? 'Ingredientes que tienes:' : '¿Qué platillos quieres preparar?:'}
            </label>
            <button 
              type="button"
              onClick={() => cambiarModo(modo === 'PLAN' ? 'RECETA' : 'PLAN')}
              className="btn btn-mini btn-outline-info"
              style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}
            >
              {modo === 'PLAN' ? 'Consultar Receta' : 'Armar Menú'}
            </button>
          </div>
          <div className="input-wrapper">
            <input 
              type="text" 
              value={itemsInput}
              onChange={(e) => setItemsInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarItem())}
              placeholder={modo === 'PLAN' ? "Ej: pollo, arroz..." : "Ej: Milanesa con puré..."}
              className="input-text"
            />
            <button type="button" onClick={agregarItem} className="btn btn-outline">Agregar</button>
          </div>
          
          <div className="tag-container">
            {items.map(item => (
              <span key={item} className="tag-badge">
                {item} 
                <button type="button" onClick={() => eliminarItem(item)} className="tag-delete-btn">✕</button>
              </span>
            ))}
          </div>
        </div>

        {modo === 'PLAN' && (
          <div className="input-number-group">
            <div className="input-number-wrapper">
              <label className="form-label" style={{ marginBottom: 0 }}>Personas: </label>
              <input type="number" min="1" value={personas} onChange={(e) => setPersonas(Number(e.target.value))} className="input-number" />
            </div>
            <div className="input-number-wrapper">
              <label className="form-label" style={{ marginBottom: 0 }}>Días / Opciones (1-7): </label>
              <input type="number" min="1" max="7" value={dias} onChange={(e) => setDias(Number(e.target.value))} className="input-number" />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
            {loading ? 'Pensando...' : (modo === 'PLAN' ? 'Generar Plan' : 'Ver Ingredientes y Pasos')}
          </button>
          
          {modo === 'PLAN' && (
            <button 
              type="button" 
              onClick={handleSorpresa}
              disabled={loading} 
              className="btn btn-secondary"
            >
              Sorpréndeme
            </button>
          )}
        </div>
        {error && <p className="error-text">{error}</p>}
      </form>

      {/* RESULTADO MODO: PLAN SEMANAL */}
      {plan && modo === 'PLAN' && (
        <div>
          <h2>Opciones de Menú</h2>
          {plan.plan.map((receta, index) => {
            const isSaved = estaGuardada(receta.nombre);

            return (
              <div key={index} className="card" style={{ position: 'relative' }}>
                {receta.economica && (
                  <span className="badge badge-mint" style={{ position: 'absolute', top: '1.25rem', right: '1.25rem' }}>Económica</span>
                )}
                
                <div className="recipe-header">
                  <h3 className="recipe-title">
                    {receta.dia && `${receta.dia}: `}{receta.nombre} 
                    <span className="recipe-meta-text"> - {receta.tiempo_minutos} min</span>
                  </h3>
                </div>
                
                <div className="recipe-actions">
                  <button 
                    onClick={() => isSaved ? eliminarReceta(receta.nombre) : guardarReceta(receta)}
                    className={`btn btn-mini ${isSaved ? 'btn-outline-danger' : 'btn-outline-info'}`}
                  >
                    {isSaved ? 'Quitar de guardadas' : 'Guardar receta'}
                  </button>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <strong>Usa: </strong>
                  <ul style={{ marginTop: '0.25rem' }}>
                    {receta.ingredientes_usados.map((ing, i) => <li key={i}>{ing}</li>)}
                  </ul>
                </div>

                {receta.ingredientes_faltantes.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <strong>Falta comprar:</strong>
                      <button 
                        onClick={() => setEdicionReceta(edicionReceta?.index === index ? null : { index, excluidos: [] })}
                        className="btn btn-mini btn-outline"
                      >
                        Modificar
                      </button>
                    </div>
                    
                    <ul style={{ marginTop: '0.5rem' }}>
                      {receta.ingredientes_faltantes.map((ing, i) => {
                        const estaExcluido = edicionReceta?.index === index && edicionReceta.excluidos.includes(ing);
                        
                        return (
                          <li key={i} style={{ textDecoration: estaExcluido ? 'line-through' : 'none', color: estaExcluido ? 'var(--text-secondary)' : 'inherit' }}>
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
                                style={{ marginLeft: '0.5rem', cursor: 'pointer', border: 'none', background: 'transparent', color: estaExcluido ? 'var(--accent-mint)' : 'var(--accent-coral)', fontWeight: 'bold' }}
                              >
                                {estaExcluido ? '＋' : '✕'}
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
                        className="btn btn-secondary"
                        style={{ marginTop: '0.75rem' }}
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
        <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '2rem', marginTop: '2rem' }}>
          <h2>Detalles de la Receta</h2>
          {recetaInfo.recetas_pedidas.map((receta, index) => (
            <div key={index} className="card" style={{ position: 'relative' }}>
              <div className="recipe-header">
                <h3 className="recipe-title">
                  {receta.nombre} 
                  <span className="recipe-meta-text"> - {receta.tiempo_minutos} min</span>
                </h3>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <strong>Ingredientes:</strong>
                <ul style={{ marginTop: '0.25rem' }}>
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
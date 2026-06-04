import { useState, useEffect } from 'react';
import { generarPlan, generarListaCompras, generarSorpresa, modificarReceta } from '../services/api';
import type { PlanResponse, ComprasResponse, Receta } from '../types/plan';
import { useRecetasGuardadas } from '../hooks/useRecetasGuardadas';

export default function Home({ modo }: { modo: 'PLAN' | 'RECETA' }) {

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

  // Resetear formulario cada vez que el modo cambia desde la navbar
  useEffect(() => {
    setItems([]);
    setItemsInput('');
    setPlan(null);
    setRecetaInfo(null);
    setError('');
    setEdicionReceta(null);
  }, [modo]);

  const agregarItem = () => {
    if (itemsInput.trim() && !items.includes(itemsInput.trim())) {
      setItems([...items, itemsInput.trim()]);
      setItemsInput('');
    }
  };

  const eliminarItem = (itemAEliminar: string) => {
    setItems(items.filter(i => i !== itemAEliminar));
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
      <h1>{modo === 'PLAN' ? 'Armar Menú' : 'Consultar Receta'}</h1>

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label className="form-label">
            {modo === 'PLAN' ? 'Ingredientes que tienes:' : '¿Qué platillos quieres preparar?:'}
          </label>
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

                {/* Botón guardar — esquina superior derecha */}
                <button
                  onClick={() => isSaved ? eliminarReceta(receta.nombre) : guardarReceta(receta)}
                  className={`recipe-save-btn ${isSaved ? 'saved' : ''}`}
                  title={isSaved ? 'Quitar de guardadas' : 'Guardar receta'}
                >
                  {isSaved ? (
                    /* bookmark filled */
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  ) : (
                    /* bookmark outline + plus */
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      <line x1="12" y1="8" x2="12" y2="14" />
                      <line x1="9" y1="11" x2="15" y2="11" />
                    </svg>
                  )}
                </button>

                {receta.economica && (
                  <span className="badge badge-mint" style={{ position: 'absolute', top: '1.25rem', right: '3.25rem' }}>Económica</span>
                )}

                <div className="recipe-header">
                  <h3 className="recipe-title">
                    {receta.dia && `${receta.dia}: `}{receta.nombre}
                    <span className="recipe-meta-text"> · {receta.tiempo_minutos} min</span>
                  </h3>
                </div>

                {/* Ingredientes usados — chips horizontales */}
                <div className="ingredient-section">
                  <span className="ingredient-label">Usa:</span>
                  <div className="ingredient-chips">
                    {receta.ingredientes_usados.map((ing, i) => (
                      <span key={i} className="ingredient-chip chip-green">{ing}</span>
                    ))}
                  </div>
                </div>

                {/* Ingredientes faltantes */}
                {receta.ingredientes_faltantes.length > 0 && (
                  <div className="ingredient-section" style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                      <span className="ingredient-label">Falta comprar:</span>

                      {/* Toggle de edición */}
                      <button
                        onClick={() => setEdicionReceta(edicionReceta?.index === index ? null : { index, excluidos: [] })}
                        className={`icon-btn ${edicionReceta?.index === index ? 'icon-btn-active' : ''}`}
                        title={edicionReceta?.index === index ? 'Cancelar edición' : 'Seleccionar ingredientes a reemplazar'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>

                      {/* Botón de confirmar — siempre en la misma fila */}
                      {edicionReceta?.index === index && edicionReceta.excluidos.length > 0 && (
                        <button
                          onClick={() => handleReemplazarMultiples(receta, index, edicionReceta.excluidos)}
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', lineHeight: 1.4 }}
                          disabled={loading}
                        >
                          {loading ? 'Pensando...' : `Reemplazar ${edicionReceta.excluidos.length} ingrediente${edicionReceta.excluidos.length > 1 ? 's' : ''}`}
                        </button>
                      )}
                    </div>

                    <div className="ingredient-chips">
                      {receta.ingredientes_faltantes.map((ing, i) => {
                        const estaExcluido = edicionReceta?.index === index && edicionReceta.excluidos.includes(ing);
                        return (
                          <span
                            key={i}
                            className={`ingredient-chip chip-coral ${estaExcluido ? 'chip-excluded' : ''}`}
                            onClick={() => {
                              if (edicionReceta?.index !== index) return;
                              if (estaExcluido) {
                                setEdicionReceta({ index, excluidos: edicionReceta.excluidos.filter(e => e !== ing) });
                              } else {
                                setEdicionReceta({ index, excluidos: [...edicionReceta.excluidos, ing] });
                              }
                            }}
                            style={{ cursor: edicionReceta?.index === index ? 'pointer' : 'default' }}
                          >
                            {estaExcluido && (
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            )}
                            {ing}
                          </span>
                        );
                      })}
                    </div>
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
          {recetaInfo.recetas_pedidas.map((receta, index) => {
            const isSaved = estaGuardada(receta.nombre);
            // Convertimos RecetaRequerida al shape de Receta para poder guardarlo
            const recetaParaGuardar = {
              dia: '',
              nombre: receta.nombre,
              tiempo_minutos: receta.tiempo_minutos,
              ingredientes_usados: receta.ingredientes ?? [],
              ingredientes_faltantes: [],
              pasos: receta.pasos ?? [],
            };

            return (
              <div key={index} className="card" style={{ position: 'relative' }}>

                {/* Botón guardar — esquina superior derecha */}
                <button
                  onClick={() => isSaved ? eliminarReceta(receta.nombre) : guardarReceta(recetaParaGuardar)}
                  className={`recipe-save-btn ${isSaved ? 'saved' : ''}`}
                  title={isSaved ? 'Quitar de guardadas' : 'Guardar receta'}
                >
                  {isSaved ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      <line x1="12" y1="8" x2="12" y2="14" />
                      <line x1="9" y1="11" x2="15" y2="11" />
                    </svg>
                  )}
                </button>

                <div className="recipe-header">
                  <h3 className="recipe-title">
                    {receta.nombre}
                    <span className="recipe-meta-text"> · {receta.tiempo_minutos} min</span>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
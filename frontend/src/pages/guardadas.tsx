import { useRecetasGuardadas } from '../hooks/useRecetasGuardadas';

export default function Guardadas() {
  const { recetasGuardadas, eliminarReceta } = useRecetasGuardadas();

  if (recetasGuardadas.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <h2>Mis recetas guardadas</h2>
        <p style={{ marginTop: '1rem' }}>Aún no tienes recetas guardadas.</p>
        <p style={{ marginTop: '0.5rem' }}>Ve a buscar nuevas ideas y guárdalas para que aparezcan aquí.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Mis recetas guardadas ({recetasGuardadas.length})</h1>
      <p style={{ marginBottom: '2rem' }}>
        Estas recetas están guardadas en tu navegador y no se borrarán al cerrar la página.
      </p>
      
      {recetasGuardadas.map((receta, index) => (
        <div key={index} className="card" style={{ position: 'relative' }}>

          {/* Botón eliminar — esquina superior derecha */}
          <button
            onClick={() => eliminarReceta(receta.nombre)}
            className="recipe-save-btn saved"
            title="Eliminar receta"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>

          {receta.economica && (
            <span className="badge badge-mint" style={{ position: 'absolute', top: '1.25rem', right: '3.25rem' }}>Económica</span>
          )}

          <div className="recipe-header">
            <h3 className="recipe-title">
              {receta.nombre}
              <span className="recipe-meta-text"> · {receta.tiempo_minutos} min</span>
            </h3>
          </div>

          <div className="ingredient-section">
            <span className="ingredient-label">
              {receta.ingredientes_faltantes.length === 0 ? 'Ingredientes:' : 'Usa:'}
            </span>
            <div className="ingredient-chips">
              {receta.ingredientes_usados.map((ing, i) => (
                <span key={i} className="ingredient-chip chip-green">{ing}</span>
              ))}
            </div>
          </div>

          {receta.ingredientes_faltantes.length > 0 && (
            <div className="ingredient-section" style={{ marginBottom: '1rem' }}>
              <span className="ingredient-label">Falta comprar:</span>
              <div className="ingredient-chips">
                {receta.ingredientes_faltantes.map((ing, i) => (
                  <span key={i} className="ingredient-chip chip-coral">{ing}</span>
                ))}
              </div>
            </div>
          )}

          <h4>Pasos:</h4>
          <ol>{receta.pasos.map((paso, i) => <li key={i}>{paso}</li>)}</ol>
        </div>
      ))}
    </div>
  );
}
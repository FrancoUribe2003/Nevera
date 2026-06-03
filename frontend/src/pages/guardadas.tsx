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
          {receta.economica && (
            <span className="badge badge-mint" style={{ position: 'absolute', top: '1.25rem', right: '1.25rem' }}>Económica</span>
          )}
          
          <div className="recipe-header">
            <h3 className="recipe-title">
              {receta.nombre} 
              <span className="recipe-meta-text"> - {receta.tiempo_minutos} min</span>
            </h3>
          </div>
          
          <div className="recipe-actions">
            <button 
              onClick={() => eliminarReceta(receta.nombre)}
              className="btn btn-mini btn-outline-danger"
            >
              Eliminar
            </button>
          </div>

          <p style={{ marginBottom: '0.5rem' }}>
            <strong>Usa:</strong> {receta.ingredientes_usados.join(', ')}
          </p>
          
          {receta.ingredientes_faltantes.length > 0 && (
            <p style={{ marginBottom: '1rem' }}>
              <strong>Falta comprar:</strong> {receta.ingredientes_faltantes.join(', ')}
            </p>
          )}
          
          <h4>Pasos:</h4>
          <ol>{receta.pasos.map((paso, i) => <li key={i}>{paso}</li>)}</ol>
        </div>
      ))}
    </div>
  );
}
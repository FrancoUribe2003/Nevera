import { useRecetasGuardadas } from '../hooks/useRecetasGuardadas';

export default function Guardadas() {
  const { recetasGuardadas, eliminarReceta } = useRecetasGuardadas();

  if (recetasGuardadas.length === 0) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2>Mis recetas guardadas 📖</h2>
        <p>Aún no tienes recetas guardadas.</p>
        <p>Ve a buscar nuevas ideas y guárdalas para que aparezcan aquí.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Mis recetas guardadas ({recetasGuardadas.length}) 📖</h1>
      <p style={{ marginBottom: '2rem', color: '#666' }}>Estas recetas están guardadas en tu navegador y no se borrarán al cerrar la página.</p>
      
      {recetasGuardadas.map((receta, index) => (
        <div key={index} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', position: 'relative' }}>
          {receta.economica && (
            <span style={{ position: 'absolute', top: 10, right: 10, background: '#4CAF50', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>Económica</span>
          )}
          
          <h3 style={{ marginTop: 0 }}>{receta.nombre} ⏱️ {receta.tiempo_minutos} min</h3>
          
          <button 
            onClick={() => eliminarReceta(receta.nombre)}
            style={{ marginBottom: '1rem', padding: '0.4rem 0.8rem', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            🗑️ Eliminar
          </button>

          <p><strong>Usa:</strong> {receta.ingredientes_usados.join(', ')}</p>
          {receta.ingredientes_faltantes.length > 0 && <p><strong>Falta comprar:</strong> {receta.ingredientes_faltantes.join(', ')}</p>}
          <h4>Pasos:</h4>
          <ol>{receta.pasos.map((paso, i) => <li key={i}>{paso}</li>)}</ol>
        </div>
      ))}
    </div>
  );
}
import { useState } from 'react';
import Home from './pages/home';
import Guardadas from './pages/guardadas';

type View = 'HOME' | 'GUARDADAS';

function App() {
  const [currentView, setCurrentView] = useState<View>('HOME');

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', margin: 0, padding: 0 }}>
      {/* Navbar Simple */}
      <nav style={{ background: '#333', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setCurrentView('HOME')}>
          ¿Qué hay hoy? 🍽️
        </h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => setCurrentView('HOME')}
            style={{ background: 'transparent', color: currentView === 'HOME' ? '#4CAF50' : 'white', border: 'none', fontSize: '1rem', cursor: 'pointer', fontWeight: currentView === 'HOME' ? 'bold' : 'normal' }}
          >
            Buscar Recetas
          </button>
          <button 
            onClick={() => setCurrentView('GUARDADAS')}
            style={{ background: 'transparent', color: currentView === 'GUARDADAS' ? '#4CAF50' : 'white', border: 'none', fontSize: '1rem', cursor: 'pointer', fontWeight: currentView === 'GUARDADAS' ? 'bold' : 'normal' }}
          >
            Guardadas ⭐
          </button>
        </div>
      </nav>

      {/* Contenido Dinámico */}
      <div style={{ padding: '0 1rem' }}>
        {currentView === 'HOME' ? <Home /> : <Guardadas />}
      </div>
    </div>
  );
}

export default App;

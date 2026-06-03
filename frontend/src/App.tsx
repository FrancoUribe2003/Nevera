import { useState } from 'react';
import Home from './pages/home';
import Guardadas from './pages/guardadas';

type View = 'HOME' | 'GUARDADAS';

function App() {
  const [currentView, setCurrentView] = useState<View>('HOME');

  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="navbar">
        <h2 className="navbar-brand" onClick={() => setCurrentView('HOME')}>
          Nevera - ¿Que hay hoy?
        </h2>
        <div className="navbar-nav">
          <button 
            onClick={() => setCurrentView('HOME')}
            className={`nav-link ${currentView === 'HOME' ? 'active' : ''}`}
          >
            Buscar Recetas
          </button>
          <button 
            onClick={() => setCurrentView('GUARDADAS')}
            className={`nav-link ${currentView === 'GUARDADAS' ? 'active' : ''}`}
          >
            Guardadas
          </button>
        </div>
      </nav>

      {/* Contenido Dinámico */}
      <main className="main-content">
        {currentView === 'HOME' ? <Home /> : <Guardadas />}
      </main>
    </div>
  );
}

export default App;
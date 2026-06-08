type View = 'HOME' | 'GUARDADAS';
type Modo = 'PLAN' | 'RECETA';

export default function Navbar({ modo, currentView, setCurrentView, irA }: {
  modo: Modo,
  currentView: View,
  setCurrentView: (v: View) => void,
  irA: (m: Modo) => void
}) {
  return (
    <nav className="navbar">
      <h2 className="navbar-brand" onClick={() => irA('PLAN')}>
        Nevera - ¿Que hay hoy?
      </h2>
      <div className="navbar-nav">
        <button
          onClick={() => irA('PLAN')}
          className={`nav-link ${currentView === 'HOME' && modo === 'PLAN' ? 'active' : ''}`}
        >
          Armar Menú
        </button>
        <button
          onClick={() => irA('RECETA')}
          className={`nav-link ${currentView === 'HOME' && modo === 'RECETA' ? 'active' : ''}`}
        >
          Consultar Receta
        </button>
        <button
          onClick={() => setCurrentView('GUARDADAS')}
          className={`nav-link ${currentView === 'GUARDADAS' ? 'active' : ''}`}
        >
          Guardadas
        </button>
      </div>
    </nav>
  );
}
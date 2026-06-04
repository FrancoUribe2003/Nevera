import { useState } from 'react';
import Home from './pages/home';
import Guardadas from './pages/guardadas';
import Navbar from './components/navBar';
import Footer from './components/footer'

type View = 'HOME' | 'GUARDADAS';
type Modo = 'PLAN' | 'RECETA';

function App() {
  const [currentView, setCurrentView] = useState<View>('HOME');
  const [modo, setModo] = useState<Modo>('PLAN');

  const irA = (modo: Modo) => {
    setModo(modo);
    setCurrentView('HOME');
  };

  return (
    <div className="app-container">
      <Navbar
        modo={modo}
        currentView={currentView}
        setCurrentView={setCurrentView}
        irA={irA}
      />

      <main className="main-content">
        {currentView === 'HOME' ? <Home modo={modo} /> : <Guardadas />}
      </main>

      <Footer />
    </div>
  );
}

export default App;
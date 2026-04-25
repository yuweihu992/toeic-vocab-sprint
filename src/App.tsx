import { useState } from 'react';
import { Home } from './pages/Home';
import { Sprint } from './pages/Sprint';
import { Gallery } from './pages/Gallery';

type View = 'home' | 'sprint' | 'gallery';

export default function App() {
  const [view, setView] = useState<View>('home');

  return (
    <div className="min-h-screen bg-slate-50">
      {view === 'home' && (
        <Home
          onStartSprint={() => setView('sprint')}
          onOpenGallery={() => setView('gallery')}
        />
      )}
      {view === 'sprint' && <Sprint onExit={() => setView('home')} />}
      {view === 'gallery' && <Gallery onExit={() => setView('home')} />}
    </div>
  );
}

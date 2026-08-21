import { PaginaPrincipal } from '@/paginas/PaginaPrincipal';
import { PantallaAuth } from '@/componentes/PantallaAuth';
import { useAuth } from '@/hooks/useAuth';

function App() {
  const { session, cargando, error, login, registro, logout } = useAuth();
  if (cargando) return <div className="grid min-h-screen place-items-center bg-[#f8f7fb] text-sm text-[#777887]">Cargando FinanzPro...</div>;
  if (!session) return <PantallaAuth onLogin={login} onRegistro={registro} error={error} />;
  return <PaginaPrincipal session={session} onLogout={logout} />;
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Portal from './pages/Portal/Portal';
import ControleAcesso from './pages/ControleAcesso/ControleAcesso';
import AlterarSenha from './pages/AlterarSenha/AlterarSenha';
import Secretaria from './pages/Secretaria/Secretaria';
import Congregacoes from './pages/Congregacoes/Congregacoes';
import Financeiro from './pages/Financeiro/Financeiro';
import Cultos from './pages/Cultos/Cultos';
import Projetos from './pages/Projetos/Projetos';
import Gabinete from './pages/Gabinete/Gabinete';
import Logs from './pages/Logs/Logs';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/painel" element={<Portal />} />
        <Route path="/controle-acesso" element={<ControleAcesso />} />
        <Route path="/alterar-senha" element={<AlterarSenha />} />
        <Route path="/secretaria" element={<Secretaria />} />
        <Route path="/membros" element={<Secretaria />} />
        <Route path="/congregacoes" element={<Congregacoes />} />
        <Route path="/financeiro" element={<Financeiro />} />
        <Route path="/cultos" element={<Cultos />} />
        <Route path="/projetos" element={<Projetos />} />
        <Route path="/gabinete" element={<Gabinete />} />
        <Route path="/logs" element={<Logs />} />

      </Routes>
    </BrowserRouter>
  );
}


export default App;
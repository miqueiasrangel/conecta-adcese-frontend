import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaArrowLeft } from 'react-icons/fa';
import './NavbarHeader.css';

function NavbarHeader({ tituloModulo, descricaoModulo, botoesAcao }) {
  const navigate = useNavigate();
  const usuarioLogado = localStorage.getItem('usuarioLogado') || 'Administrador';

  return (
    <header className="module-hero-bar">
      <div className="module-hero-container">
        <div className="module-hero-info">
          <h2>{tituloModulo}</h2>
          {descricaoModulo && <p>{descricaoModulo}</p>}
        </div>

        <div className="module-hero-actions">
          <div className="user-badge-nav-module">
            <FaUserCircle className="user-avatar-icon" />
            <span>Olá, <strong>{usuarioLogado}</strong></span>
          </div>
          <button onClick={() => navigate('/painel')} className="btn-voltar-portal-nav">
            <FaArrowLeft /> Voltar ao Portal
          </button>
          {botoesAcao}
        </div>
      </div>
    </header>
  );
}

export default NavbarHeader;

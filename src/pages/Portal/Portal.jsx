import { useState, useEffect } from 'react';
import api from '../../services/api';
import * as FaIcons from 'react-icons/fa';
import { FaUserCog, FaKey, FaSignOutAlt, FaSearch, FaChurch, FaArrowRight, FaUsers, FaBuilding, FaCalendarAlt, FaHandHoldingHeart, FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Portal.css'; 

function Portal() {
  const [modulos, setModulos] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [estatisticas, setEstatisticas] = useState({
    qtdMembros: 0,
    qtdCongregacoes: 0,
    qtdCultos: 0,
    qtdProjetos: 0
  });

  const usuarioLogado = localStorage.getItem('usuarioLogado') || 'Administrador';

  const navigate = useNavigate();

  const fazerLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioLogado');
    navigate('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Carregar módulos
    api.get('/modulos')
      .then(resposta => {
        const dados = Array.isArray(resposta.data) ? resposta.data : (resposta.data?.content || []);
        setModulos(dados);
      })
      .catch(erro => {
        console.error("Erro ao buscar os módulos:", erro);
        setModulos([]);
      });

    // Carregar contadores rápidos para a hero section
    Promise.allSettled([
      api.get('/membros'),
      api.get('/congregacoes'),
      api.get('/cultos'),
      api.get('/projetos')
    ]).then(([resMembros, resCong, resCultos, resProj]) => {
      const hoje = new Date();
      const mesAtual = String(hoje.getMonth() + 1).padStart(2, '0');
      const anoAtual = String(hoje.getFullYear());

      const listaMembros = resMembros.status === 'fulfilled' && Array.isArray(resMembros.value.data) ? resMembros.value.data : [];
      const listaCong = resCong.status === 'fulfilled' && Array.isArray(resCong.value.data) ? resCong.value.data : [];
      const listaCultos = resCultos.status === 'fulfilled' && Array.isArray(resCultos.value.data) ? resCultos.value.data : [];
      const listaProjetos = resProj.status === 'fulfilled' && Array.isArray(resProj.value.data) ? resProj.value.data : [];

      // Filtra cultos do mês vigente
      const cultosDoMes = listaCultos.filter(c => c.data && c.data.startsWith(`${anoAtual}-${mesAtual}`));

      // Filtra projetos ativos em andamento
      const projetosAtivos = listaProjetos.filter(p => p.status === 'Em Andamento');

      setEstatisticas({
        qtdMembros: listaMembros.filter(m => m.status === 'Ativo').length || listaMembros.length,
        qtdCongregacoes: listaCong.length,
        qtdCultos: cultosDoMes.length,
        qtdProjetos: projetosAtivos.length
      });
    });
  }, [navigate]);

  const RenderizarIcone = ({ nomeIcone }) => {
    const IconeComponente = FaIcons[nomeIcone];
    return IconeComponente ? <IconeComponente /> : <FaChurch />;
  };

  const listaSeguraModulos = Array.isArray(modulos) ? modulos : [];
  const isAdmin = usuarioLogado.toLowerCase() === 'admin';

  const modulosFiltrados = listaSeguraModulos
    .filter(modulo => isAdmin || modulo.rota !== '/controle-acesso')
    .filter(modulo => 
      (modulo.titulo || '').toLowerCase().includes((termoBusca || '').toLowerCase()) ||
      (modulo.descricao || '').toLowerCase().includes((termoBusca || '').toLowerCase())
    );

  const dataAtualFormatada = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="portal-wrapper">
      {/* NAVBAR SUPERIOR MODERNA */}
      <nav className="portal-navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <div className="brand-logo-img-wrapper">
              <img src="/logo-clean.png" alt="ADCESE Logo" className="brand-logo-img" />
            </div>
            <div className="brand-text">
              <h1>Conecta ADCESE</h1>
              <p>Portal de Gestão Eclesiástica Integrado — CADEESO</p>
            </div>
          </div>

          <div className="navbar-actions">
            <div className="user-badge-nav">
              <FaUserCircle className="user-avatar-icon" />
              <span>Olá, <strong>{usuarioLogado}</strong></span>
            </div>
            <button onClick={() => navigate('/alterar-senha')} className="nav-btn">
              <FaKey /> Alterar Senha
            </button>
            <button onClick={fazerLogout} className="nav-btn nav-btn-sair">
              <FaSignOutAlt /> Sair
            </button>
          </div>
        </div>
      </nav>

      {/* CONTEÚDO PRINCIPAL DO PORTAL */}
      <main className="portal-content">
        
        {/* HERO BANNER GLASSMORPHISM */}
        <section className="hero-welcome-card">
          <div className="hero-glass-overlay"></div>
          <div className="welcome-info">
            <span className="hero-data-pill">📅 {dataAtualFormatada}</span>
            <h2>Bem-vindo ao Portal Conecta ADCESE</h2>
            <p>Selecione um dos módulos operacionais abaixo para gerenciar a igreja com excelência e transparência.</p>
          </div>

          <div className="search-modulo-box">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar módulo..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="search-input"
            />
          </div>
        </section>

        {/* WIDGETS DE RESUMO RÁPIDO DO SISTEMA */}
        <section className="quick-stats-grid">
          <div className="stat-card membros">
            <div className="stat-icon-wrapper"><FaUsers /></div>
            <div>
              <span>Membros Ativos</span>
              <h3>{estatisticas.qtdMembros}</h3>
            </div>
          </div>

          <div className="stat-card congregacoes">
            <div className="stat-icon-wrapper"><FaBuilding /></div>
            <div>
              <span>Congregações Conectadas</span>
              <h3>{estatisticas.qtdCongregacoes}</h3>
            </div>
          </div>

          <div className="stat-card cultos">
            <div className="stat-icon-wrapper"><FaCalendarAlt /></div>
            <div>
              <span>Cultos este Mês</span>
              <h3>{estatisticas.qtdCultos}</h3>
            </div>
          </div>

          <div className="stat-card projetos">
            <div className="stat-icon-wrapper"><FaHandHoldingHeart /></div>
            <div>
              <span>Projetos Sociais Ativos</span>
              <h3>{estatisticas.qtdProjetos}</h3>
            </div>
          </div>
        </section>

        {/* LISTAGEM DOS MÓDULOS */}
        <section>
          <div className="section-header">
            <h3>
              Módulos Operacionais 
              <span className="modulo-count-pill">{modulosFiltrados.length} disponível(is)</span>
            </h3>
          </div>

          {modulosFiltrados.length === 0 ? (
            <div className="empty-search-box">
              <p>Nenhum módulo encontrado para a pesquisa "{termoBusca}".</p>
            </div>
          ) : (
            <div className="modulos-grid">
              {modulosFiltrados.map(modulo => (
                <div key={modulo.id} className="modulo-card">
                  <div className="modulo-top">
                    <div className="modulo-icone-wrapper">
                      <RenderizarIcone nomeIcone={modulo.icone} />
                    </div>
                    <span className="modulo-status-badge">Ativo</span>
                  </div>

                  <h2>{modulo.titulo}</h2>
                  <p>{modulo.descricao}</p>

                  <button 
                    className="acessar-btn"
                    onClick={() => {
                      if (modulo.titulo.includes('Secretaria') || modulo.rota === '/membros') {
                        navigate('/secretaria');
                      } else if (modulo.titulo.includes('Culto') || modulo.rota === '/cultos') {
                        navigate('/cultos');
                      } else if (modulo.titulo.includes('Projeto') || modulo.titulo.includes('Missão') || modulo.rota === '/projetos') {
                        navigate('/projetos');
                      } else if (modulo.rota) {
                        navigate(modulo.rota);
                      } else if (modulo.titulo.includes('Congrega')) {
                        navigate('/congregacoes');
                      } else if (modulo.titulo.includes('Financeiro')) {
                        navigate('/financeiro');
                      } else if (modulo.titulo.includes('Gabinete')) {
                        navigate('/gabinete');
                      } else {
                        alert('Este módulo está em desenvolvimento! Ficará pronto em breve.');
                      }
                    }}
                  >
                    Acessar Módulo <FaArrowRight className="arrow-icon" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* FOOTER MODERNO */}
      <footer className="portal-footer">
        <p>© {new Date().getFullYear()} Conecta ADCESE - Assembleia de Deus CADEESO em Santo Estevão. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

export default Portal;
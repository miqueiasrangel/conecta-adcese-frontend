import { useState, useEffect } from 'react';
import api from '../../services/api';
import NavbarHeader from '../../components/NavbarHeader/NavbarHeader';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaTimes } from 'react-icons/fa';
import './Logs.css';

function Logs() {
  const [logs, setLogs] = useState([]);
  const [logSelecionado, setLogSelecionado] = useState(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      showToast("Acesso negado. Módulo restrito a administradores.", "error");
      navigate('/painel');
      return;
    }
    carregarLogs();
  }, [navigate, showToast]);

  const carregarLogs = () => {
    api.get('/logs')
      .then(res => setLogs(res.data))
      .catch(err => {
        console.error("Erro ao buscar logs", err);
        showToast("Erro ao carregar os logs de auditoria.", "error");
      });
  };

  const formatarDataHora = (dataString) => {
    if (!dataString) return '';
    const d = new Date(dataString);
    return d.toLocaleString('pt-BR');
  };

  // Ocultar logs puramente de LOGIN conforme solicitado
  const logsFiltrados = (Array.isArray(logs) ? logs : []).filter(log => 
    log.acao && !log.acao.toUpperCase().includes('LOGIN')
  );

  return (
    <div className="logs-wrapper">
      <NavbarHeader 
        tituloModulo="Logs de Auditoria"
        descricaoModulo="Visualize o registro de eventos, exclusões e alterações realizadas no sistema."
      />

      <div className="logs-container">
        <div className="logs-content">
          <div className="logs-table-wrapper">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Módulo</th>
                  <th>Usuário</th>
                  <th>Ação</th>
                  <th style={{ textAlign: 'center' }}>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {logsFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>Nenhum log operacional registrado.</td>
                  </tr>
                ) : (
                  logsFiltrados.map(log => (
                    <tr key={log.id} style={{ cursor: 'pointer' }} onClick={() => setLogSelecionado(log)}>
                      <td>{formatarDataHora(log.dataHora)}</td>
                      <td><strong>{log.modulo || 'Geral'}</strong></td>
                      <td><strong>{log.usuarioLogin}</strong></td>
                      <td><span className="log-acao-badge">{log.acao}</span></td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          className="btn-ver-detalhes"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLogSelecionado(log);
                          }}
                        >
                          <FaEye /> Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL DE DETALHAMENTO DO LOG */}
      {logSelecionado && (
        <div className="modal-overlay" onClick={() => setLogSelecionado(null)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '2px solid var(--bg-subtle, #e2e8f0)', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>🔍 Detalhes da Ação Auditada</h3>
              <button 
                onClick={() => setLogSelecionado(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                <FaTimes />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
              <div>
                <strong>Data e Hora:</strong> {formatarDataHora(logSelecionado.dataHora)}
              </div>
              <div>
                <strong>Módulo Afetado:</strong> {logSelecionado.modulo || 'Sistema'}
              </div>
              <div>
                <strong>Usuário Responsável:</strong> <span style={{ color: '#003366', fontWeight: 'bold' }}>{logSelecionado.usuarioLogin}</span>
              </div>
              <div>
                <strong>Tipo de Ação:</strong> <span className="log-acao-badge">{logSelecionado.acao}</span>
              </div>
              
              <div style={{ marginTop: '10px', background: 'var(--bg-subtle, #f8fafc)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color, #cbd5e1)' }}>
                <strong style={{ display: 'block', marginBottom: '5px' }}>Descrição Completa:</strong>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.5' }}>
                  {logSelecionado.detalhes}
                </p>
              </div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button onClick={() => setLogSelecionado(null)} className="btn-salvar" style={{ backgroundColor: '#64748b' }}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Logs;

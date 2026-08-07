import { useState, useEffect } from 'react';
import api from '../../services/api';
import NavbarHeader from '../../components/NavbarHeader/NavbarHeader';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import './Logs.css';

function Logs() {
  const [logs, setLogs] = useState([]);
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

  return (
    <div className="logs-wrapper">
      <NavbarHeader 
        tituloModulo="Logs de Auditoria"
        descricaoModulo="Visualize o registro de eventos e ações realizadas no sistema."
      />

      <div className="logs-container">
        <div className="logs-content">
          <div className="logs-table-wrapper">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Usuário</th>
                  <th>Ação</th>
                  <th>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>Nenhum log encontrado.</td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id}>
                      <td>{formatarDataHora(log.dataHora)}</td>
                      <td><strong>{log.usuarioLogin}</strong></td>
                      <td><span className="log-acao-badge">{log.acao}</span></td>
                      <td>{log.detalhes}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Logs;

import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import NavbarHeader from '../../components/NavbarHeader/NavbarHeader';
import '../Secretaria/Secretaria.css'; 


function Congregacoes() {
  const [congregacoes, setCongregacoes] = useState([]);
  const [obreiros, setObreiros] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [congregacaoEdicaoId, setCongregacaoEdicaoId] = useState(null);
  
  const [formCongregacao, setFormCongregacao] = useState({ nome: '', dirigenteId: '', endereco: '' });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    carregarCongregacoes();
    carregarObreiros();
  }, [navigate]);

  const carregarCongregacoes = () => {
    api.get('/congregacoes')
      .then(res => setCongregacoes(res.data))
      .catch(err => console.error("Erro ao carregar congregações:", err));
  };

  const carregarObreiros = () => {
    api.get('/membros/obreiros')
      .then(res => setObreiros(res.data))
      .catch(err => console.error("Erro ao carregar obreiros:", err));
  };

  const abrirModalNovo = () => {
    setCongregacaoEdicaoId(null);
    setFormCongregacao({ nome: '', dirigenteId: '', endereco: '' });
    setModalAberto(true);
  };

  const abrirModalEditar = (cong) => {
    setCongregacaoEdicaoId(cong.id);
    setFormCongregacao({
      nome: cong.nome || '',
      dirigenteId: cong.dirigente ? cong.dirigente.id : '',
      endereco: cong.endereco || ''
    });
    setModalAberto(true);
  };

  const lidarComMudanca = (e) => {
    setFormCongregacao({ ...formCongregacao, [e.target.name]: e.target.value });
  };

  const salvarCongregacao = (e) => {
    e.preventDefault();

    const payload = {
      nome: formCongregacao.nome,
      endereco: formCongregacao.endereco,
      dirigente: formCongregacao.dirigenteId ? { id: formCongregacao.dirigenteId } : null
    };

    if (congregacaoEdicaoId) {
      // Edição (PUT)
      api.put(`/congregacoes/${congregacaoEdicaoId}`, payload)
        .then(() => {
          alert("Congregação atualizada com sucesso!");
          setModalAberto(false);
          carregarCongregacoes();
        })
        .catch(err => {
          console.error("Erro ao atualizar congregação:", err);
          alert("Erro ao atualizar congregação.");
        });
    } else {
      // Cadastro (POST)
      api.post('/congregacoes', payload)
        .then(() => {
          alert("Congregação cadastrada com sucesso!");
          setModalAberto(false);
          carregarCongregacoes();
        })
        .catch(err => {
          console.error("Erro ao cadastrar congregação:", err);
          alert("Erro ao cadastrar congregação.");
        });
    }
  };

  const handleExcluir = (cong) => {
    if (!window.confirm(`Tem certeza que deseja excluir a congregação "${cong.nome}"?`)) {
      return;
    }

    api.delete(`/congregacoes/${cong.id}`)
      .then(() => {
        alert("Congregação excluída com sucesso!");
        carregarCongregacoes();
      })
      .catch(err => {
        console.error("Erro ao excluir congregação:", err);
        alert("Erro ao excluir congregação.");
      });
  };

  return (
    <div className="secretaria-wrapper">
      <NavbarHeader 
        tituloModulo="Gestão de Congregações"
        descricaoModulo="Cadastre e gerencie as congregações do campo ADCESE e os dirigentes de campo"
        botoesAcao={
          <button onClick={abrirModalNovo} className="btn-novo">➕ Nova Congregação</button>
        }
      />

      <div className="secretaria-container">

      <main className="tabela-container">
        {congregacoes.length === 0 ? (
          <p className="msg-vazia">Nenhuma congregação cadastrada. Adicione a Sede para começar!</p>
        ) : (
          <table className="membros-tabela">
            <thead>
              <tr>
                <th>Nome da Congregação</th>
                <th>Dirigente / Responsável</th>
                <th>Endereço</th>
                <th style={{ width: '120px', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {congregacoes.map(cong => (
                <tr key={cong.id}>
                  <td><strong>{cong.nome}</strong></td>
                  <td>{cong.dirigente ? `${cong.dirigente.nome} (${cong.dirigente.cargo})` : 'Sem dirigente'}</td>
                  <td>{cong.endereco}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      onClick={() => abrirModalEditar(cong)} 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', marginRight: '8px' }}
                      title="Editar Congregação"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleExcluir(cong)} 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                      title="Excluir Congregação"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>

      {/* MODAL DE CADASTRO / EDIÇÃO */}
      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h2>{congregacaoEdicaoId ? 'Editar Congregação' : 'Nova Congregação'}</h2>
            <form onSubmit={salvarCongregacao} className="form-membro">
              
              <div className="form-grupo">
                <label>Nome da Congregação *</label>
                <input 
                  type="text" 
                  name="nome" 
                  value={formCongregacao.nome} 
                  onChange={lidarComMudanca} 
                  placeholder="Ex: Sede, Betel..." 
                  required 
                />
              </div>

              <div className="form-grupo">
                <label>Pastor/Dirigente Responsável</label>
                <select name="dirigenteId" value={formCongregacao.dirigenteId} onChange={lidarComMudanca}>
                  <option value="">Selecione um dirigente (Opcional)</option>
                  {obreiros.map(ob => (
                    <option key={ob.id} value={ob.id}>
                      {ob.nome} - {ob.cargo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-grupo">
                <label>Endereço</label>
                <input 
                  type="text" 
                  name="endereco" 
                  value={formCongregacao.endereco} 
                  onChange={lidarComMudanca} 
                  placeholder="Rua, Bairro, Número..." 
                />
              </div>

              <div className="modal-botoes">
                <button type="button" onClick={() => setModalAberto(false)} className="btn-cancelar">Cancelar</button>
                <button type="submit" className="btn-salvar">
                  {congregacaoEdicaoId ? 'Atualizar' : 'Salvar'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

export default Congregacoes;
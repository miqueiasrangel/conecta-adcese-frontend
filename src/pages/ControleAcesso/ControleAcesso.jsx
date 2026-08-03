import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import NavbarHeader from '../../components/NavbarHeader/NavbarHeader';
import ActionMenu from '../../components/ActionMenu/ActionMenu';
import { FaTrashAlt, FaUser } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';
import './ControleAcesso.css';

function ControleAcesso() {
  const { showToast, showConfirm } = useToast();
  const [usuarios, setUsuarios] = useState([]);
  const [modulosTotais, setModulosTotais] = useState([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [modulosMarcados, setModulosMarcados] = useState([]);
  
  // Estado para Modal de Novo Usuário
  const [modalNovoUsuario, setModalNovoUsuario] = useState(false);
  const [novoLogin, setNovoLogin] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [novosModulos, setNovosModulos] = useState([]);
  const [erroModal, setErroModal] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioLogado = localStorage.getItem('usuarioLogado') || '';
    const loginUsuario = localStorage.getItem('loginUsuario') || '';
    const isAdmin = usuarioLogado.toLowerCase().includes('admin') || loginUsuario.toLowerCase() === 'admin';
    if (!token) {
      navigate('/login');
      return;
    }
    if (!isAdmin) {
      showToast("Acesso negado. O Controle de Acesso é exclusivo para o usuário administrador.", "error");
      navigate('/painel');
      return;
    }
    carregarDados();
  }, [navigate]);

  const carregarDados = () => {
    // Busca todos os usuários
    api.get('/usuarios')
      .then(res => setUsuarios(res.data))
      .catch(err => console.error("Erro ao buscar usuários", err));

    // Busca todos os módulos do sistema
    api.get('/modulos/todos')
      .then(res => setModulosTotais(res.data))
      .catch(err => console.error("Erro ao buscar módulos", err));
  };

  // Quando clica em um usuário na lista
  const selecionarUsuario = (usuario) => {
    setUsuarioSelecionado(usuario);
    const idsPermitidos = usuario.modulosPermitidos.map(m => m.id);
    setModulosMarcados(idsPermitidos);
  };

  // Quando clica em um checkbox de usuário selecionado
  const alternarModulo = (moduloId) => {
    if (modulosMarcados.includes(moduloId)) {
      setModulosMarcados(modulosMarcados.filter(id => id !== moduloId));
    } else {
      setModulosMarcados([...modulosMarcados, moduloId]);
    }
  };

  // Quando clica em Salvar Permissões
  const salvarPermissoes = () => {
    if (!usuarioSelecionado) return;

    api.put(`/usuarios/${usuarioSelecionado.id}/permissoes`, modulosMarcados)
      .then(() => {
        showToast("Permissões salvas com sucesso!", "success");
        carregarDados();
      })
      .catch(err => {
        console.error("Erro ao salvar", err);
        showToast(err.response?.data || "Erro ao salvar permissões.", "error");
      });
  };

  // Funções para criação de novo usuário
  const abrirModalNovoUsuario = () => {
    setNovoLogin('');
    setNovaSenha('');
    setNovosModulos(modulosTotais.map(m => m.id)); // Por padrão, seleciona todos os módulos
    setErroModal('');
    setModalNovoUsuario(true);
  };

  const alternarNovoModulo = (moduloId) => {
    if (novosModulos.includes(moduloId)) {
      setNovosModulos(novosModulos.filter(id => id !== moduloId));
    } else {
      setNovosModulos([...novosModulos, moduloId]);
    }
  };

  const handleCadastrarUsuario = (e) => {
    e.preventDefault();
    if (!novoLogin.trim() || !novaSenha.trim()) {
      setErroModal("Preencha login e senha.");
      return;
    }

    api.post('/usuarios', {
      login: novoLogin.trim(),
      senha: novaSenha.trim(),
      modulosIds: novosModulos
    })
    .then(res => {
      showToast("Usuário cadastrado com sucesso!", "success");
      setModalNovoUsuario(false);
      carregarDados();
      selecionarUsuario(res.data);
    })
    .catch(err => {
      console.error("Erro ao cadastrar usuário", err);
      setErroModal(err.response?.data || "Erro ao cadastrar usuário.");
    });
  };

  // Função para excluir usuário
  const handleExcluirUsuario = (user, e) => {
    e.stopPropagation();
    showConfirm({
      titulo: 'Excluir Usuário',
      mensagem: `Tem certeza que deseja excluir o usuário "${user.login}"? Esta ação revogará todo o acesso deste usuário.`,
      textoConfirmar: 'Excluir Usuário',
      danger: true,
      onConfirm: () => {
        api.delete(`/usuarios/${user.id}`)
          .then(() => {
            showToast("Usuário excluído com sucesso!", "success");
            if (usuarioSelecionado?.id === user.id) {
              setUsuarioSelecionado(null);
            }
            carregarDados();
          })
          .catch(err => {
            console.error("Erro ao excluir usuário", err);
            showToast(err.response?.data || "Erro ao excluir usuário.", "error");
          });
      }
    });
  };

  return (
    <div className="admin-wrapper">
      <NavbarHeader 
        tituloModulo="Controle de Acesso e Usuários"
        descricaoModulo="Gerencie usuários, senhas e permissões de acesso por módulo operacional"
      />

      <div className="admin-container">

      <div className="admin-content">
        {/* Lado Esquerdo: Lista de Usuários */}
        <div className="usuarios-lista">
          <div className="lista-header">
            <h3>Usuários</h3>
            <button onClick={abrirModalNovoUsuario} className="btn-novo-usuario">+ Criar Usuário</button>
          </div>
          <ul>
            {usuarios.map(user => (
              <li 
                key={user.id} 
                onClick={() => selecionarUsuario(user)}
                className={`usuario-item ${usuarioSelecionado?.id === user.id ? 'selecionado' : ''}`}
              >
                <span className="usuario-info"><FaUser style={{ color: '#003366' }} /> {user.login}</span>
                <ActionMenu actions={[
                  { label: 'Excluir Usuário', icon: <FaTrashAlt />, danger: true, onClick: () => handleExcluirUsuario(user, { stopPropagation: () => {} }) },
                ]} />
              </li>
            ))}
          </ul>
        </div>

        {/* Lado Direito: Permissões */}
        <div className="permissoes-painel">
          {!usuarioSelecionado ? (
            <p className="msg-vazia">Selecione um usuário ao lado para editar suas permissões.</p>
          ) : (
            <>
              <div className="painel-header">
                <h3>Permissões de: <span>{usuarioSelecionado.login}</span></h3>
              </div>
              <div className="modulos-checkboxes">
                {modulosTotais.map(modulo => (
                  <label key={modulo.id} className="checkbox-item">
                    <input 
                      type="checkbox" 
                      checked={modulosMarcados.includes(modulo.id)}
                      onChange={() => alternarModulo(modulo.id)}
                    />
                    <div className="checkbox-texto">
                      <strong>{modulo.titulo}</strong>
                      <span>{modulo.descricao}</span>
                    </div>
                  </label>
                ))}
              </div>
              <button onClick={salvarPermissoes} className="btn-salvar">Salvar Permissões</button>
            </>
          )}
        </div>
      </div>

      {/* Modal para Cadastrar Novo Usuário */}
      {modalNovoUsuario && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Cadastrar Novo Usuário</h2>
            {erroModal && <div className="modal-erro">{erroModal}</div>}
            <form onSubmit={handleCadastrarUsuario}>
              <div className="form-group">
                <label>Login / Usuário:</label>
                <input 
                  type="text" 
                  value={novoLogin} 
                  onChange={e => setNovoLogin(e.target.value)} 
                  placeholder="Ex: joao.silva"
                  required
                />
              </div>

              <div className="form-group">
                <label>Senha:</label>
                <input 
                  type="password" 
                  value={novaSenha} 
                  onChange={e => setNovaSenha(e.target.value)} 
                  placeholder="Digite a senha"
                  required
                />
              </div>

              <div className="form-group">
                <label>Módulos Permitidos Inicialmente:</label>
                <div className="modal-modulos-list">
                  {modulosTotais.map(mod => (
                    <label key={mod.id} className="modal-checkbox-item">
                      <input 
                        type="checkbox"
                        checked={novosModulos.includes(mod.id)}
                        onChange={() => alternarNovoModulo(mod.id)}
                      />
                      <span>{mod.titulo}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-acoes">
                <button type="button" onClick={() => setModalNovoUsuario(false)} className="btn-cancelar">Cancelar</button>
                <button type="submit" className="btn-confirmar">Cadastrar Usuário</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

export default ControleAcesso;
import { useState, useEffect } from 'react';
import api, { registrarLog } from '../../services/api';
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
  const [novoAdmin, setNovoAdmin] = useState(false);
  const [erroModal, setErroModal] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
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
      .then(res => {
        const sorted = (res.data || []).sort((a,b) => (a.titulo || '').localeCompare(b.titulo || ''));
        setModulosTotais(sorted);
      })
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

    Promise.all([
      api.put(`/usuarios/${usuarioSelecionado.id}/permissoes`, modulosMarcados),
      api.put(`/usuarios/${usuarioSelecionado.id}/admin`, { admin: !!usuarioSelecionado.admin })
    ])
      .then(() => {
        showToast("Configurações salvas com sucesso!", "success");
        registrarLog('Controle de Acesso', 'ALTERAR_PERMISSOES', `As permissões do usuário ${usuarioSelecionado.login} foram atualizadas.`);
        carregarDados();
      })
      .catch(err => {
        console.error("Erro ao salvar", err);
        const msg = typeof err.response?.data === 'string' 
          ? err.response.data 
          : (err.response?.data?.message || "Erro ao salvar configurações.");
        showToast(msg, "error");
      });
  };

  // Funções para criação de novo usuário
  const abrirModalNovoUsuario = () => {
    setNovoLogin('');
    setNovaSenha('');
    setNovoAdmin(false);
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
      modulosIds: novosModulos,
      admin: novoAdmin
    })
    .then(res => {
      showToast("Usuário cadastrado com sucesso!", "success");
      registrarLog('Controle de Acesso', 'NOVO_USUARIO', `O usuário ${novoLogin.trim()} foi criado.`);
      setModalNovoUsuario(false);
      carregarDados();
      selecionarUsuario(res.data);
    })
    .catch(err => {
      console.error("Erro ao cadastrar usuário", err);
      const msg = typeof err.response?.data === 'string' 
        ? err.response.data 
        : (err.response?.data?.message || "Erro ao cadastrar usuário.");
      setErroModal(msg);
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
            registrarLog('Controle de Acesso', 'EXCLUIR_USUARIO', `O usuário ${user.login} foi excluído do sistema.`);
            if (usuarioSelecionado?.id === user.id) {
              setUsuarioSelecionado(null);
            }
            carregarDados();
          })
          .catch(err => {
            console.error("Erro ao excluir usuário", err);
            const msg = typeof err.response?.data === 'string' 
              ? err.response.data 
              : (err.response?.data?.message || "Erro ao excluir usuário.");
            showToast(msg, "error");
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
                <span className="usuario-info">
                  <FaUser style={{ color: '#003366' }} /> {user.login}
                  {user.admin && <span style={{marginLeft: '8px', fontSize: '10px', background: '#003366', color: 'white', padding: '2px 6px', borderRadius: '4px'}}>Admin</span>}
                </span>
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
                <h3>Configurações de: <span>{usuarioSelecionado.login}</span></h3>
              </div>
              <div className="admin-alerta-box" style={{marginBottom: '20px', padding: '15px', background: '#f5f7fa', borderRadius: '8px'}}>
                 <label className="checkbox-item" style={{margin: 0}}>
                    <input 
                      type="checkbox" 
                      checked={!!usuarioSelecionado.admin}
                      onChange={(e) => setUsuarioSelecionado({...usuarioSelecionado, admin: e.target.checked})}
                    />
                    <div className="checkbox-texto">
                      <strong>Acesso de Administrador (Total)</strong>
                      <span>Se marcado, este usuário terá permissões irrestritas no sistema.</span>
                    </div>
                  </label>
              </div>
              {(() => {
                const adminMods = modulosTotais.filter(m => m.rota === '/controle-acesso' || m.rota === '/logs');
                const commonMods = modulosTotais.filter(m => m.rota !== '/controle-acesso' && m.rota !== '/logs');
                return (
                  <>
                    <h4 style={{marginBottom: '10px', color: '#003366'}}>Módulos Comuns Permitidos</h4>
                    <div className="modulos-checkboxes">
                      {commonMods.map(modulo => (
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

                    {usuarioSelecionado.admin && adminMods.length > 0 && (
                      <>
                        <h4 style={{marginBottom: '10px', marginTop: '20px', color: '#003366'}}>Módulos Administrativos</h4>
                        <div className="modulos-checkboxes">
                          {adminMods.map(modulo => (
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
                      </>
                    )}
                  </>
                );
              })()}
              <button onClick={salvarPermissoes} className="btn-salvar-permissoes">Salvar Permissões</button>
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

              <div className="form-group" style={{marginBottom: '20px', padding: '10px', background: '#f5f7fa', borderRadius: '8px'}}>
                 <label className="checkbox-item" style={{margin: 0, display: 'flex', gap: '10px'}}>
                    <input 
                      type="checkbox" 
                      checked={novoAdmin}
                      onChange={(e) => setNovoAdmin(e.target.checked)}
                    />
                    <div className="checkbox-texto" style={{textAlign: 'left'}}>
                      <strong>Tornar Administrador</strong>
                    </div>
                  </label>
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
                {(() => {
                  const adminMods = modulosTotais.filter(m => m.rota === '/controle-acesso' || m.rota === '/logs');
                  const commonMods = modulosTotais.filter(m => m.rota !== '/controle-acesso' && m.rota !== '/logs');
                  return (
                    <div className="modal-modulos-list">
                      <div style={{fontWeight: 'bold', fontSize: '0.8rem', color: '#666', marginTop: '5px'}}>Módulos Comuns</div>
                      {commonMods.map(mod => (
                        <label key={mod.id} className="modal-checkbox-item">
                          <input 
                            type="checkbox"
                            checked={novosModulos.includes(mod.id)}
                            onChange={() => alternarNovoModulo(mod.id)}
                          />
                          <span>{mod.titulo}</span>
                        </label>
                      ))}

                      {novoAdmin && adminMods.length > 0 && (
                        <>
                          <div style={{fontWeight: 'bold', fontSize: '0.8rem', color: '#666', marginTop: '15px'}}>Módulos Administrativos</div>
                          {adminMods.map(mod => (
                            <label key={mod.id} className="modal-checkbox-item">
                              <input 
                                type="checkbox"
                                checked={novosModulos.includes(mod.id)}
                                onChange={() => alternarNovoModulo(mod.id)}
                              />
                              <span>{mod.titulo}</span>
                            </label>
                          ))}
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="modal-botoes">
                <button type="button" onClick={() => setModalNovoUsuario(false)} className="btn-cancelar">Cancelar</button>
                <button type="submit" className="btn-salvar">Cadastrar Usuário</button>
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
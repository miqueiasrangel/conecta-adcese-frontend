import { useState } from 'react';
import api from '../../services/api';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import './Login.css';

function Login() {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const efetuarLogin = (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    api.post('/login', { login, senha })
      .then(resposta => {
        const token = resposta.data.token;
        const usuario = resposta.data.nomeUsuario || login;
        localStorage.setItem('token', token);
        localStorage.setItem('usuarioLogado', usuario);
        window.location.href = '/painel'; 
      })
      .catch(() => {
        setCarregando(false);
        setErro('Login ou senha inválidos. Verifique suas credenciais e tente novamente!');
      });
  };

  return (
    <div className="login-container">
      <div className="login-overlay-glow"></div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-wrapper">
            <img src="/logo-clean.png" alt="ADCESE Logo" className="login-logo-img" />
          </div>
          <span className="login-badge-cadeeso">Assembleia de Deus — CADEESO</span>
          <h1>Conecta ADCESE</h1>
          <p>Portal de Gestão Eclesiástica Integrado</p>
        </div>

        {erro && <div className="login-erro-box">{erro}</div>}

        <form onSubmit={efetuarLogin} className="login-form">
          <div className="login-input-wrapper">
            <label>Usuário ou E-mail</label>
            <div className="input-icon-box">
              <FaUser className="input-icon" />
              <input 
                type="text" 
                value={login} 
                onChange={(e) => setLogin(e.target.value)} 
                placeholder="Digite seu login de acesso"
                required 
              />
            </div>
          </div>

          <div className="login-input-wrapper">
            <label>Senha de Acesso</label>
            <div className="input-icon-box">
              <FaLock className="input-icon" />
              <input 
                type="password" 
                value={senha} 
                onChange={(e) => setSenha(e.target.value)} 
                placeholder="Digite sua senha"
                required 
              />
            </div>
          </div>

          <button type="submit" className="login-btn-primary" disabled={carregando}>
            {carregando ? 'Autenticando...' : <><FaSignInAlt /> Entrar no Portal</>}
          </button>
        </form>

        <div className="login-card-footer">
          <p>© {new Date().getFullYear()} ADCESE Santo Estevão. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
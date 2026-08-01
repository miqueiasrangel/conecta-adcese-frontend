import { useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { FaKey, FaLock, FaCheckCircle, FaArrowLeft, FaShieldAlt } from 'react-icons/fa';
import './AlterarSenha.css';

function AlterarSenha() {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setMensagem({ texto: '', tipo: '' });

    if (novaSenha !== confirmarSenha) {
      setMensagem({ texto: 'A nova senha e a confirmação de senha não coincidem!', tipo: 'erro' });
      return;
    }

    if (novaSenha.length < 6) {
      setMensagem({ texto: 'A nova senha deve possuir no mínimo 6 caracteres por segurança.', tipo: 'erro' });
      return;
    }

    setCarregando(true);

    api.put('/usuarios/senha', { senhaAtual, novaSenha })
      .then(() => {
        setCarregando(false);
        setMensagem({ texto: 'Senha alterada com sucesso! Você será redirecionado para efetuar login.', tipo: 'sucesso' });
        
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('usuarioLogado');
          navigate('/login');
        }, 2500);
      })
      .catch((erro) => {
        setCarregando(false);
        if (erro.response && (erro.response.status === 400 || erro.response.status === 403)) {
          setMensagem({ texto: typeof erro.response.data === 'string' ? erro.response.data : 'A senha atual está incorreta!', tipo: 'erro' });
        } else {
          setMensagem({ texto: 'Erro ao alterar a senha. Tente novamente!', tipo: 'erro' });
        }
      });
  };

  return (
    <div className="alterar-senha-container">
      <div className="alterar-senha-glow"></div>
      
      <div className="alterar-senha-card">
        <div className="alterar-senha-header">
          <div className="senha-icon-wrapper">
            <FaShieldAlt className="senha-header-icon" />
          </div>
          <span className="senha-badge">Segurança da Conta</span>
          <h1>Alterar Senha</h1>
          <p>Atualize suas credenciais de acesso ao Conecta ADCESE</p>
        </div>

        {mensagem.texto && (
          <div className={`senha-alerta-box ${mensagem.tipo === 'sucesso' ? 'sucesso' : 'erro'}`}>
            {mensagem.tipo === 'sucesso' ? <FaCheckCircle /> : null}
            <span>{mensagem.texto}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="alterar-senha-form">
          <div className="senha-input-wrapper">
            <label>Senha Atual</label>
            <div className="input-icon-box">
              <FaKey className="input-icon" />
              <input 
                type="password" 
                value={senhaAtual} 
                onChange={(e) => setSenhaAtual(e.target.value)} 
                placeholder="Digite sua senha atual"
                required 
              />
            </div>
          </div>

          <div className="senha-input-wrapper">
            <label>Nova Senha (Mínimo 6 caracteres)</label>
            <div className="input-icon-box">
              <FaLock className="input-icon" />
              <input 
                type="password" 
                value={novaSenha} 
                onChange={(e) => setNovaSenha(e.target.value)} 
                placeholder="Digite a nova senha"
                required 
              />
            </div>
          </div>

          <div className="senha-input-wrapper">
            <label>Confirmar Nova Senha</label>
            <div className="input-icon-box">
              <FaLock className="input-icon" />
              <input 
                type="password" 
                value={confirmarSenha} 
                onChange={(e) => setConfirmarSenha(e.target.value)} 
                placeholder="Repita a nova senha"
                required 
              />
            </div>
          </div>

          <div className="senha-botoes-grupo">
            <button type="submit" className="btn-salvar-senha" disabled={carregando}>
              {carregando ? 'Salvando...' : 'Salvar Nova Senha'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/painel')} 
              className="btn-voltar-portal"
            >
              <FaArrowLeft /> Voltar ao Portal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AlterarSenha;
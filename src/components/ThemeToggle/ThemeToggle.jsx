import { useState, useEffect } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import './ThemeToggle.css';

function ThemeToggle() {
  const [tema, setTema] = useState(() => {
    const temaSalvo = localStorage.getItem('conecta_tema');
    return temaSalvo || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('conecta_tema', tema);
  }, [tema]);

  const alternarTema = () => {
    setTema(prevTema => (prevTema === 'light' ? 'dark' : 'light'));
  };

  return (
    <button 
      type="button" 
      onClick={alternarTema} 
      className="theme-toggle-btn"
      title={tema === 'light' ? 'Alternar para Modo Escuro (Dark Mode)' : 'Alternar para Modo Claro (Light Mode)'}
    >
      {tema === 'light' ? <FaMoon className="theme-icon moon" /> : <FaSun className="theme-icon sun" />}
      <span className="theme-toggle-text">{tema === 'light' ? 'Escuro' : 'Claro'}</span>
    </button>
  );
}

export default ThemeToggle;

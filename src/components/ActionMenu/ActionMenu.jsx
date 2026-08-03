import { useState, useRef, useEffect } from 'react';
import { FaEllipsisV } from 'react-icons/fa';
import './ActionMenu.css';

function ActionMenu({ actions = [] }) {
  const [aberto, setAberto] = useState(false);
  const [abrirParaCima, setAbrirParaCima] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickFora(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setAberto(false);
      }
    }
    if (aberto) {
      document.addEventListener('mousedown', handleClickFora);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickFora);
    };
  }, [aberto]);

  if (!actions || actions.length === 0) return null;

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!aberto && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const espacoAbaixo = window.innerHeight - rect.bottom;
      // Se houver menos de 170px livres abaixo, abre o menu para cima
      setAbrirParaCima(espacoAbaixo < 170);
    }
    setAberto(!aberto);
  };

  return (
    <div className="action-menu-container" ref={menuRef}>
      <button 
        type="button"
        className={`action-menu-trigger ${aberto ? 'active' : ''}`}
        onClick={handleToggle}
        title="Opções de Ação"
      >
        <FaEllipsisV />
      </button>

      {aberto && (
        <div className={`action-menu-dropdown ${abrirParaCima ? 'open-up' : ''}`}>
          {actions.map((action, idx) => (
            <button
              key={idx}
              type="button"
              className={`action-menu-item ${action.danger ? 'danger' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setAberto(false);
                if (action.onClick) action.onClick();
              }}
              disabled={action.disabled}
            >
              {action.icon && <span className="action-item-icon">{action.icon}</span>}
              <span className="action-item-label">{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActionMenu;

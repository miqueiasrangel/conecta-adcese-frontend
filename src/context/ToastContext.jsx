import { createContext, useContext, useState, useCallback } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes, FaQuestionCircle } from 'react-icons/fa';
import './Toast.css';

const ToastContext = createContext({});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmConfig, setConfirmConfig] = useState(null);

  const showToast = useCallback((mensagem, tipo = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prevToasts) => [...prevToasts, { id, mensagem, tipo }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const showConfirm = useCallback(({ titulo = 'Confirmação', mensagem, textoConfirmar = 'Confirmar', danger = true, onConfirm }) => {
    return new Promise((resolve) => {
      setConfirmConfig({
        titulo,
        mensagem,
        textoConfirmar,
        danger,
        onConfirm: () => {
          setConfirmConfig(null);
          if (onConfirm) onConfirm();
          resolve(true);
        },
        onCancel: () => {
          setConfirmConfig(null);
          resolve(false);
        }
      });
    });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showConfirm }}>
      {children}

      {/* RENDERIZADOR DE TOASTS FLUTUANTES (CANTO SUPERIOR DIREITO) */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-card toast-${toast.tipo}`}>
            <div className="toast-icon-wrapper">
              {toast.tipo === 'success' && <FaCheckCircle className="toast-icon" />}
              {toast.tipo === 'error' && <FaExclamationCircle className="toast-icon" />}
              {toast.tipo === 'warning' && <FaExclamationTriangle className="toast-icon" />}
              {toast.tipo === 'info' && <FaInfoCircle className="toast-icon" />}
            </div>
            <div className="toast-content">
              <span className="toast-message">{toast.mensagem}</span>
            </div>
            <button 
              type="button" 
              className="toast-close-btn" 
              onClick={() => removeToast(toast.id)}
            >
              <FaTimes />
            </button>
            <div className="toast-progress-bar"></div>
          </div>
        ))}
      </div>

      {/* MODAL DE CONFIRMAÇÃO EXECUTIVO */}
      {confirmConfig && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-card">
            <div className={`confirm-icon-badge ${confirmConfig.danger ? 'danger' : 'info'}`}>
              <FaQuestionCircle />
            </div>
            <h3>{confirmConfig.titulo}</h3>
            <p>{confirmConfig.mensagem}</p>

            <div className="confirm-modal-actions">
              <button 
                type="button" 
                className="btn-confirm-cancel" 
                onClick={confirmConfig.onCancel}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className={`btn-confirm-ok ${confirmConfig.danger ? 'danger' : 'primary'}`} 
                onClick={confirmConfig.onConfirm}
              >
                {confirmConfig.textoConfirmar}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider');
  }
  return context;
}

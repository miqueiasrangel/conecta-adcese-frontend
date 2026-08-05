import { useState, useEffect } from 'react';
import { FaMobileAlt } from 'react-icons/fa';
import './PwaInstallButton.css';

function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  if (!isInstallable) return null;

  return (
    <button 
      type="button" 
      className="btn-pwa-install" 
      onClick={handleInstallClick}
      title="Instalar Conecta ADCESE como aplicativo no celular ou computador"
    >
      <FaMobileAlt className="pwa-icon" />
      <span>Instalar App</span>
    </button>
  );
}

export default PwaInstallButton;

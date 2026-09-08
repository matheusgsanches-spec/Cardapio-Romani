import { useEffect, useState } from 'react'
import { Download, RefreshCw, Wifi, X } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export default function PwaPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installDismissed, setInstallDismissed] = useState(false)
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      if (import.meta.env.DEV) console.error('Falha ao registrar o aplicativo offline:', error)
    },
  })

  useEffect(() => {
    function handleBeforeInstall(event) {
      event.preventDefault()
      setInstallPrompt(event)
    }

    function handleInstalled() {
      setInstallPrompt(null)
      setInstallDismissed(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  async function installApplication() {
    if (!installPrompt) return
    await installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }

  function dismiss() {
    setOfflineReady(false)
    setNeedRefresh(false)
    setInstallDismissed(true)
  }

  const canInstall = Boolean(installPrompt) && !installDismissed
  if (!offlineReady && !needRefresh && !canInstall) return null

  const mode = needRefresh ? 'update' : offlineReady ? 'offline' : 'install'
  const content = {
    update: {
      Icon: RefreshCw,
      title: 'Nova versão disponível',
      text: 'Atualize para usar as melhorias mais recentes.',
    },
    offline: {
      Icon: Wifi,
      title: 'Aplicativo pronto',
      text: 'O Romani Café agora pode abrir mesmo sem conexão.',
    },
    install: {
      Icon: Download,
      title: 'Instale o Romani Café',
      text: 'Adicione o cardápio à tela inicial para acessar mais rápido.',
    },
  }[mode]
  const Icon = content.Icon

  return (
    <aside className="pwa-prompt" aria-live="polite" aria-label={content.title}>
      <span className="pwa-prompt__icon"><Icon size={21} /></span>
      <div className="pwa-prompt__content">
        <strong>{content.title}</strong>
        <p>{content.text}</p>
        {mode === 'update' && (
          <button type="button" onClick={() => updateServiceWorker(true)}>Atualizar agora</button>
        )}
        {mode === 'install' && (
          <button type="button" onClick={installApplication}>Instalar aplicativo</button>
        )}
      </div>
      <button className="pwa-prompt__close" type="button" onClick={dismiss} aria-label="Fechar aviso">
        <X size={17} />
      </button>
    </aside>
  )
}

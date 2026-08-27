import { CheckCircle2, Cloud, Database, ExternalLink, KeyRound, WifiOff } from 'lucide-react'
import { useData } from '../../context/DataContext'

export default function SettingsPage() {
  const { isFirebaseEnabled } = useData()
  return (
    <div className="settings-grid">
      <section className="surface-card settings-card settings-card--wide">
        <header><span className={`settings-status ${isFirebaseEnabled ? 'is-connected' : ''}`}>{isFirebaseEnabled ? <Cloud size={22} /> : <WifiOff size={22} />}</span><div><span className="eyebrow">AMBIENTE</span><h2>{isFirebaseEnabled ? 'Firebase conectado' : 'Modo local de desenvolvimento'}</h2><p>{isFirebaseEnabled ? 'Autenticação e Firestore estão ativos.' : 'Os dados ficam somente neste navegador até o Firebase ser configurado.'}</p></div></header>
        <div className="settings-checklist">
          <div><CheckCircle2 size={18} /><span><strong>Aplicação React</strong><small>Interface e rotas carregadas</small></span></div>
          <div><CheckCircle2 size={18} /><span><strong>Repositório de dados</strong><small>{isFirebaseEnabled ? 'Cloud Firestore' : 'LocalStorage temporário'}</small></span></div>
          <div className={isFirebaseEnabled ? '' : 'is-pending'}>{isFirebaseEnabled ? <CheckCircle2 size={18} /> : <KeyRound size={18} />}<span><strong>Autenticação administrativa</strong><small>{isFirebaseEnabled ? 'Firebase Authentication' : 'Aguardando variáveis de ambiente'}</small></span></div>
        </div>
      </section>
      <section className="surface-card settings-card"><Database size={23} /><h3>Estrutura do banco</h3><p>Três coleções mantêm a aplicação simples e escalável.</p><code>categories</code><code>foods</code><code>menus/{'{weekStart}'}</code></section>
      <section className="surface-card settings-card"><Cloud size={23} /><h3>Configurar Firebase</h3><p>Copie <code>.env.example</code> para <code>.env</code> e preencha as chaves do seu projeto.</p><a href="https://console.firebase.google.com" target="_blank" rel="noreferrer">Abrir Firebase Console <ExternalLink size={15} /></a></section>
    </div>
  )
}

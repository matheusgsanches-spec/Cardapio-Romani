import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import BrandLogo from '../components/ui/BrandLogo'

export default function NotFoundPage() {
  return (
    <main className="not-found">
      <BrandLogo className="brand-logo--not-found" />
      <strong>404</strong>
      <h1>Essa página não está no menu.</h1>
      <p>O endereço pode ter mudado ou não existe.</p>
      <Link className="button button--primary button--md" to="/menu"><ArrowLeft size={17} /> Ir para o cardápio</Link>
    </main>
  )
}

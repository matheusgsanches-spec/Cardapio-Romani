import { BRAND_LOGO_SRC } from '../../config/brand'

export default function BrandLogo({ className = '', alt = 'Romani Café' }) {
  return <img className={`brand-logo ${className}`.trim()} src={BRAND_LOGO_SRC} alt={alt} decoding="async" />
}

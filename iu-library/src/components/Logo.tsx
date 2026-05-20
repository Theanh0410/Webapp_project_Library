import './Logo.css'

interface LogoProps {
  compact?: boolean
}

export function Logo({ compact = false }: LogoProps) {
  return (
    <div className={`iu-logo ${compact ? 'iu-logo--compact' : ''}`}>
      <img
        src="/logo_image.png"
        alt="International University — Library System"
        className="iu-logo__img"
      />
    </div>
  )
}

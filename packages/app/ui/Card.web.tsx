export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`ds-card${className ? ` ${className}` : ''}`}>{children}</div>
}

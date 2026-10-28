export function Screen({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <main className={`ds-page__main${className ? ` ${className}` : ''}`}>{children}</main>
}

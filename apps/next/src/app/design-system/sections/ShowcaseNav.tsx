import { showcaseSections } from '../showcase-data'

export function ShowcaseNav() {
  return (
    <nav className="ds-showcase__nav" aria-label="Sommaire du design system">
      <p className="ds-showcase__nav-title">Sommaire</p>
      <ul className="ds-showcase__nav-list">
        {showcaseSections.map((section) => (
          <li key={section.id}>
            <a className="ds-showcase__nav-link" href={`#${section.id}`}>
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

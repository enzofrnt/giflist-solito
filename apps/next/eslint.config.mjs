import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    // Existing hydration/form-sync effects stay visible during the upgrade.
    rules: { 'react-hooks/set-state-in-effect': 'warn' },
  },
  {
    files: ['*.js'],
    // Legacy diagnostic scripts and config files use CommonJS.
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  globalIgnores([
    'node_modules/**',
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'src/generated/**',
  ]),
])

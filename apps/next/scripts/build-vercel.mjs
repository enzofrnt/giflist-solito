// Run from apps/next (the Vercel project's configured Root Directory).
// Local builds never migrate a database; only build:vercel runs this step.
console.log(`Building Giftlist with Bun ${process.versions.bun}`)

const databaseUrl = process.env.POSTGRES_URL_NON_POOLING
  || process.env.DATABASE_URL
  || process.env.POSTGRES_PRISMA_URL

async function run(script, env = process.env, timeout = 0) {
  const child = Bun.spawn([process.execPath, 'run', '--no-orphans', script], {
    env,
    stdout: 'inherit',
    stderr: 'inherit',
    ...(timeout ? { timeout } : {}),
  })
  const code = await child.exited
  if (code !== 0) throw new Error(`${script} failed (${code})`)
}

if (databaseUrl) {
  console.log('Applying versioned Prisma migrations to this deployment’s database…')
  await run('db:migrate', { ...process.env, POSTGRES_PRISMA_URL: databaseUrl }, 120_000)
} else if (process.env.VERCEL) {
  throw new Error('Configure a database URL for this Vercel environment before deploying.')
} else {
  console.log('No database configured; skipping deployment migrations.')
}

await run('../../scripts/patch-next-polyfills.mjs')
await run('build')

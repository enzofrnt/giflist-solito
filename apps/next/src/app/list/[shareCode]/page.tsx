import { use } from 'react'
import PublicListClient from './PublicListClient'

export default function PublicListPage({ params }: { params: Promise<{ shareCode: string }> }) {
  const { shareCode } = use(params)
  
  return <PublicListClient shareCode={shareCode} />
}


import { NextResponse } from 'next/server'

const APP_ID = '35697BAZW4.com.enzofournet.giflist'

export function GET() {
  return NextResponse.json(
    {
      webcredentials: {
        apps: [APP_ID],
      },
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    },
  )
}

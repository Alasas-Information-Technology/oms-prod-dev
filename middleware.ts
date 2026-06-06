// Force Node.js runtime (required for MSSQL database access in middleware)
export const runtime = 'nodejs'

export { proxy as middleware } from './proxy'
export { config } from './proxy'

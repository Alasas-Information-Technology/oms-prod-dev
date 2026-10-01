import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/backend-proxy';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return proxyToBackend(request, '/api/v1/authorization/users');
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, '/api/v1/authorization/users');
}

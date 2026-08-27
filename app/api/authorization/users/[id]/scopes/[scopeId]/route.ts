import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/backend-proxy';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; scopeId: string }> }
) {
  const { id, scopeId } = await params;
  return proxyToBackend(
    request,
    `/api/v1/authorization/users/${id}/scopes/${scopeId}`
  );
}

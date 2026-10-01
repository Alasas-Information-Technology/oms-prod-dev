import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/backend-proxy';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  const { vendorId } = await params;
  return proxyToBackend(
    request,
    `/api/v1/authorization/vendor-users/vendors/${vendorId}/deactivate`
  );
}

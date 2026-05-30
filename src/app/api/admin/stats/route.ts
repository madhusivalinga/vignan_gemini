import { NextResponse } from 'next/server';
import { getApiStats } from '@/lib/aiMonitor';

export async function GET() {
  const stats = getApiStats();
  return NextResponse.json(stats);
}

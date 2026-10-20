import { env } from 'cloudflare:workers';
import { createTrainingApi } from '../../../../lib/training-core.mjs';
const handle = createTrainingApi();
export const dynamic = 'force-dynamic';
export async function GET(request: Request) { return handle(request, env); }
export async function POST(request: Request) { return handle(request, env); }

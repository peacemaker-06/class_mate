import { env } from 'cloudflare:workers';
import { AppError, failure, maintain, respond } from '../../../lib/server';
export async function POST(request:Request){try{const key=(env as unknown as Record<string,string>).SCHEDULER_SECRET;if(!key||request.headers.get('x-scheduler-secret')!==key)throw new AppError('Scheduler access denied.',403);return respond(await maintain());}catch(e){return failure(e);}}

import { env } from 'cloudflare:workers';
export function database(){ const db=(env as unknown as {DB:D1Database}).DB;if(!db)throw Error('Banco indisponível');return db; }
export function bucket(){const b=(env as unknown as {BUCKET:R2Bucket}).BUCKET;if(!b)throw Error('Arquivos indisponíveis');return b;}

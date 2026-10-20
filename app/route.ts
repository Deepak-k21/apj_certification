import pages from '../lib/legacy-pages.json';
export async function GET() { return new Response(pages['/'], {headers:{'Content-Type':'text/html; charset=utf-8'}}); }

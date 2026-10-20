import pages from '../../lib/legacy-pages.json';
export async function GET(request: Request) {
 const path=new URL(request.url).pathname.replace(/\/?$/,'/');
 const html=(pages as Record<string,string>)[path];
 return new Response(html||'Page not found',{status:html?200:404,headers:{'Content-Type':html?'text/html; charset=utf-8':'text/plain'}});
}

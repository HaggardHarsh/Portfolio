export function createAssetHandler(assets,securityHeaders){
 return {
  async fetch(request){
   const headers=new Headers(securityHeaders);
   if(!['GET','HEAD'].includes(request.method)){headers.set('Allow','GET, HEAD');return new Response('Method not allowed',{status:405,headers});}
   let path;
   try{path=decodeURIComponent(new URL(request.url).pathname);}catch{ return new Response('Bad request',{status:400,headers}); }
   if(path==='/')path='/index.html';
   const asset=Object.hasOwn(assets,path)?assets[path]:null;
   if(!asset){headers.set('Content-Type','text/plain; charset=utf-8');return new Response(request.method==='HEAD'?null:'Not found',{status:404,headers});}
   headers.set('Content-Type',asset.type);headers.set('ETag',asset.etag);
   headers.set('Cache-Control',/\/assets\/[^/]+-[\w-]{8}\.m?js$|\/assets\/[^/]+-[\w-]{8}\.css$/.test(path)?'public, max-age=31536000, immutable':'public, max-age=0, must-revalidate');
   if((request.headers.get('If-None-Match')||'').split(',').map(value=>value.trim()).some(value=>value===asset.etag||value==='*'))return new Response(null,{status:304,headers});
   headers.set('Content-Length',String(asset.size));
   if(request.method==='HEAD')return new Response(null,{headers});
   const binary=atob(asset.body),bytes=new Uint8Array(binary.length);
   for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
   return new Response(bytes,{headers});
  }
 };
}

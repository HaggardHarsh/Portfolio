import {createServer} from 'node:http';
import {pathToFileURL} from 'node:url';
const {default:worker}=await import(pathToFileURL(new URL('../dist/server/index.js',import.meta.url).pathname));
const port=Number(process.env.PORTFOLIO_PREVIEW_PORT||4176);
const server=createServer(async(request,response)=>{
 try{
  const result=await worker.fetch(new Request(`http://127.0.0.1:${port}${request.url}`,{method:request.method,headers:request.headers}));
  response.writeHead(result.status,Object.fromEntries(result.headers));
  response.end(request.method==='HEAD'?undefined:Buffer.from(await result.arrayBuffer()));
 }catch(error){response.writeHead(500,{'Content-Type':'text/plain'});response.end('Preview could not serve the request');console.error(error);}
});
server.listen(port,'127.0.0.1',()=>console.log(`Worker preview: http://127.0.0.1:${port}`));

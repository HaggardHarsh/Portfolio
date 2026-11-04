export const defaultSiteUrl='https://portfolio.example';
export const siteTitle='The Woodland Cabin · The Woodland Cabin';
export const siteDescription='The Woodland Cabin’s projects, notes, and tools, inside an interactive woodland cabin. Read the portfolio directly or explore in 3D and ASCII.';

export function normalizeSiteUrl(value=defaultSiteUrl){
 const url=new URL(value);
 if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw new Error('SITE_URL must be an HTTPS origin without a path, credentials, query or fragment.');
 return url.origin;
}

export const documentPolicy=[
 "default-src 'self'",
 "script-src 'self'",
 "script-src-attr 'none'",
 "style-src 'self'",
 "style-src-attr 'unsafe-inline'",
 "img-src 'self' data: blob:",
 "connect-src 'self' blob:",
 "font-src 'self'",
 "object-src 'none'",
 "base-uri 'none'",
 "form-action 'none'",
 "frame-src 'none'",
 "worker-src 'none'"
].join('; ');

export const securityHeaders={
 'Content-Security-Policy':`${documentPolicy}; frame-ancestors 'self' https://chatgpt.com`,
 'X-Content-Type-Options':'nosniff',
 'Referrer-Policy':'strict-origin-when-cross-origin',
 'Permissions-Policy':'camera=(), microphone=(), geolocation=()',
 'Strict-Transport-Security':'max-age=31536000'
};

export function headersFile(){
 return `/*\n${Object.entries(securityHeaders).map(([key,value])=>`  ${key}: ${value}`).join('\n')}\n\n/assets/*.js\n  Cache-Control: public, max-age=31536000, immutable\n\n/assets/*.css\n  Cache-Control: public, max-age=31536000, immutable\n`;
}

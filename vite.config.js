import {defineConfig,loadEnv} from 'vite';
import {documentPolicy,headersFile,normalizeSiteUrl,securityHeaders,siteTitle,siteDescription} from './config/launch.mjs';
import {readPublicContact,renderContactFallback} from './src/contact.js';

const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export default defineConfig(({command,mode})=>{
 const env=loadEnv(mode,process.cwd(),'SITE_'),url=normalizeSiteUrl(process.env.SITE_URL||env.SITE_URL);
 const contact=readPublicContact({...loadEnv(mode,process.cwd(),'VITE_'),...process.env});
 return {
  preview:{headers:securityHeaders},
  plugins:[{
   name:'portfolio-launch',
   transformIndexHtml(html){
    const policy=command==='build'?`<meta http-equiv="Content-Security-Policy" content="${escape(documentPolicy)}">`:'';
    return html.replace('<!-- public-contact -->',renderContactFallback(contact)).replace('<!-- security-policy -->',policy).replace('<!-- sharing-metadata -->',[
     '<meta name="referrer" content="strict-origin-when-cross-origin">',
     `<link rel="canonical" href="${escape(url)}/">`,
     '<meta property="og:type" content="website">',
     `<meta property="og:url" content="${escape(url)}/">`,
     '<meta property="og:site_name" content="The Woodland Cabin">',
     `<meta property="og:image" content="${escape(url)}/assets/social-preview.jpg">`,
     '<meta property="og:image:type" content="image/jpeg">',
     '<meta property="og:image:width" content="1200">',
     '<meta property="og:image:height" content="630">',
     '<meta property="og:image:alt" content="The Woodland Cabin’s woodland cabin portfolio, with a forest path and the visitor character.">',
     '<meta name="twitter:card" content="summary_large_image">',
     `<meta name="twitter:title" content="${escape(siteTitle)}">`,
     `<meta name="twitter:description" content="${escape(siteDescription)}">`,
     `<meta name="twitter:image" content="${escape(url)}/assets/social-preview.jpg">`
    ].join('\n'));
   },
   generateBundle(){
    this.emitFile({type:'asset',fileName:'_headers',source:headersFile()});
    this.emitFile({type:'asset',fileName:'robots.txt',source:`User-agent: *\nAllow: /\nSitemap: ${url}/sitemap.xml\n`});
    this.emitFile({type:'asset',fileName:'sitemap.xml',source:`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escape(url)}/</loc></url></urlset>\n`});
   }
  }]
 };
});

const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function readPublicContact(env={}){
 const name=String(env.VITE_PUBLIC_NAME||'').trim()||'The Woodland Cabin';
 const candidate=String(env.VITE_CONTACT_EMAIL||'').trim();
 const email=/^[A-Z0-9._+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(candidate)?candidate:'';
 let linkedin='';
 try{
  const url=new URL(String(env.VITE_LINKEDIN_URL||''));
  if(url.protocol==='https:'&&!url.username&&!url.password&&['linkedin.com','www.linkedin.com'].includes(url.hostname)&&/^\/in\/[^/]+\/?$/.test(url.pathname)){
   url.search='';url.hash='';linkedin=url.href;
  }
 }catch{}
 return {name,email,linkedin};
}

export function renderContactCard(contact){
 if(!contact.email&&!contact.linkedin)return '<div class="contact-empty"><p>No contact details are listed yet.</p><a href="#projects">Read the projects</a></div>';
 return `<div class="calling-card"><div class="card-heading"><p class="card-owner">${escape(contact.name)}</p></div><p class="card-message">Have a question about a project? Send me a note.</p>${contact.email?`<a class="card-email" href="mailto:${escape(contact.email)}"><span class="contact-label">Write by email</span><span>${escape(contact.email)}</span></a>`:''}<div class="card-bottom"><span>From the woodland cabin</span><span>Direct correspondence</span></div></div>${contact.linkedin?`<div class="correspondence-links"><a class="correspondence-link" href="${escape(contact.linkedin)}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile (opens in a new tab)"><span><small>Profile & conversation</small>LinkedIn</span><span aria-hidden="true">↗</span></a></div>`:''}`;
}

export function renderContactFallback(contact){
 if(!contact.email&&!contact.linkedin)return '<p>No contact details are listed yet.</p>';
 return `<p>${escape(contact.name)}</p>${contact.email?`<p><a href="mailto:${escape(contact.email)}">${escape(contact.email)}</a></p>`:''}${contact.linkedin?`<p><a href="${escape(contact.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn profile (opens in a new tab)</a></p>`:''}`;
}

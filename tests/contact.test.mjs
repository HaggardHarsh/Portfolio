import test from 'node:test';
import assert from 'node:assert/strict';
import {readPublicContact,renderContactCard,renderContactFallback} from '../src/contact.js';
import {renderPanel} from '../src/panels.js';

const fixture={VITE_PUBLIC_NAME:'Cabin Builder',VITE_CONTACT_EMAIL:'builder@example.invalid',VITE_LINKEDIN_URL:'https://www.linkedin.com/in/example-profile/'};

test('contact details are opt-in build values shared by the card and the no-JavaScript view',()=>{
 const contact=readPublicContact(fixture);
 for(const html of [renderContactCard(contact),renderContactFallback(contact),renderPanel('contact',contact)]){
  assert.match(html,/Cabin Builder/);
  assert.match(html,/href="mailto:builder@example.invalid"/);
  assert.match(html,/href="https:\/\/www.linkedin.com\/in\/example-profile\/"/);
  assert.match(html,/rel="noopener noreferrer"/);
  assert.ok(!html.includes('not published'));
 }
 assert.equal(readPublicContact().email,'');
 assert.equal(readPublicContact().linkedin,'');
 assert.ok(!renderContactCard(readPublicContact()).includes('mailto:'));
});

test('invalid addresses and unsafe profile destinations never become contact links',()=>{
 for(const email of ['builder@example.invalid?bcc=other@example.invalid','builder@example.invalid\r\nBcc: other@example.invalid','not-an-address'])assert.equal(readPublicContact({...fixture,VITE_CONTACT_EMAIL:email}).email,'');
 for(const linkedin of ['javascript:alert(1)','https://linkedin.com.evil.invalid/in/profile','https://user:password@www.linkedin.com/in/profile','http://www.linkedin.com/in/profile','https://www.linkedin.com/feed/'])assert.equal(readPublicContact({...fixture,VITE_LINKEDIN_URL:linkedin}).linkedin,'');
 assert.equal(readPublicContact({...fixture,VITE_LINKEDIN_URL:fixture.VITE_LINKEDIN_URL+'?tracking=discarded#fragment'}).linkedin,fixture.VITE_LINKEDIN_URL);
 const html=renderContactCard(readPublicContact({...fixture,VITE_PUBLIC_NAME:'<img src=x onerror=alert(1)>'}));
 assert.ok(html.includes('&lt;img'));
 assert.ok(!html.includes('<img src=x'));
});

test('partial contact settings render only the configured destinations',()=>{
 const email=renderContactCard(readPublicContact({VITE_CONTACT_EMAIL:fixture.VITE_CONTACT_EMAIL}));
 assert.match(email,/class="card-email"/);assert.ok(!email.includes('correspondence-link'));
 const linkedin=renderContactCard(readPublicContact({VITE_LINKEDIN_URL:fixture.VITE_LINKEDIN_URL}));
 assert.match(linkedin,/class="correspondence-link"/);assert.ok(!linkedin.includes('mailto:'));
});

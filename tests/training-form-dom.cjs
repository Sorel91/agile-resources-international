const {parseHTML}=require('linkedom');
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function load(route){
 const {window,document}=parseHTML('<!doctype html><html><head><meta name="description"></head><body><div id="app"></div></body></html>');
 window.location={pathname:route};window.matchMedia=()=>({matches:true});
 window.ARI_ADMIN_SETTINGS={images:{}};
 const original=document.createElement.bind(document);
 document.createElement=(tag,...args)=>{
   const el=original(tag,...args);
   if(tag==='dialog'){
     el.showModal=()=>el.setAttribute('open','');
     el.close=()=>{el.removeAttribute('open');el.dispatchEvent(new window.Event('close'))};
   }
   return el;
 };
 let posts=0;
 const fetch=async (url,options={})=>{
   if(options.method==='POST'){posts++;return {ok:true,json:async()=>({ok:true})};}
   return {ok:true,json:async()=>({csrf:'test-token',event:{event_date:'2026-11-21',start_time:'',location:''}})};
 };
 class FormData {constructor(form){this.values=Object.fromEntries([...form.querySelectorAll('[name]')].map(x=>[x.name,x.value]));}}
 const context=vm.createContext({window,document,NodeFilter:{SHOW_TEXT:4},console,Intl,fetch,FormData,URLSearchParams});
 vm.runInContext(fs.readFileSync(root+'/assets/site.js','utf8'),context);
 const prototype=window.HTMLElement.prototype;
 Object.defineProperty(prototype,'elements',{configurable:true,get(){return Object.fromEntries([...this.querySelectorAll('[name]')].map(x=>[x.name,x]));}});
 prototype.reportValidity=()=>true;
 vm.runInContext(fs.readFileSync(root+'/assets/workshop-registration.js','utf8'),context);
 const click=s=>{const el=document.querySelector(s);assert(el,s);el.dispatchEvent(new window.Event('click',{bubbles:true}));};
 return {window,document,click,posts:()=>posts};
}
(async()=>{
 let app=load('/'),d=app.document;
 assert.equal(d.querySelectorAll('[data-registration-open]').length,1);
 assert.equal(d.querySelectorAll('.workshop-topics li').length,3);
 assert(d.querySelector('.workshop-places').textContent.includes('30'));
 assert.equal(d.querySelector('dialog').hasAttribute('open'),false);
 app.click('[data-registration-open]');await tick();await tick();
 assert.equal(d.querySelector('dialog').hasAttribute('open'),true);
 const form=d.querySelector('.registration-dialog form');
 for(const key of ['last_name','first_name','email','city','residence_country','education_domain']){
   assert(form.elements[key],key);assert(form.elements[key].hasAttribute('required'),key);
 }
 assert(!form.elements.phone,'No unrequested phone field');
 assert.equal(form.elements.csrf.value,'test-token');
 assert(form.elements.cv.getAttribute('accept').includes('pdf'));
 assert.equal(form.elements.cv.hasAttribute('required'),true);
 Object.defineProperty(form.elements.cv,'files',{configurable:true,value:[{name:'large.pdf',size:6*1024*1024}]});
 form.dispatchEvent(new app.window.Event('submit',{cancelable:true}));await tick();
 assert.equal(app.posts(),0);
 assert(d.querySelector('.registration-feedback').textContent.includes('5 Mo'));
 Object.defineProperty(form.elements.cv,'files',{configurable:true,value:[]});
 form.dispatchEvent(new app.window.Event('submit',{cancelable:true}));await tick();await tick();
 assert.equal(app.posts(),0);
 assert(d.querySelector('.registration-feedback').textContent.includes('joindre votre CV'));
 Object.defineProperty(form.elements.cv,'files',{configurable:true,value:[{name:'cv.pdf',size:1000}]});
 form.dispatchEvent(new app.window.Event('submit',{cancelable:true}));await tick();await tick();
 assert.equal(app.posts(),1);assert.equal(form.hidden,true);assert.equal(d.querySelector('.registration-success').hidden,false);
 app.click('[data-registration-done]');assert.equal(d.querySelector('dialog').hasAttribute('open'),false);
 app=load('/en');d=app.document;
 assert(d.querySelector('[data-registration-open]').textContent.includes('Register'));
 app.click('[data-registration-open]');await tick();await tick();
 assert(d.querySelector('#registration-title').textContent.includes('free workshop'));
 assert.equal(d.querySelector('.registration-dialog form').elements.lang.value,'en');
 app=load('/candidats');assert.equal(app.document.querySelector('dialog.registration-dialog'),null);
 console.log('Public form DOM checks passed: FR/EN CTA, required fields, required CV, size errors, confirmation and dialog closure.');
})().catch(error=>{console.error(error);process.exit(1)});

// No offline caching of private team data. Only Web Push and account-bound badge state.
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
let accountOperations=Promise.resolve();
function serial(fn){const next=accountOperations.catch(()=>{}).then(fn);accountOperations=next;return next;}
function stateDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open('weingut-push-account',1);r.onupgradeneeded=()=>r.result.createObjectStore('state');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function userState(value,write=false){const db=await stateDB();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('state',write?'readwrite':'readonly');const store=tx.objectStore('state'),r=write?store.put(value,'user'):store.get('user');let result;r.onsuccess=()=>{result=r.result;};tx.oncomplete=()=>resolve(write?value:result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}finally{db.close();}}
async function badge(n){try{if(self.navigator.setAppBadge){if(n>0)await self.navigator.setAppBadge(n);else await self.navigator.clearAppBadge();}}catch{}}
self.addEventListener('message',event=>{if(event.data?.type!=='WG_USER')return;event.waitUntil(serial(async()=>{await userState(event.data.userId||null,true);if(!event.data.userId){await badge(0);for(const n of await self.registration.getNotifications())n.close();}event.ports[0]?.postMessage({ok:true});}));});
self.addEventListener('push',event=>event.waitUntil(serial(async()=>{
 let p;try{p=event.data?.json();}catch{return;}
 const uid=await userState();if(!uid||uid!==p?.userId)return;
 const id=typeof p.id==='string'&&/^[0-9a-f-]{36}$/i.test(p.id)?p.id:'';if(!id)return;
 await self.registration.showNotification(String(p.title||'Weingut'),{body:String(p.body||''),icon:new URL('weingut-logo.png',self.registration.scope).href,tag:'wg-'+id,data:{id,userId:uid}});
 await badge(Math.max(0,Number(p.badge)||0));
 for(const c of await self.clients.matchAll({type:'window',includeUncontrolled:true}))if(c.url.startsWith(self.registration.scope))c.postMessage({type:'WG_REFRESH'});
})));
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil(serial(async()=>{
 const uid=await userState();if(!uid||uid!==event.notification.data?.userId)return;
 const id=event.notification.data.id;if(!/^[0-9a-f-]{36}$/i.test(id))return;
 const url=new URL('./',self.registration.scope);url.searchParams.set('hinweis',id);
 for(const client of await self.clients.matchAll({type:'window',includeUncontrolled:true})){if(client.url.startsWith(self.registration.scope)){await client.navigate(url.href);await client.focus();return;}}
 await self.clients.openWindow(url.href);
}));});

/* Gemeinsame Installationshilfe. Keine Änderungen an Anmeldung, Daten oder Service Workern. */
(()=>{
'use strict';
const script=document.currentScript,appName=script?.dataset.appName||'Diese App';
const mq=window.matchMedia('(display-mode: standalone)'),fullscreen=window.matchMedia('(display-mode: fullscreen)');
const installed=()=>mq.matches||fullscreen.matches||navigator.standalone===true;
const key='app-install-hint-v1:'+new URL('.',location.href).pathname;
let promptEvent=null,busy=false,dismissed=false;
try{dismissed=sessionStorage.getItem(key)==='1'}catch{}
const style=document.createElement('style');style.textContent=`.install-app-v1{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:900;display:flex;align-items:center;gap:8px;flex-wrap:wrap;max-width:min(420px,calc(100vw - 32px));padding:12px;background:#fffdf8;color:#362c3e;border:1px solid #d8ccd9;border-radius:14px;box-shadow:0 6px 28px #30203b24;font:14px/1.4 system-ui,-apple-system,sans-serif}.install-app-v1[hidden]{display:none!important}.install-app-v1 strong{flex:1 1 100%;font-size:14px}.install-app-v1 button{font:600 13px/1.4 system-ui,-apple-system,sans-serif;min-height:40px;border-radius:8px;border:1px solid #d8ccd9;padding:8px 12px;cursor:pointer;background:#fffdf8;color:#493251}.install-app-v1 button:first-of-type{background:#583766;border-color:#583766;color:white}.install-app-v1 button:focus-visible{outline:3px solid #ad91bc;outline-offset:2px}.install-guide-v1{background:#fffdf8;color:#362c3e;border:1px solid #d8ccd9;border-radius:16px;padding:22px;width:min(440px,calc(100vw - 32px));font:16px/1.5 system-ui,-apple-system,sans-serif}.install-guide-v1::backdrop{background:#20162788}.install-guide-v1 h2{margin:0 0 14px;font-size:22px}.install-guide-v1 button{min-height:44px;padding:8px 16px;border:1px solid #d8ccd9;border-radius:9px;background:#fffdf8;color:#493251;font:inherit}@media print{.install-app-v1,.install-guide-v1{display:none!important}}`;
document.head.append(style);
const box=document.createElement('aside');box.className='install-app-v1';box.setAttribute('aria-label','App installieren');box.hidden=true;
const title=document.createElement('strong');title.textContent=appName+' als eigene App';
const install=document.createElement('button');install.type='button';install.textContent='App installieren';
const later=document.createElement('button');later.type='button';later.textContent='Später';
box.append(title,install,later);document.body.append(box);
function show(){box.hidden=installed()||dismissed}
function dismiss(){dismissed=true;box.hidden=true;try{sessionStorage.setItem(key,'1')}catch{}}
later.onclick=dismiss;
function guide(){let dialog=document.querySelector('.install-guide-v1');if(!dialog){dialog=document.createElement('dialog');dialog.className='install-guide-v1';const heading=document.createElement('h2');heading.textContent=appName+' installieren';dialog.append(heading);const text=document.createElement('p');const isApple=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);text.textContent=isApple?'Öffne diese App in Safari. Tippe auf Teilen und anschließend auf „Zum Home-Bildschirm“. Danach kannst du sie über ihr eigenes Symbol öffnen.':'Öffne das Menü deines Browsers und wähle „App installieren“ oder „Diese Seite als App installieren“. Wenn keine Installation angeboten wird, verwende Chrome oder Edge. Auf dem Mac ist in Safari auch „Zum Dock hinzufügen“ möglich.';dialog.append(text);const close=document.createElement('button');close.type='button';close.textContent='Schließen';close.onclick=()=>dialog.close();dialog.append(close);document.body.append(dialog)}dialog.showModal()}
install.onclick=async()=>{if(busy)return;if(!promptEvent){guide();return}busy=true;install.disabled=true;const event=promptEvent;promptEvent=null;try{await event.prompt();const result=await event.userChoice;if(result?.outcome==='accepted'){box.hidden=true}else dismiss()}catch{guide()}finally{busy=false;install.disabled=false}};
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();promptEvent=event;dismissed=false;install.textContent='App installieren';show()});
window.addEventListener('appinstalled',()=>{promptEvent=null;box.hidden=true});
mq.addEventListener?.('change',show);fullscreen.addEventListener?.('change',show);
const isApple=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
if(isApple){install.textContent='Zum Home-Bildschirm';show()}else if(!installed()){
 // Kleine, wegklickbare Hilfe auch wenn der Browser keinen Installationsdialog anbietet.
 install.textContent='App installieren';show();
}
})();

(function(){
"use strict";
let active=null;
function close(){if(!active)return;const {panel,trigger}=active;active=null;panel.hidden=true;panel.style.display="none";trigger.setAttribute("aria-expanded","false");if(trigger.isConnected){trigger.focus({preventScroll:true});trigger.scrollIntoView({block:"nearest"})}}
function toggle(panel,trigger,lang){
 if(active&&active.panel===panel&&!panel.hidden){close();return false}
 close();active={panel,trigger};panel.hidden=false;panel.style.display="";trigger.setAttribute("aria-expanded","true");return true
}
function header(panel,lang){const b=document.createElement("button");b.type="button";b.className="btn";b.textContent=lang==="ar"?"✕ خروج إلى التصميم":"✕ Exit AI assistant — back to design";b.style.cssText="display:block;margin:0 0 12px auto";b.onclick=close;panel.prepend(b)}
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&active&&active.panel.isConnected){e.preventDefault();close()}});
window.LDSAINav={toggle,header,close};
})();
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
let chatTab=null;
function openChatGPT(){
 try{if(chatTab&&!chatTab.closed){chatTab.focus();return true}}catch{}
 // Keep the handle when browser isolation permits; detach the opener before navigation.
 const tab=window.open("about:blank","lds-chatgpt");
 if(!tab){alert("Please allow pop-ups for Learning Design Studio, or open ChatGPT manually.");return false}
 try{tab.opener=null;tab.location.replace("https://chatgpt.com/");tab.focus();chatTab=tab;return true}catch{chatTab=null;return false}
}
document.addEventListener("click",e=>{
 const a=e.target.closest?.("a[href]");
 if(!a||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
 if(a.href!=="https://chatgpt.com/")return;
 e.preventDefault();openChatGPT();
});
window.LDSAINav={toggle,header,close,openChatGPT};
})();
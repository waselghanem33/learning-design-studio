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
// ChatGPT is opened only by explicit links; prompt copying never opens a tab.
window.LDSAINav={toggle,header,close};
function optimize(source,kind){
 let lines=source.split("\n");
 lines=lines.map(line=>{
 const prefix="Full ordered activity sequence (excluding attachment file data): ";
 if(!line.startsWith(prefix))return line;
 try{const seq=JSON.parse(line.slice(prefix.length));return "Ordered activity sequence: "+JSON.stringify(seq.map(a=>({title:a.title,phase:a.phase,type:a.type,minutes:a.minutes}))) }catch{return line}
 });
 if(kind==="problem")lines=lines.filter(x=>!x.startsWith("Authentic problem: ")&&!x.startsWith("Ordered activity sequence: "));
 if(kind==="outcomes")lines=lines.filter(x=>!x.startsWith("Learning outcomes: "));
 if(kind==="review")lines=lines.filter(x=>!x.startsWith("Session minutes: "));
 if(kind==="resource")lines=lines.map(x=>x.startsWith("If your ChatGPT environment can create files,")?"Create and attach the actual requested file if supported; otherwise return complete source (Markdown for PDF/Word fallback, standalone HTML for HTML). Never claim a nonexistent file.":x.startsWith("When writing technical resources,")?"":x);
 if(kind==="coach")lines=lines.filter((x,i)=>x.trim()||i===0);
 return lines.filter(x=>x.trim()).join("\n");
}
function attach(area,lang,kind,source){
 const t=(en,ar)=>lang==="ar"?ar:en;
 const row=document.createElement("div");row.className="field";
 const label=document.createElement("label");label.textContent=t("Prompt detail","تفاصيل الطلب");
 const select=document.createElement("select");select.setAttribute("aria-label",label.textContent);
 for(const [v,n] of [["optimized",t("Optimized","مختصر")],["full",t("Comprehensive","شامل")]]){const o=document.createElement("option");o.value=v;o.textContent=n;select.appendChild(o)}
 // Comprehensive is the safe default until comparative pedagogical testing is complete.
 select.value="full";
 const counter=document.createElement("small");counter.className="muted";counter.setAttribute("aria-live","polite");
 row.append(label,select,counter);area.before(row);area.readOnly=false;
 let full=source(),last=area.value;
 const count=()=>{const chars=Array.from(area.value).length;const estimate=Math.ceil(chars/(lang==="ar"?2:4));counter.textContent=t("Approx. tokens: ","الرموز التقريبية: ")+estimate+" · "+chars+t(" characters"," حرفاً")};
 const refresh=()=>{full=source();area.value=select.value==="optimized"?optimize(full,kind):full;last=area.value;count()};
 select.onchange=()=>{if(area.value!==last&&!confirm(t("Replace your edited prompt with the selected version?","استبدال الطلب المعدل بالنسخة المحددة؟"))){select.value=select.value==="full"?"optimized":"full";return}refresh()};
 area.addEventListener("input",count);refresh();return {refresh,mode:()=>select.value};
}
window.LDSPrompts={optimize,attach};
})();
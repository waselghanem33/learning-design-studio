"use strict";
(function(){
const STORE="lds-v16-evidence";
const $=id=>document.getElementById(id);
const tr=(en,ar)=>document.documentElement.lang==="ar"?ar:en;
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))||f}catch{return f}};
const save=(v)=>localStorage.setItem(STORE,JSON.stringify(v));
const getDesign=()=>read("lds-design",{});
const os=d=>String(d.outcomes||"").split(/\r?\n|;|؛/).map(s=>s.trim()).filter(Boolean);
const acts=d=>Array.isArray(d.activities)?d.activities:[];
const ok=(o,i)=>i+"|"+o,ak=(a,i)=>i+"|"+String(a.title||"");
const bk=(d,o,i)=>String(d.module||"")+"::"+ok(o,i);
const Bloom=["remember","understand","apply","analyze","evaluate","create"];
const types=["Acquisition","Inquiry","Discussion","Practice","Collaboration","Production"];
const defaultEvidence=()=>({evidence:{},rationale:{},reviewed:{}});
let data=read(STORE,defaultEvidence());
for(const k of ["evidence","rationale","reviewed"])if(!data[k]||typeof data[k]!=="object")data[k]={};
const id=(d,o,i)=>bk(d,o,i);
const quality=(a,level)=>{
 const ty=String(a.type||"");
 if(!level)return null;
 const hints={
  remember:["Acquisition","Practice"],
  understand:["Acquisition","Discussion","Practice"],
  apply:["Practice","Production","Collaboration"],
  analyze:["Inquiry","Discussion","Practice","Collaboration","Production"],
  evaluate:["Discussion","Inquiry","Collaboration","Production"],
  create:["Production","Collaboration","Practice"]
 };
 return (hints[level]||[]).includes(ty);
};
function audit(d,links,bloom){
 const results=[];
 os(d).forEach((o,i)=>{
  const k=id(d,o,i),level=bloom[k]||"", linked=acts(d).filter((a,j)=>(links[ak(a,j)]||[]).includes(ok(o,i)));
  const assessed=linked.filter(a=>String(a.assessment||"").trim());
  const support=linked.filter(a=>quality(a,level)===true);
  const issues=[];
  if(!level)issues.push(tr("Choose a Bloom level; no level was inferred.","حدد مستوى بلوم؛ لم يُستنتج المستوى تلقائياً."));
  if(!linked.length)issues.push(tr("No activities linked to this outcome.","لا توجد أنشطة مرتبطة بهذا المخرج."));
  if(level&&linked.length&&!support.length)issues.push(tr("Linked learning types may offer limited practice at the selected Bloom level; inspect the actual tasks.","قد لا توفر أنواع التعلم المرتبطة تدريباً كافياً على مستوى بلوم المختار؛ راجع طبيعة المهام."));
  if(!assessed.length)issues.push(tr("No linked activity describes assessment or feedback.","لا يصف أي نشاط مرتبط التقييم أو التغذية الراجعة."));
  if(!String(data.evidence[k]||"").trim())issues.push(tr("Specify what student work will demonstrate achievement.","حدد العمل الطلابي الذي سيبرهن تحقق المخرج."));
  return results.push({k,level,linked,assessed,issues});
 });
 return results;
}
function exportReport(d,results){
 const lines=["# Constructive Alignment Review / مراجعة المواءمة البنائية","","Module / الوحدة: "+(d.module||""),"","This is an instructor-guided heuristic review, not a validated quality score.","هذه مراجعة استرشادية يقودها المدرس وليست درجة جودة مقننة.",""];
 results.forEach((r,i)=>{lines.push("## LO"+(i+1)+" — "+os(d)[i],"Bloom: "+(r.level||"Not assigned"),"Linked activities: "+r.linked.map(a=>a.title).join("; "),"Assessment descriptions: "+r.assessed.map(a=>a.assessment).join("; "),"Student evidence: "+(data.evidence[r.k]||""),"Instructor rationale: "+(data.rationale[r.k]||""),"Reviewed: "+(data.reviewed[r.k]?"Yes":"No"),"Questions: "+(r.issues.length?r.issues.join(" | "):"No heuristic flags"),"")});
 return lines.join("\n");
}
function download(s){
 const url=URL.createObjectURL(new Blob([s],{type:"text/markdown;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download="constructive-alignment-review-v1.6.md";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function inject(){
 const root=$("alignment-root");if(!root||root.querySelector("#v16-review"))return;
 const d=getDesign(),oset=os(d),as=acts(d),state=read("lds-v15-align",{links:{},bloom:{}}),links=state.links||{},bloom=state.bloom||{};
 const results=audit(d,links,bloom);
 const section=document.createElement("section");section.id="v16-review";section.className="card al-section v16-section";
 const cards=results.map((r,i)=>{
 const o=oset[i],bloomText=r.level? r.level[0].toUpperCase()+r.level.slice(1):tr("Not assigned","لم يُحدد");
 const options=r.linked.map(a=>'<li><strong>'+esc(a.title||"")+'</strong> · '+esc(a.type||"")+' · '+tr("Assessment","التقييم")+': '+esc(a.assessment||tr("Not described","غير موصوف"))+'</li>').join("");
 return '<article class="v16-outcome"><div class="v16-head"><h3>LO'+(i+1)+': '+esc(o)+'</h3><span>'+tr("Bloom","بلوم")+': '+esc(bloomText)+'</span></div>'+
 '<p class="v16-muted">'+tr("Linked activities","الأنشطة المرتبطة")+': '+r.linked.length+' · '+tr("With assessment descriptions","مع وصف للتقييم")+': '+r.assessed.length+'</p>'+
 (options?'<ul>'+options+'</ul>':'<p>'+tr("No linked activities yet. Return to the matrix to connect them.","لا توجد أنشطة مرتبطة. عد إلى المصفوفة لربطها.")+'</p>')+
 '<div class="v16-prompts">'+(r.issues.length?r.issues.map(x=>'<p>• '+esc(x)+'</p>').join(""):'<p>'+tr("No heuristic flags; verify the quality of the student task and assessment.","لا توجد تنبيهات استرشادية؛ تحقق من جودة المهمة والتقييم.")+'</p>')+'</div>'+
 '<label for="v16-e-'+i+'">'+tr("Observable student evidence (e.g. design, justification, rubric criteria)","دليل تعلم قابل للملاحظة (مثل تصميم أو تبرير أو معايير تقدير)")+'</label>'+
 '<textarea id="v16-e-'+i+'" data-v16-kind="evidence" data-v16-i="'+i+'" rows="2" placeholder="'+esc(tr("What will students produce or demonstrate?","ماذا سينتج الطلبة أو يبرهنون؟"))+'">'+esc(data.evidence[r.k]||"")+'</textarea>'+
 '<label for="v16-r-'+i+'">'+tr("Instructor justification / adjustment","تبرير المدرس أو التعديل المقترح")+'</label>'+
 '<textarea id="v16-r-'+i+'" data-v16-kind="rationale" data-v16-i="'+i+'" rows="2">'+esc(data.rationale[r.k]||"")+'</textarea>'+
 '<label class="v16-confirm"><input type="checkbox" data-v16-kind="reviewed" data-v16-i="'+i+'" '+(data.reviewed[r.k]?"checked":"")+'> '+tr("I reviewed the outcome–activity–assessment relationship.","راجعت علاقة المخرج بالنشاط والتقييم.")+'</label></article>';
 }).join("");
 section.innerHTML='<div class="v16-intro"><small>'+tr("New in v1.6","الجديد في الإصدار 1.6")+'</small><h2>'+tr("Constructive Alignment Review","مراجعة المواءمة البنائية")+'</h2><p>'+tr("Examine the relationship between the selected Bloom level, the learning task and observable assessment evidence. Suggestions are heuristic prompts, not automatic grades.","راجع العلاقة بين مستوى بلوم المختار ومهمة التعلم وأدلة التقييم القابلة للملاحظة. التنبيهات أسئلة استرشادية وليست درجات آلية.")+'</p></div>'+
 (results.length?cards:'<p>'+tr("Add learning outcomes in the Design Laboratory to begin.","أضف مخرجات تعلم في مختبر التصميم للبدء.")+'</p>')+
 '<div class="al-actions"><button class="btn primary" id="v16-export">'+tr("Export pedagogical review","تصدير المراجعة التربوية")+'</button><button class="btn" id="v16-refresh">'+tr("Refresh analysis","تحديث التحليل")+'</button></div><p class="v16-muted">'+tr("Your notes are stored in this browser. No AI service is contacted.","تُحفظ ملاحظاتك في هذا المتصفح ولا يتم الاتصال بخدمة ذكاء اصطناعي.")+'</p>';
 const target=root.querySelector(".al-section");if(target)target.insertAdjacentElement("afterend",section);else root.append(section);
 section.querySelectorAll("[data-v16-kind]").forEach(input=>{
 const i=Number(input.dataset.v16I),kind=input.dataset.v16Kind,k=results[i].k;
 const handler=()=>{data[kind][k]=kind==="reviewed"?input.checked:input.value;save(data)};
 input.addEventListener(kind==="reviewed"?"change":"input",handler);
 });
 $("v16-export").onclick=()=>download(exportReport(d,audit(d,read("lds-v15-align",{links:{}}).links||{},read("lds-v15-align",{bloom:{}}).bloom||{})));
 $("v16-refresh").onclick=()=>{section.remove();inject()};
}
window.LDSV16Inject=inject;
const old=window.LDSAlignment;
if(!old||typeof old.render!=="function")return;
const base=old.render.bind(old);
old.render=function(){base();inject()};
old.version="1.6.0";
})();
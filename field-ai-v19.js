/* Learning Design Studio v2.1 — hybrid direct AI and ChatGPT fallback. */
(function(){
"use strict";
const names={course:["Course","المساق"],module:["Module title","عنوان الوحدة"],discipline:["Discipline","التخصص"],problem:["Authentic problem","المشكلة الواقعية"],outcomes:["Learning outcomes","مخرجات التعلم"],duration:["Planned duration","المدة المخططة"],title:["Activity title","عنوان النشاط"],phase:["Activity phase","مرحلة النشاط"],type:["Learning type","نوع التعلم"],minutes:["Activity duration","مدة النشاط"],group:["Group size","حجم المجموعة"],mode:["Delivery mode","نمط التدريس"],teacher:["Teacher role","دور المعلم"],assessment:["Assessment and formative feedback","التقييم والتغذية الراجعة"]};
const choose=(lang,en,ar)=>lang==="ar"?ar:en;
const priority=new Set(["problem","outcomes","assessment"]);
const optional=new Set();
const hidden=new Set(["course","module","discipline","duration","title","phase","type","minutes","group","mode","teacher"]);
const labelFor=(key,lang)=>({problem:["Improve problem","تحسين المشكلة"],outcomes:["Improve outcomes","تحسين المخرجات"],type:["Recommend learning type","اقتراح نوع التعلم"],teacher:["Suggest teacher role","اقتراح دور المعلم"],assessment:["Design assessment","تصميم التقييم"],module:["Suggest title","اقتراح عنوان"],title:["Suggest title","اقتراح عنوان"],phase:["Suggest phase","اقتراح المرحلة"],minutes:["Suggest duration","اقتراح المدة"],group:["Suggest grouping","اقتراح المجموعات"],mode:["Suggest delivery","اقتراح النمط"],duration:["Review duration","مراجعة المدة"]}[key]||["AI Assist","مساعدة الذكاء الاصطناعي"])[lang==="ar"?1:0];
const safe=s=>String(s??"");
const guidance={
 course:"Suggest concise university course titles and rationale.",module:"Propose an engaging, appropriately scoped module title.",discipline:"Identify suitable disciplinary framing without changing the professor's discipline without approval.",problem:"Create an authentic, feasible real-world challenge with stakeholders and constraints.",outcomes:"Write 2–4 measurable, observable outcomes aligned with Bloom's taxonomy and the authentic problem.",duration:"Assess whether planned duration is feasible and suggest a number of minutes with justification.",title:"Propose a short action-oriented activity title.",phase:"Recommend before, during or after, and explain the sequencing rationale.",type:"Choose among Acquisition, Inquiry, Discussion, Practice, Collaboration, Production; explain the learning mechanism and alignment.",minutes:"Recommend a realistic positive number of minutes, considering the full session.",group:"Recommend individual, pair or small group participation with justification.",mode:"Recommend a feasible face-to-face, online or blended implementation with accessibility alternatives.",teacher:"Describe teacher presence, facilitation, scaffolding and feedback actions.",assessment:"Design authentic formative assessment, observable evidence, success criteria, feedback prompts and revision opportunity. Include a short rubric or checklist where useful."
};
function buildPrompt(d,a,key,lang){
 const isAssessment=key==="assessment";
 return [
 "Act as an expert university instructional designer using UCL's six learning types. Respond in "+(lang==="ar"?"Arabic":"English")+".",
 "Task: "+guidance[key],
 "Course: "+safe(d.course),"Module: "+safe(d.module),"Discipline: "+safe(d.discipline),
 "Authentic problem: "+safe(d.problem),"Learning outcomes: "+safe(d.outcomes),
 "Planned duration: "+safe(d.duration)+" minutes",
 a?"Activity: "+safe(a.title)+" | Type: "+safe(a.type)+" | Phase: "+safe(a.phase)+" | Minutes: "+safe(a.minutes)+" | Group: "+safe(a.group)+" | Mode: "+safe(a.mode):"Whole-module design field.",
 a?"Teacher role: "+safe(a.teacher)+" | Resources: "+safe(a.resource)+" | Assessment: "+safe(a.assessment):"",
 "Target field: "+(names[key]||[key])[0],"Current value: "+safe(a?a[key]:d[key]),
 "Return: (1) a recommended value ready to paste into this field, without a heading; (2) a concise pedagogical rationale; (3) a caution or alternative where appropriate.",
 isAssessment?"For formative feedback, include assessment method, evidence of learning, 2–4 success criteria, teacher/peer feedback, and student revision opportunity. Ensure feasibility within activity duration.":"",
 "Keep the suggested field value distinct from your explanation so the professor can copy only the value.",
 "Do not invent citations, links or verified source claims. Avoid student-identifying information. The professor will review all suggestions before inserting."
 ].filter(Boolean).join("\n");
}
function mount(d,lang){
 document.querySelectorAll("[data-field], [data-act]").forEach(el=>{
  const key=el.dataset.field||el.dataset.prop;
  if(!names[key]||hidden.has(key)||el.dataset.aiFieldMounted) return;
  el.dataset.aiFieldMounted="yes";
  const i=el.hasAttribute("data-act")?Number(el.dataset.act):null;
  const parent=el.closest(".field");if(!parent)return;
  const btn=document.createElement("button");btn.type="button";btn.className="btn";btn.classList.add("lds-context-ai");btn.classList.toggle("lds-context-ai-secondary",optional.has(key));btn.textContent="✨ "+labelFor(key,lang);
  const label=parent.querySelector("label");if(label&&key!=="assessment"){const heading=document.createElement("div");heading.className="lds-field-heading";label.parentNode.insertBefore(heading,label);heading.appendChild(label);heading.appendChild(btn);}else parent.appendChild(btn);
  const panel=document.createElement("div");panel.hidden=true;panel.className="card lds-field-ai-panel";parent.insertAdjacentElement("afterend",panel);
  btn.addEventListener("click",()=>{
   if(!window.LDSAINav.toggle(panel,btn,lang))return;
   const a=i===null?null:d.activities[i];
   panel.replaceChildren();window.LDSAINav.header(panel,lang);
   const title=document.createElement("h3");title.textContent=choose(lang,"AI Design Assistant — ","مساعد التصميم — ")+(names[key][lang==="ar"?1:0]);panel.appendChild(title);
   const intro=document.createElement("p");intro.textContent=choose(lang,"Copy the tailored prompt into ChatGPT. Review the response, then paste only the field value below.","انسخ الطلب إلى ChatGPT، وراجع الاستجابة، ثم الصق قيمة الحقل فقط أدناه.");panel.appendChild(intro);
   const p=document.createElement("textarea");p.rows=8;p.value=buildPrompt(d,a,key,lang);p.setAttribute("aria-label","Editable AI prompt");panel.appendChild(p);
   const actions=document.createElement("div");actions.className="toolbar lds-field-ai-actions";panel.appendChild(actions);
   const copy=document.createElement("button");copy.type="button";copy.className="btn";copy.textContent=choose(lang,"Copy prompt","نسخ الطلب");actions.appendChild(copy);copy.classList.add("lds-ai-secondary");
   copy.onclick=async()=>{try{await navigator.clipboard.writeText(p.value);copy.textContent=choose(lang,"Copied!","تم النسخ")}catch{p.focus();p.select();alert(choose(lang,"Please copy the selected prompt manually.","انسخ النص المحدد يدوياً."))}};
   const fallback=document.createElement("button");fallback.type="button";fallback.className="btn";fallback.textContent=choose(lang,"Copy prompt & open ChatGPT","نسخ الطلب وفتح ChatGPT");actions.appendChild(fallback);
   fallback.onclick=async()=>{try{await navigator.clipboard.writeText(p.value);window.open("https://chatgpt.com/","_blank","noopener,noreferrer");status.textContent=choose(lang,"Prompt copied. Paste it into ChatGPT, then paste the reviewed field value below.","تم نسخ الطلب. الصقه في ChatGPT ثم الصق القيمة المُراجعة أدناه.");}catch{p.focus();p.select();status.textContent=choose(lang,"Copy the selected prompt, then use Open ChatGPT.","انسخ الطلب المحدد ثم افتح ChatGPT.");}};
   const link=document.createElement("a");link.href="https://chatgpt.com/";link.target="_blank";link.rel="noopener noreferrer";link.className="btn";link.textContent=choose(lang,"Open ChatGPT","فتح ChatGPT");actions.appendChild(link);link.classList.add("lds-ai-secondary");
   const direct=document.createElement("button");direct.type="button";direct.className="btn primary";direct.textContent=choose(lang,"✨ Generate directly with AI","✨ إنشاء مباشر بالذكاء الاصطناعي");actions.insertBefore(direct,actions.firstChild);
   const status=document.createElement("p");status.setAttribute("role","status");panel.appendChild(status);
   const outputLabel=document.createElement("label");outputLabel.textContent=choose(lang,"Reviewed suggestion to insert","الاقتراح المُراجع للإدراج");panel.appendChild(outputLabel);
   const output=document.createElement("textarea");output.rows=5;output.placeholder=choose(lang,"Paste the field value only; review accuracy first.","الصق قيمة الحقل فقط بعد مراجعتها.");panel.appendChild(output);
   direct.onclick=async()=>{
    if(!window.LDSDirectAI){status.textContent=choose(lang,"Direct AI is unavailable. Use Copy prompt & open ChatGPT.","الإنشاء المباشر غير متاح. استخدم نسخ الطلب وفتح ChatGPT.");return}
    direct.disabled=true;status.textContent=choose(lang,"Generating suggestion…","جارٍ إنشاء الاقتراح…");
    try{output.value=await window.LDSDirectAI.generate(p.value);status.textContent=choose(lang,"Review the suggestion before inserting.","راجع الاقتراح قبل الإدراج.");}
    catch(e){const reason=e&&e.code;const fallbackMessage=reason==="quota"?choose(lang,"Direct AI credits or quota are exhausted.","نفدت أرصدة أو حصة واجهة الذكاء الاصطناعي."):reason==="rate_limit"?choose(lang,"Direct AI is temporarily rate-limited.","تم بلوغ حد الطلبات المؤقت."):reason==="auth"?choose(lang,"Direct AI authentication needs administrator attention.","تحتاج مصادقة الخدمة إلى مراجعة المسؤول."):choose(lang,"Direct AI is currently unavailable.","الإنشاء المباشر غير متاح حالياً.");status.textContent=fallbackMessage+" "+choose(lang,"Copy the tailored prompt and open ChatGPT to continue; your design is preserved.","انسخ الطلب المخصص وافتح ChatGPT للمتابعة؛ تصميمك محفوظ.");}
    finally{direct.disabled=false}
   };
   const insert=document.createElement("button");insert.type="button";insert.className="btn primary";insert.style.marginTop="8px";insert.textContent=choose(lang,"Insert reviewed value","إدراج القيمة المُراجعة");panel.appendChild(insert);
   const note=document.createElement("p");note.textContent=choose(lang,"Direct generation sends the tailored prompt to the configured AI provider. Alternatively, use ChatGPT manually. Do not include private student data. Review suggestions before inserting; select fields require an available option.","يرسل الإنشاء المباشر الطلب إلى مزود الذكاء الاصطناعي المهيأ. ويمكن استخدام ChatGPT يدوياً. تجنب بيانات الطلبة الخاصة وراجع الاقتراح قبل إدراجه.");panel.appendChild(note);
   insert.onclick=()=>{
    const value=output.value.trim();if(!value){alert(choose(lang,"Paste a reviewed suggestion first.","الصق الاقتراح المُراجع أولاً."));return}
    if(el.tagName==="SELECT"){
     const match=[...el.options].find(o=>o.value.toLowerCase()===value.toLowerCase()||o.textContent.trim().toLowerCase()===value.toLowerCase());
     if(!match){alert(choose(lang,"Choose one of the existing options in this field.","اختر إحدى القيم المتاحة في هذا الحقل."));return}
     el.value=match.value;
    }else if(el.type==="number"){
     const n=Number(value);if(!Number.isFinite(n)||n<0||(key==="minutes"&&n===0)){alert(choose(lang,"Enter a valid positive number.","أدخل رقماً موجباً صالحاً."));return}el.value=String(n);
    }else el.value=value;
    el.dispatchEvent(new Event(el.hasAttribute("data-act")?"change":"input",{bubbles:true}));
    if(el.hasAttribute("data-field")){window.LDSAINav.close();alert(choose(lang,"Suggestion inserted. Review the complete design before export.","تم الإدراج. راجع التصميم قبل التصدير."))}
   };
  });
 });
}

// One consolidated activity-level coaching action, without changing any fields automatically.
// Activity-level coach: a guided, human-approved review workflow.
function parseActivityReview(raw){
 // Prefer exact JSON; only clean formatting outside quoted values.
 const candidates=[raw.trim()];
 const fence=raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
 if(fence)candidates.push(fence[1].trim());
 const start=raw.indexOf("{"),end=raw.lastIndexOf("}");
 if(start>=0&&end>start)candidates.push(raw.slice(start,end+1));
 for(const candidate of candidates){
  try{return JSON.parse(candidate)}catch{}
  let cleaned="",quoted=false,escaped=false;
  for(let i=0;i<candidate.length;i++){
   const c=candidate[i];
   if(quoted){cleaned+=c;if(escaped)escaped=false;else if(c==="\\")escaped=true;else if(c==='"')quoted=false;continue}
   if(c==='"'){quoted=true;cleaned+=c;continue}
   const entity=candidate.slice(i).match(/^&(?:#x20|#32|nbsp|#160|#xA0|#10|#13);/i);
   if(entity){cleaned+=" ";i+=entity[0].length-1;continue}
   if(c==="\\"&&/^[ \t]*[\r\n]/.test(candidate.slice(i+1)))continue;
   if(c===","){const tail=candidate.slice(i+1);if(/^\s*[}\]]/.test(tail))continue}
   cleaned+=c;
  }
  try{return JSON.parse(cleaned)}catch{}
 }
 throw Error("Invalid JSON");
}
function mountActivityCoach(d,lang){
 const t=(en,ar)=>choose(lang,en,ar);
 const keys=["title","phase","type","minutes","group","mode","teacher","resource","assessment"];
 const labels={title:["Activity title","عنوان النشاط"],phase:["Phase","المرحلة"],type:["Learning type","نوع التعلم"],minutes:["Minutes","الدقائق"],group:["Group size","حجم المجموعة"],mode:["Delivery mode","نمط التدريس"],teacher:["Teacher role","دور المعلم"],resource:["Student instructions","تعليمات الطلبة"],assessment:["Assessment and feedback","التقييم والتغذية الراجعة"]};
 const allowedPhase=["before","during","after"];
 const allowedTypes=["Acquisition","Inquiry","Discussion","Practice","Collaboration","Production"];
 document.querySelectorAll(".activity").forEach((card,i)=>{
  const header=card.querySelector(".row");if(!header||header.querySelector(".lds-activity-coach"))return;
  const btn=document.createElement("button");btn.type="button";btn.className="btn lds-activity-coach";btn.textContent=t("✨ Improve activity","✨ تحسين النشاط");
  const del=header.querySelector("[data-delete]");if(del)header.insertBefore(btn,del);else header.appendChild(btn);
  const panel=document.createElement("section");panel.className="card lds-field-ai-panel lds-activity-review";panel.hidden=true;card.insertBefore(panel,card.querySelector(".grid"));
  btn.onclick=()=>{
   if(!window.LDSAINav.toggle(panel,btn,lang))return;
   const a=d.activities[i];panel.replaceChildren();window.LDSAINav.header(panel,lang);
   const add=(tag,content,parent=panel)=>{const e=document.createElement(tag);e.textContent=content;parent.appendChild(e);return e};
   add("h3",t("Improve activity: paste → review → apply","تحسين النشاط: الصق ← راجع ← طبّق"));
   add("p",t("1. Generate or paste an AI review. 2. Inspect proposed changes. 3. Apply only the changes you approve. Your original activity stays unchanged until you apply.","١. أنشئ مراجعة أو الصقها. ٢. افحص التعديلات المقترحة. ٣. طبّق ما توافق عليه فقط. يبقى النشاط الأصلي دون تغيير حتى التطبيق."));
   const prompt=add("textarea","");prompt.rows=7;prompt.value=[
    "Act as an expert university learning designer using UCL's six learning types. Respond in "+(lang==="ar"?"Arabic":"English")+".",
    "Review this activity for alignment with learning outcomes, feasibility, inclusive participation, assessment and time.",
    "IMPORTANT: Return ONLY a valid JSON object, without markdown fences, with optional keys: title, phase, type, minutes, group, mode, teacher, resource, assessment, rationale.",
    "Use phase before/during/after; type Acquisition/Inquiry/Discussion/Practice/Collaboration/Production; minutes a positive number.",
    "Keep resource as concise student-facing instructions only, including task, time and submission. Do not put full learning materials in this field.",
    "Only include fields that genuinely need improvement. For each field use a replacement value, not an explanation. Put pedagogical explanation in rationale. Never invent links or citations.",
    "Course: "+safe(d.course),"Module: "+safe(d.module),"Discipline: "+safe(d.discipline),"Problem: "+safe(d.problem),"Learning outcomes: "+safe(d.outcomes),"Session minutes: "+safe(d.duration),"Current activity: "+JSON.stringify(Object.fromEntries(keys.map(k=>[k,a[k]])))
   ].join("\n");prompt.setAttribute("aria-label",t("Prompt to send to ChatGPT","الطلب لإرساله إلى ChatGPT"));
   const actions=add("div","");actions.className="toolbar lds-field-ai-actions";
   const button=(txt,primary=false)=>{const b=add("button",txt,actions);b.type="button";b.className="btn"+(primary?" primary":"");return b};
   const direct=button(t("✨ Generate with AI","✨ إنشاء بالذكاء الاصطناعي"),true);
   const fallback=button(t("Copy prompt & open ChatGPT","نسخ الطلب وفتح ChatGPT"));
   const status=add("p","");status.setAttribute("role","status");
   const pasteLabel=add("label",t("Step 2 — Paste the FULL ChatGPT response here (NOT in Resources and student instructions)","الخطوة ٢ — الصق رد ChatGPT كاملاً هنا (وليس في حقل الموارد وتعليمات الطلبة)"));
   const result=add("textarea","");result.rows=8;result.placeholder=t('Paste the response from ChatGPT here, then click "Review proposed changes".','الصق استجابة ChatGPT هنا ثم اضغط مراجعة التغييرات المقترحة.');result.setAttribute("aria-label",pasteLabel.textContent);
   const review=add("button",t("Clean and review proposed changes","تنظيف ومراجعة التغييرات المقترحة"));review.type="button";review.className="btn primary";
   const comparison=add("div","");comparison.hidden=true;
   const rationale=add("p","",comparison);rationale.className="muted";
   const changes=add("div","",comparison);
   const apply=add("button",t("Apply selected changes","تطبيق التغييرات المحددة"),comparison);apply.type="button";apply.className="btn primary";
   const cancel=add("button",t("Discard suggestions","تجاهل الاقتراحات"),comparison);cancel.type="button";cancel.className="btn";
   add("p",t("Only checked fields are updated. Your other activities stay untouched. Approved changes are saved in this browser; use Export JSON for a backup.","تُحدّث الحقول المحددة فقط وتبقى الأنشطة الأخرى دون تغيير. تُحفظ التعديلات الموافق عليها في هذا المتصفح؛ استخدم تصدير JSON لنسخة احتياطية."));
   fallback.onclick=async()=>{
    window.open("https://chatgpt.com/","_blank","noopener,noreferrer");
    try{await navigator.clipboard.writeText(prompt.value);status.textContent=t("Prompt copied. Paste it in ChatGPT, then return here and paste the full response into Step 2.","تم نسخ الطلب. الصقه في ChatGPT ثم عد والصق الاستجابة كاملة في الخطوة ٢.");}
    catch{prompt.focus();prompt.select();status.textContent=t("Copy the selected prompt manually and paste it in ChatGPT.","انسخ الطلب المحدد يدوياً والصقه في ChatGPT.");}
   };
   direct.onclick=async()=>{
    if(!window.LDSDirectAI){status.textContent=t("Direct AI unavailable. Use ChatGPT instead.","الخدمة المباشرة غير متاحة. استخدم ChatGPT.");return;}
    direct.disabled=true;status.textContent=t("Generating review…","جارٍ إنشاء المراجعة…");
    try{result.value=await window.LDSDirectAI.generate(prompt.value);status.textContent=t('Review generated. Click "Review proposed changes" below.','اكتملت المراجعة. اضغط مراجعة التغييرات المقترحة أدناه.');}
    catch{status.textContent=t("Direct AI unavailable or quota exceeded. Use Copy prompt & open ChatGPT; your work is preserved.","الخدمة غير متاحة أو نفدت الحصة. استخدم نسخ الطلب وفتح ChatGPT؛ عملك محفوظ.");}
    finally{direct.disabled=false;}
   };
   let proposed={};
   review.onclick=()=>{
    comparison.hidden=true;changes.replaceChildren();proposed={};
    let raw=result.value.trim();if(!raw){status.textContent=t("Paste the AI response into Step 2 first.","الصق استجابة الذكاء الاصطناعي في الخطوة ٢ أولاً.");return;}
    try{
     raw=raw.replace(/^```(?:json)?\s*/i,"").replace(/```\s*$/,"").trim();
     const obj=parseActivityReview(raw);
     if(!obj||Array.isArray(obj)||typeof obj!=="object")throw Error("format");
     keys.forEach(k=>{
      if(!(k in obj)||obj[k]===null||typeof obj[k]==="object")return;
      const value=String(obj[k]).trim();if(!value||value===String(a[k]??"").trim())return;
      if(k==="minutes"&&(!Number.isFinite(Number(value))||Number(value)<=0||!Number.isInteger(Number(value))))return;
      if(k==="phase"&&!allowedPhase.includes(value.toLowerCase()))return;
      if(k==="type"&&!allowedTypes.some(x=>x.toLowerCase()===value.toLowerCase()))return;
      if((k==="title"||k==="teacher"||k==="resource"||k==="assessment")&&value.length>6000)return;
      proposed[k]=value;
      const item=add("div","",changes);item.style.cssText="padding:10px 0;border-bottom:1px solid #dbe3ec";
      const label=add("label","",item);label.style.cssText="display:flex;gap:10px;align-items:flex-start";
      const check=document.createElement("input");check.type="checkbox";check.checked=true;check.dataset.approve=k;label.appendChild(check);
      const words=add("span",(labels[k][lang==="ar"?1:0])+": "+String(a[k]??"")+" → "+value,label);words.style.overflowWrap="anywhere";
     });
     rationale.textContent=typeof obj.rationale==="string"?obj.rationale:"";
     if(!Object.keys(proposed).length){status.textContent=t("No valid field changes were found. The activity has not been changed.","لم يتم العثور على تغييرات صالحة. لم يُعدّل النشاط.");return;}
     comparison.hidden=false;apply.scrollIntoView({block:"nearest",behavior:"smooth"});status.textContent=t("Review the checked changes below, then press Apply selected changes to update the activity.","راجع التغييرات المحددة أدناه ثم اضغط تطبيق التغييرات المحددة لتحديث النشاط.");
    }catch{status.textContent=t("The response could not be safely cleaned. Copy the complete response using ChatGPT’s Copy button. Ask ChatGPT: 'Return only the JSON object, without markdown or commentary.' Nothing has been changed.","الاستجابة ليست JSON صالحاً. اطلب من ChatGPT إعادة كائن JSON فقط دون شرح. لم يُعدّل شيء.");}
   };
   apply.onclick=()=>{
    const selected=[...changes.querySelectorAll("[data-approve]:checked")].map(e=>e.dataset.approve);
    if(!selected.length){status.textContent=t("Select at least one change to apply.","حدد تغييراً واحداً على الأقل.");return;}
    const updated={...a};for(const k of selected){
     const v=proposed[k];updated[k]=k==="minutes"?Number(v):k==="phase"?v.toLowerCase():k==="type"?allowedTypes.find(x=>x.toLowerCase()===v.toLowerCase()):v;
    }
    // Keep the rest of the design and all other activities untouched.
    Object.assign(a,updated);
    const first=card.querySelector('[data-prop="title"]');
    selected.forEach(k=>{const el=card.querySelector('[data-prop="'+k+'"]');if(el)el.value=String(a[k]);});
    const headerTitle=header.querySelector("strong");if(headerTitle)headerTitle.textContent=(i+1)+". "+a.title;
    comparison.hidden=true;
    try{localStorage.setItem("lds-design",JSON.stringify(d));status.textContent=t("Changes applied and saved in this browser. Review the updated fields below; Export JSON for a backup.","طُبّقت التغييرات وحُفظت في هذا المتصفح. راجع الحقول المحدثة أدناه، ثم صدّر JSON لنسخة احتياطية.");}
    catch{status.textContent=t("Changes applied, but browser storage failed. Click Save and export a backup.","طُبّقت التغييرات، لكن الحفظ في المتصفح تعذّر. اضغط حفظ وصدّر نسخة احتياطية.");}
   };
   cancel.onclick=()=>{comparison.hidden=true;changes.replaceChildren();status.textContent=t("Suggestions discarded; activity unchanged.","تم تجاهل الاقتراحات؛ النشاط لم يتغير.");};
  };
 });
}

window.LDSFieldAI={mount(d,lang){mount(d,lang);mountActivityCoach(d,lang)},buildPrompt};
})();
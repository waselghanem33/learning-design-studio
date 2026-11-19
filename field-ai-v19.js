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
   panel.hidden=!panel.hidden;if(panel.hidden)return;
   const a=i===null?null:d.activities[i];
   panel.replaceChildren();
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
    if(el.hasAttribute("data-field")){panel.hidden=true;alert(choose(lang,"Suggestion inserted. Review the complete design before export.","تم الإدراج. راجع التصميم قبل التصدير."))}
   };
  });
 });
}

// One consolidated activity-level coaching action, without changing any fields automatically.
function mountActivityCoach(d,lang){
 document.querySelectorAll(".activity").forEach((card,i)=>{
  const header=card.querySelector(".row");if(!header||header.querySelector(".lds-activity-coach"))return;
  const btn=document.createElement("button");btn.type="button";btn.className="btn lds-activity-coach";btn.textContent=choose(lang,"✨ Improve activity","✨ تحسين النشاط");const deleteButton=header.querySelector("[data-delete]");if(deleteButton)header.insertBefore(btn,deleteButton);else header.appendChild(btn);
  const panel=document.createElement("section");panel.className="card lds-field-ai-panel lds-activity-review";panel.hidden=true;card.insertBefore(panel,card.querySelector(".grid"));
  btn.onclick=()=>{panel.hidden=!panel.hidden;if(panel.hidden)return;
   const a=d.activities[i];panel.replaceChildren();
   const h=document.createElement("h3");h.textContent=choose(lang,"AI Activity Design Coach","مساعد تحسين تصميم النشاط");panel.appendChild(h);
   const intro=document.createElement("p");intro.textContent=choose(lang,"Review learning type, phase, time, grouping, delivery, teacher role, resources and assessment together. Suggestions are advisory; no field is overwritten.","راجع نوع التعلم والمرحلة والوقت والمجموعات ونمط التدريس ودور المعلم والموارد والتقييم معاً. الاقتراحات استشارية ولا تستبدل الحقول.");panel.appendChild(intro);
   const prompt=document.createElement("textarea");prompt.rows=8;prompt.value=[
    "Act as a university learning design coach using UCL's six learning types. Respond in "+(lang==="ar"?"Arabic":"English")+".",
    "Critically review this single activity for alignment, feasibility, inclusivity and authentic assessment. Suggest improvements for learning type, phase, minutes, group size, delivery mode, teacher role, resources and formative feedback. Give a short pedagogical rationale and a revised activity plan. Do not invent citations or links. Do not include private student information.",
    "Course: "+safe(d.course),"Module: "+safe(d.module),"Authentic problem: "+safe(d.problem),"Outcomes: "+safe(d.outcomes),"Total planned minutes: "+safe(d.duration),
    "Activity: "+JSON.stringify(a)
   ].join("\n");panel.appendChild(prompt);
   const actions=document.createElement("div");actions.className="toolbar lds-field-ai-actions";panel.appendChild(actions);
   const direct=document.createElement("button");direct.type="button";direct.className="btn primary";direct.textContent=choose(lang,"✨ Generate review with AI","✨ إنشاء مراجعة بالذكاء الاصطناعي");actions.appendChild(direct);
   const fallback=document.createElement("button");fallback.type="button";fallback.className="btn";fallback.textContent=choose(lang,"Copy prompt & open ChatGPT","نسخ الطلب وفتح ChatGPT");actions.appendChild(fallback);
   const status=document.createElement("p");status.setAttribute("role","status");panel.appendChild(status);
   const result=document.createElement("textarea");result.rows=8;result.placeholder=choose(lang,"Review the recommendations, then edit the activity fields yourself.","راجع التوصيات ثم عدّل حقول النشاط بنفسك.");panel.appendChild(result);
   fallback.onclick=async()=>{window.open("https://chatgpt.com/","_blank","noopener,noreferrer");try{await navigator.clipboard.writeText(prompt.value);status.textContent=choose(lang,"Prompt copied; paste it into ChatGPT.","تم نسخ الطلب؛ الصقه في ChatGPT.");}catch{prompt.focus();prompt.select();status.textContent=choose(lang,"Copy the selected prompt manually.","انسخ الطلب المحدد يدوياً.");}};
   direct.onclick=async()=>{if(!window.LDSDirectAI){status.textContent=choose(lang,"Direct AI unavailable; use ChatGPT.","الإنشاء المباشر غير متاح؛ استخدم ChatGPT.");return;}direct.disabled=true;status.textContent=choose(lang,"Reviewing activity…","جارٍ مراجعة النشاط…");try{result.value=await window.LDSDirectAI.generate(prompt.value);status.textContent=choose(lang,"Review suggestions before editing fields.","راجع الاقتراحات قبل تعديل الحقول.");}catch(e){status.textContent=choose(lang,"Direct AI unavailable or quota exceeded. Use Copy prompt & open ChatGPT.","الإنشاء المباشر غير متاح أو نفدت الحصة؛ استخدم ChatGPT.");}finally{direct.disabled=false;}};
  };
 });
}

window.LDSFieldAI={mount(d,lang){mount(d,lang);mountActivityCoach(d,lang)},buildPrompt};
})();
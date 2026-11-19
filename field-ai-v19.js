/* Learning Design Studio v2.1 — hybrid direct AI and ChatGPT fallback. */
(function(){
"use strict";
const names={course:["Course","المساق"],module:["Module title","عنوان الوحدة"],discipline:["Discipline","التخصص"],problem:["Authentic problem","المشكلة الواقعية"],outcomes:["Learning outcomes","مخرجات التعلم"],duration:["Planned duration","المدة المخططة"],title:["Activity title","عنوان النشاط"],phase:["Activity phase","مرحلة النشاط"],type:["Learning type","نوع التعلم"],minutes:["Activity duration","مدة النشاط"],group:["Group size","حجم المجموعة"],mode:["Delivery mode","نمط التدريس"],teacher:["Teacher role","دور المعلم"],assessment:["Assessment and formative feedback","التقييم والتغذية الراجعة"]};
const choose=(lang,en,ar)=>lang==="ar"?ar:en;
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
  if(!names[key]||el.dataset.aiFieldMounted) return;
  el.dataset.aiFieldMounted="yes";
  const i=el.hasAttribute("data-act")?Number(el.dataset.act):null;
  const parent=el.closest(".field");if(!parent)return;
  const btn=document.createElement("button");btn.type="button";btn.className="btn";btn.style.margin="6px 0 8px";btn.textContent=choose(lang,"✨ AI Assist","✨ مساعدة الذكاء الاصطناعي");
  parent.appendChild(btn);
  const panel=document.createElement("div");panel.hidden=true;panel.className="card";panel.style.marginTop="8px";parent.appendChild(panel);
  btn.addEventListener("click",()=>{
   panel.hidden=!panel.hidden;if(panel.hidden)return;
   const a=i===null?null:d.activities[i];
   panel.replaceChildren();
   const title=document.createElement("h3");title.textContent=choose(lang,"AI Design Assistant — ","مساعد التصميم — ")+(names[key][lang==="ar"?1:0]);panel.appendChild(title);
   const intro=document.createElement("p");intro.textContent=choose(lang,"Copy the tailored prompt into ChatGPT. Review the response, then paste only the field value below.","انسخ الطلب إلى ChatGPT، وراجع الاستجابة، ثم الصق قيمة الحقل فقط أدناه.");panel.appendChild(intro);
   const p=document.createElement("textarea");p.rows=8;p.value=buildPrompt(d,a,key,lang);p.setAttribute("aria-label","Editable AI prompt");panel.appendChild(p);
   const actions=document.createElement("div");actions.className="toolbar";panel.appendChild(actions);
   const copy=document.createElement("button");copy.type="button";copy.className="btn";copy.textContent=choose(lang,"Copy prompt","نسخ الطلب");actions.appendChild(copy);
   copy.onclick=async()=>{try{await navigator.clipboard.writeText(p.value);copy.textContent=choose(lang,"Copied!","تم النسخ")}catch{p.focus();p.select();alert(choose(lang,"Please copy the selected prompt manually.","انسخ النص المحدد يدوياً."))}};
   const fallback=document.createElement("button");fallback.type="button";fallback.className="btn";fallback.textContent=choose(lang,"Copy prompt & open ChatGPT","نسخ الطلب وفتح ChatGPT");actions.appendChild(fallback);
   fallback.onclick=async()=>{try{await navigator.clipboard.writeText(p.value);window.open("https://chatgpt.com/","_blank","noopener,noreferrer");status.textContent=choose(lang,"Prompt copied. Paste it into ChatGPT, then paste the reviewed field value below.","تم نسخ الطلب. الصقه في ChatGPT ثم الصق القيمة المُراجعة أدناه.");}catch{p.focus();p.select();status.textContent=choose(lang,"Copy the selected prompt, then use Open ChatGPT.","انسخ الطلب المحدد ثم افتح ChatGPT.");}};
   const link=document.createElement("a");link.href="https://chatgpt.com/";link.target="_blank";link.rel="noopener noreferrer";link.className="btn";link.textContent=choose(lang,"Open ChatGPT","فتح ChatGPT");actions.appendChild(link);
   const direct=document.createElement("button");direct.type="button";direct.className="btn primary";direct.textContent=choose(lang,"✨ Generate directly with AI","✨ إنشاء مباشر بالذكاء الاصطناعي");panel.appendChild(direct);
   const status=document.createElement("p");status.setAttribute("role","status");panel.appendChild(status);
   const label=document.createElement("label");label.textContent=choose(lang,"Reviewed suggestion to insert","الاقتراح المُراجع للإدراج");panel.appendChild(label);
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
window.LDSFieldAI={mount,buildPrompt};
})();
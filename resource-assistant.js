/* Bilingual, API-key-free activity resource assistant. Professors review all AI output. */
(function(){
"use strict";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const L=(ar,en,lang)=>lang==="ar"?ar:en;
function prompt(d,a,lang,mode){
 const tasks={generate:"Create a practical resource pack",find:"Recommend credible open educational resources and discovery strategies",improve:"Critique and improve the existing resources and instructions"};
 return [
 "You are an expert university instructional designer. Respond in "+(lang==="ar"?"Arabic":"English")+".",
 "TASK: "+tasks[mode]+".",
 "Course: "+(d.course||"Not specified"),"Module: "+(d.module||"Not specified"),
 "Discipline: "+(d.discipline||"Not specified"),"Authentic problem: "+(d.problem||"Not specified"),
 "Learning outcomes: "+(d.outcomes||"Not specified"),
 "Activity: "+(a.title||"Untitled"),"Learning type: "+a.type,"Phase: "+a.phase,
 "Duration: "+a.minutes+" minutes","Group: "+a.group,"Delivery: "+a.mode,
 "Teacher role: "+(a.teacher||"Not specified"),"Assessment: "+(a.assessment||"Not specified"),
 "Existing resources and instructions: "+(a.resource||"None"),
 "Produce: (1) 2-3 suitable resource formats and their learning purpose; (2) one ready-to-use student-facing activity brief with steps, time allocation and expected output; (3) formative assessment and feedback guidance; (4) accessibility and low-bandwidth alternatives; (5) optional credible OER discovery sources.",
 "Align every suggestion with the activity's learning type and outcomes. Respect the time and group size. Distinguish resources you create from external resources.",
 "When writing technical resources, preserve equations in LaTeX notation and include image references or clearly marked diagram descriptions. Do not claim that an image is embedded unless a real image file or verified URL is supplied.",
 "Do not fabricate citations, publications, URLs or claims that sources have been verified. Mark any external source suggestions as requiring instructor verification. Do not include personal or sensitive student data."
 ].join("\n");
}
function mount(design,lang){
 document.querySelectorAll('textarea[data-prop="resource"][data-act]').forEach(field=>{
  const i=Number(field.dataset.act);
  if(field.dataset.resourceAi) return;
  field.dataset.resourceAi="1";
  const button=document.querySelector('[data-resource-ai-button="'+i+'"]') || document.createElement("button");
  if(!button.parentNode){button.type="button";button.className="btn";button.textContent=L("✨ مساعد الموارد بالذكاء الاصطناعي","✨ AI Resource Assistant",lang);field.insertAdjacentElement("afterend",button);}
  const panel=document.createElement("div");panel.hidden=true;panel.className="card";panel.style.marginTop="10px";field.parentNode.appendChild(panel);
  button.addEventListener("click",()=>{
   panel.hidden=!panel.hidden;if(panel.hidden)return;
   panel.innerHTML='<h3>'+L("مساعد الموارد التعليمية","Learning Resource Assistant",lang)+'</h3><p>'+L("اختر المهمة، وانسخ الطلب إلى أداة ذكاء اصطناعي. راجع الناتج والصقه أدناه قبل إضافته.","Choose a task, copy the tailored prompt to an AI tool, then review and paste its response before inserting.")+'</p>'+
   '<div class="field"><label>'+L("نوع المساعدة","Assistance type",lang)+'</label><select data-ra-mode><option value="generate">'+L("إنشاء موارد وتعليمات","Generate resources and instructions",lang)+'</option><option value="find">'+L("اقتراح مصادر تعليمية مفتوحة","Discover open resources",lang)+'</option><option value="improve">'+L("تحسين الموارد الحالية","Improve existing resources",lang)+'</option></select></div>'+
   '<div class="field"><label>'+L("طلب الذكاء الاصطناعي (قابل للتعديل)","AI prompt (editable)",lang)+'</label><textarea rows="9" data-ra-prompt></textarea></div>'+
   '<div class="toolbar"><button class="btn" data-ra-copy>'+L("نسخ الطلب","Copy prompt",lang)+'</button><a class="btn" href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">'+L("فتح ChatGPT","Open ChatGPT",lang)+'</a></div>'+
   '<div class="field"><label>'+L("الصق النص المُراجع هنا","Paste reviewed AI output here",lang)+'</label><textarea rows="8" data-ra-result placeholder="'+L("راجع الدقة والروابط قبل الإدراج","Check accuracy and links before inserting",lang)+'"></textarea></div>'+
   '<div class="toolbar"><button class="btn primary" data-ra-insert>'+L("إدراج في الموارد","Insert full text (plain text only)",lang)+'</button><button class="btn" data-ra-close>'+L("إغلاق","Close",lang)+'</button></div>'+
   '<p><small>'+L("لا يُرسل الموقع بياناتك إلى خدمة ذكاء اصطناعي. النسخ واللصق يدويان. لا تُدرج بيانات شخصية أو حساسة.","The website does not send data to an AI service. Copy/paste is manual. Do not include sensitive or personal information.",lang)+'</small></p>';
   // Rich resources should be exported as a separate file; the activity field is for concise instructions and links.
   const resourceTools=document.createElement("div");resourceTools.className="field";resourceTools.style.marginTop="12px";
   const resourceTitle=document.createElement("h4");resourceTitle.textContent=L("ملف موارد مستقل وروابط","Separate resource file and links",lang);resourceTools.appendChild(resourceTitle);
   const explanation=document.createElement("p");explanation.textContent=L("احفظ النص الكامل كملف Markdown للحفاظ على معادلات LaTeX وروابط الصور، ثم ارفعه إلى Moodle أو Drive أو GitHub. الصق رابط المشاركة في الحقل أدناه. الملفات المحلية ليست روابط عامة.","Download the full resource as Markdown (.md), preserving LaTeX equations and image references. Upload it to Moodle, Drive, or GitHub, then paste its shareable URL below. A local downloaded file is not a public link.",lang);resourceTools.appendChild(explanation);
   const downloadBtn=document.createElement("button");downloadBtn.type="button";downloadBtn.className="btn";downloadBtn.textContent=L("تنزيل ملف الموارد (.md)","Download resource file (.md)",lang);resourceTools.appendChild(downloadBtn);
   const urlLabel=document.createElement("label");urlLabel.textContent=L("رابط المورد المنشور (https://)","Published resource URL (https://)",lang);resourceTools.appendChild(urlLabel);
   const url=document.createElement("input");url.type="url";url.placeholder="https://";url.style.width="100%";resourceTools.appendChild(url);
   const linkBtn=document.createElement("button");linkBtn.type="button";linkBtn.className="btn";linkBtn.style.marginTop="8px";linkBtn.textContent=L("إضافة رابط إلى تعليمات الطلبة","Add link to student instructions",lang);resourceTools.appendChild(linkBtn);
   panel.querySelector("[data-ra-result]").parentNode.insertAdjacentElement("afterend",resourceTools);
   downloadBtn.onclick=()=>{
     const value=panel.querySelector("[data-ra-result]").value.trim();
     if(!value){alert(L("الصق المحتوى أولاً","Paste or generate the resource first",lang));return}
     const blob=new Blob([value],{type:"text/markdown;charset=utf-8"});const href=URL.createObjectURL(blob);
     const a=document.createElement("a");a.href=href;a.download="learning-resource-activity-"+(i+1)+".md";a.click();setTimeout(()=>URL.revokeObjectURL(href),1500);
   };
   linkBtn.onclick=()=>{
     const value=url.value.trim();let parsed;
     try{parsed=new URL(value);if(parsed.protocol!=="https:")throw Error("url")}catch{alert(L("أدخل رابط HTTPS صالحاً","Enter a valid HTTPS link",lang));return}
     const line=L("رابط المورد التعليمي: ","Learning resource: ",lang)+parsed.href;
     field.value=(field.value.trim()?field.value.trim()+"\\n":"")+line;
     field.dispatchEvent(new Event("change",{bubbles:true}));
   };
   const mode=panel.querySelector("[data-ra-mode]"),p=panel.querySelector("[data-ra-prompt]");
   const refresh=()=>{p.value=prompt(design,design.activities[i],lang,mode.value)};
   mode.addEventListener("change",refresh);refresh();
   panel.querySelector("[data-ra-copy]").onclick=async()=>{try{await navigator.clipboard.writeText(p.value);alert(L("تم نسخ الطلب","Prompt copied",lang))}catch{p.focus();p.select();alert(L("انسخ النص المحدد يدوياً","Copy the selected text manually",lang))}};
   const direct=document.createElement("button");direct.type="button";direct.className="btn primary";direct.style.marginTop="8px";direct.textContent=L("✨ إنشاء الموارد مباشرة","✨ Generate resources directly",lang);
   const status=document.createElement("p");status.setAttribute("role","status");
   panel.querySelector("[data-ra-prompt]").insertAdjacentElement("afterend",status);
   status.insertAdjacentElement("beforebegin",direct);
   direct.onclick=async()=>{direct.disabled=true;status.textContent=L("جارٍ الإنشاء…","Generating…",lang);try{panel.querySelector("[data-ra-result]").value=await window.LDSDirectAI.generate(p.value);status.textContent=L("راجع المحتوى قبل الإدراج","Review before inserting",lang)}catch(e){status.textContent=e.message||String(e)}finally{direct.disabled=false}};
   panel.querySelector("[data-ra-insert]").onclick=()=>{
    const val=panel.querySelector("[data-ra-result]").value.trim();
    if(!val){alert(L("الصق المحتوى المُراجع أولاً","Paste reviewed content first",lang));return}
    const current=field.value.trim();
    field.value=(current&&current!=="Provide relevant resources and clear instructions"?current+"\n\n":"")+val;
    field.dispatchEvent(new Event("change",{bubbles:true}));
   };
   panel.querySelector("[data-ra-close]").onclick=()=>{panel.hidden=true};
  });
 });
}
window.LDSResourceAssistant={mount,prompt};
})();
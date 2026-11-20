/* Bilingual, API-key-free activity resource assistant. Professors review all AI output. */
(function(){
"use strict";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const L=(ar,en,lang)=>lang==="ar"?ar:en;
function prompt(d,a,lang,mode,format="md"){
 const tasks={generate:"Create a practical resource pack",find:"Recommend credible open educational resources and discovery strategies",improve:"Critique and improve the existing resources and instructions"};
 return [
 "You are an expert university instructional designer. Respond in "+(lang==="ar"?"Arabic":"English")+".",
 "DELIVERABLE: Create exactly one complete, downloadable learning resource file in "+({md:"Markdown (.md)",pdf:"PDF (.pdf)",docx:"Word (.docx)",html:"HTML (.html)"}[format]||"Markdown (.md)")+" format. Give it a descriptive filename. Do not return a lengthy chat explanation or multiple alternative formats.",
 "If your ChatGPT environment can create files, actually create and attach the requested file with a download link. Do not merely rename text with an extension. If file creation is unavailable, return the full resource source text (Markdown for .md; complete standalone HTML for .html; Markdown source as an explicitly labeled fallback for PDF/Word) so the professor can download or convert it separately. Never claim a file was created unless it really was.",
 "For equations use correctly formatted LaTeX in Markdown or render mathematics legibly in the PDF/Word output. For figures, embed original diagrams when possible; otherwise provide descriptive alt text and an honest placeholder. Do not fabricate image URLs.",
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
 const t=(en,ar)=>L(ar,en,lang);
 document.querySelectorAll("[data-resource-ai-button]").forEach(button=>{
  if(button.dataset.ready)return;button.dataset.ready="1";
  const i=Number(button.dataset.resourceAiButton),a=design.activities[i];
  const root=document.querySelector('[data-attachments="'+i+'"]');
  const panel=document.createElement("section");panel.className="card";panel.hidden=true;button.insertAdjacentElement("afterend",panel);
  const add=(tag,txt,parent=panel)=>{const e=document.createElement(tag);e.textContent=txt;parent.appendChild(e);return e};
  const btn=(txt,parent=panel)=>{const e=add("button",txt,parent);e.type="button";e.className="btn";return e};
  add("h3",t("1. Generate your resource","١. إنشاء المورد"));
  const mode=add("select","");for(const [v,en,ar] of [["generate","Generate learning resource","إنشاء مورد"],["find","Discover open resources","اكتشاف موارد مفتوحة"],["improve","Improve existing resource","تحسين مورد"]]){const o=add("option",t(en,ar),mode);o.value=v}
  const format=add("select","");for(const [v,n] of [["md","Markdown (.md)"],["pdf","PDF (.pdf)"],["docx","Word (.docx)"],["html","HTML (.html)"]]){const o=add("option",n,format);o.value=v}
  mode.setAttribute("aria-label",t("Assistance type","نوع المساعدة"));format.setAttribute("aria-label",t("File format","صيغة الملف"));
  add("p",t("Copy the prompt, open ChatGPT, and download the generated file to your computer.","انسخ الطلب وافتح ChatGPT ونزّل الملف الناتج إلى جهازك."));
  const details=add("details","");add("summary",t("View or edit AI prompt","عرض أو تعديل الطلب"),details);const p=add("textarea","",details);p.rows=8;p.style.width="100%";
  const refresh=()=>{p.value=prompt(design,a,lang,mode.value,format.value)};mode.onchange=refresh;format.onchange=refresh;refresh();
  const copy=btn(t("Copy prompt","نسخ الطلب"));copy.classList.add("primary");const link=add("a","ChatGPT ↗");link.href="https://chatgpt.com/";link.target="_blank";link.rel="noopener noreferrer";link.className="btn";
  const status=add("p","");status.setAttribute("role","status");
  copy.onclick=async()=>{try{await navigator.clipboard.writeText(p.value);status.textContent=t("Prompt copied. Open ChatGPT, paste it, and download the file.","تم النسخ. افتح ChatGPT والصق الطلب ونزّل الملف.")}catch{details.open=true;p.focus();p.select();status.textContent=t("Copy the selected prompt manually.","انسخ الطلب المحدد يدوياً.")}};
  add("h3",t("2. Import your downloaded file","٢. استيراد الملف الناتج"));
  add("p",t("Choose the file downloaded from ChatGPT. Then click Confirm & attach resource in the resource list above.","اختر الملف الذي نزّلته من ChatGPT ثم اضغط تأكيد وإرفاق المورد في القائمة أعلاه."));
  const importBtn=btn(t("Import ChatGPT file","استيراد ملف ChatGPT"));importBtn.classList.add("primary");importBtn.onclick=()=>{if(root&&root.ldsImport)root.ldsImport();else status.textContent=t("Use Import resource file in the resources section.","استخدم استيراد ملف المورد في قسم الموارد.")};
  const fallback=add("details","");add("summary",t("Alternative: AI returned text instead of a file","بديل: أعاد الذكاء الاصطناعي نصاً بدلاً من ملف"),fallback);
  const output=add("textarea","",fallback);output.rows=7;output.placeholder=t("Paste resource Markdown here","الصق نص المورد هنا");output.style.width="100%";
  const direct=btn(t("Generate Markdown text with AI","إنشاء نص Markdown بالذكاء الاصطناعي"),fallback);
  direct.onclick=async()=>{direct.disabled=true;status.textContent=t("Generating…","جارٍ الإنشاء…");try{output.value=await window.LDSDirectAI.generate(prompt(design,a,lang,mode.value,"md")+"\nReturn the complete Markdown source text, not a file or download link.");status.textContent=t("Review the text before attaching.","راجع النص قبل الإرفاق.")}catch(e){status.textContent=String(e.message||e)}finally{direct.disabled=false}};
  const attach=btn(t("Review & attach Markdown text as file","مراجعة وإرفاق النص كملف Markdown"),fallback);attach.onclick=()=>{if(!output.value.trim()){status.textContent=t("Paste resource text first.","الصق النص أولاً.");return}if(root&&root.ldsStage)root.ldsStage(new File([output.value],"learning-resource-"+(i+1)+".md",{type:"text/markdown"}))};
  const close=btn(t("Close assistant","إغلاق المساعد"));close.onclick=()=>{panel.hidden=true};
  add("small",t("Files are stored locally; use published Moodle or Drive links for student sharing. Direct AI sends the prompt to the configured provider. Review all materials.","تحفظ الملفات محلياً؛ استخدم روابط Moodle أو Drive للمشاركة. يرسل الذكاء الاصطناعي المباشر الطلب إلى المزود المهيأ. راجع المحتوى."));
  button.onclick=()=>{panel.hidden=!panel.hidden;if(!panel.hidden)refresh()};
 });
}
window.LDSResourceAssistant={mount,prompt};
})();
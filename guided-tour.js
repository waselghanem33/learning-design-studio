"use strict";
(function(){
const DONE="lds-tour-v1.6.2-completed";
const steps=[
["home","Welcome to Learning Design Studio","مرحباً بك في استوديو تصميم التعلم","This short tour shows where to begin and how to move between menus.","تعرّف في هذه الجولة القصيرة إلى طريقة البدء والتنقل بين القوائم."],
["manual","User guide","دليل الاستخدام","Open the bilingual manual anytime for a complete explanation of each menu and a downloadable guide.","افتح الدليل ثنائي اللغة في أي وقت لشرح القوائم وتنزيل دليل الاستخدام."],
["cases","Choose a discipline example","اختر مثالاً من تخصصك","Start from a sample case. Loading a sample replaces the current design, so export your work first if necessary.","ابدأ بحالة تعليمية جاهزة. تحميل المثال يستبدل التصميم الحالي؛ صدّر عملك أولاً إذا لزم."],
["lab","Build your learning design","أنشئ تصميم التعلم","Enter learning outcomes, a real-world problem, and before/during/after activities. Save or export your work.","أدخل المخرجات ومشكلة واقعية وأنشطة قبل التعلم وأثناءه وبعده، ثم احفظ أو صدّر عملك."],
["ai","Get AI coaching","استخدم المدرب الذكي","Generate a readable coaching prompt, use it in an AI chat, then review suggestions before applying them.","أنشئ طلباً واضحاً للمدرب الذكي، واستخدمه في محادثة AI، ثم راجع المقترحات قبل تطبيقها."],
["alignment","Check constructive alignment","راجع المواءمة البنائية","LO means Learning Outcome, not Bloom level. Link outcomes to activities, select Bloom levels and document assessment evidence.","LO تعني مخرج التعلم وليست مستوى بلوم. اربط المخرجات بالأنشطة، وحدد مستويات بلوم، ووثّق أدلة التقييم."],
["scenarios","Practice with scenarios","تدرّب بالسيناريوهات","Answer instructional decision challenges and review the immediate feedback.","أجب عن تحديات القرارات التعليمية واستفد من التغذية الراجعة الفورية."],
["progress","Track workshop progress","تابع تقدمك","Mark completed challenges and inspect design readiness indicators.","حدد التحديات التي أنجزتها وراجع مؤشرات جاهزية التصميم."],
["review","Request peer review","اطلب مراجعة الأقران","Use the suggested training rubric to exchange formative feedback with a colleague.","استخدم بطاقة التقييم التدريبية المقترحة لتبادل الملاحظات البنّاءة مع زميل."],
["portfolio","Export your portfolio","صدّر ملف الإنجاز","Download a portfolio after checking your activities, outcomes and feedback.","نزّل ملف الإنجاز بعد مراجعة الأنشطة والمخرجات والتغذية الراجعة."],
["resources","Explore additional resources","استكشف الموارد","Find the original UCL Learning Designer and workshop downloads. Moodle publishing is not automatic.","اطلع على أداة UCL الأصلية وملفات الورشة. النشر إلى Moodle ليس تلقائياً."]
];
let index=0,open=false,initialized=false,previousFocus=null;
const $=id=>document.getElementById(id);
const ar=()=>document.documentElement.lang==="ar";
const t=(en,arabic)=>ar()?arabic:en;
function navigate(page){
 const nav=document.querySelector('.nav [data-page="'+page+'"]');
 if(nav)nav.click();
}
function remove(){
 const overlay=$("lds-tour-overlay");if(overlay)overlay.remove();
 document.querySelectorAll(".lds-tour-target").forEach(e=>e.classList.remove("lds-tour-target"));
}
function close(completed){
 open=false;remove();
 localStorage.setItem(DONE,completed?"completed":"dismissed");
 if(previousFocus&&document.contains(previousFocus))previousFocus.focus();
 previousFocus=null;
}
function show(){
 if(!open)return;
 remove();
 const step=steps[index];
 navigate(step[0]);
 const nav=document.querySelector('.nav [data-page="'+step[0]+'"]');
 if(nav){nav.classList.add("lds-tour-target");nav.scrollIntoView({behavior:"auto",block:"nearest",inline:"nearest"});}
 const overlay=document.createElement("div");overlay.id="lds-tour-overlay";overlay.className="lds-tour-overlay";overlay.setAttribute("role","presentation");
 const dialog=document.createElement("section");dialog.className="lds-tour-dialog";dialog.setAttribute("role","dialog");dialog.setAttribute("aria-modal","true");dialog.setAttribute("aria-labelledby","lds-tour-title");
 dialog.innerHTML='<div class="lds-tour-top"><span>'+t("Interactive tour","جولة إرشادية تفاعلية")+' · '+(index+1)+' / '+steps.length+'</span><button type="button" id="lds-tour-close" aria-label="'+t("Close tour","إغلاق الجولة")+'">×</button></div>'+
 '<div class="lds-tour-meter"><div style="width:'+((index+1)/steps.length*100)+'%"></div></div>'+
 '<h2 id="lds-tour-title">'+t(step[1],step[2])+'</h2><p>'+t(step[3],step[4])+'</p>'+
 '<p class="lds-tour-hint">'+t("The highlighted menu is open behind this guide.","القائمة المميزة مفتوحة خلف هذه النافذة.")+'</p>'+
 '<div class="lds-tour-actions"><button class="btn" id="lds-tour-skip">'+t("Skip tour","تخطي الجولة")+'</button><span class="lds-tour-spacer"></span><button class="btn" id="lds-tour-back" '+(index===0?"disabled":"")+'>'+t("Previous","السابق")+'</button><button class="btn primary" id="lds-tour-next">'+(index===steps.length-1?t("Finish","إنهاء"):t("Next","التالي"))+'</button></div>';
 overlay.appendChild(dialog);document.body.appendChild(overlay);
 $("lds-tour-close").onclick=()=>close(false);
 $("lds-tour-skip").onclick=()=>close(false);
 $("lds-tour-back").onclick=()=>{if(index>0){index--;show()}};
 $("lds-tour-next").onclick=()=>{if(index===steps.length-1)close(true);else{index++;show()}};
 $("lds-tour-next").focus();
}
function start(){
 previousFocus=document.activeElement;index=0;open=true;show();
}
function mount(){
 let button=$("lds-tour-start");
 if(!button){
  const header=document.querySelector(".top .shell");
  if(!header)return;
  button=document.createElement("button");button.id="lds-tour-start";button.className="btn lds-tour-launch";header.appendChild(button);
 }
 button.textContent=t("Start guided tour","ابدأ الجولة الإرشادية");
 button.onclick=start;
 if(!initialized){initialized=true;if(!localStorage.getItem(DONE))start();}
}
document.addEventListener("keydown",e=>{
 if(!open)return;
 if(e.key==="Escape"){e.preventDefault();close(false)}
 if(e.key==="Tab"){const d=$("lds-tour-overlay");if(!d)return;const buttons=[...d.querySelectorAll("button:not([disabled])")];if(!buttons.length)return;const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
});
window.LDSGuidedTour={mount,start,version:"1.6.2"};
})();
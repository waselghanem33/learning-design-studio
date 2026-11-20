/* Learning resource attachments, stored locally within the design JSON. */
(function(){
"use strict";
const key="lds-design";
const maxBytes=350*1024;
const escapeHTML=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function mount(design,lang){
 const t=(en,ar)=>lang==="ar"?ar:en;
 document.querySelectorAll("[data-attachments]").forEach(root=>{
  const i=Number(root.dataset.attachments),activity=design.activities[i];
  if(!activity)return;
  if(!Array.isArray(activity.attachments))activity.attachments=[];
  const persist=()=>{try{localStorage.setItem(key,JSON.stringify(design));return true}catch{alert(t("Browser storage is full. Remove a file or use smaller attachments.","امتلأت مساحة التخزين في المتصفح. احذف ملفاً أو استخدم مرفقات أصغر."));return false}};
  const title=document.createElement("input");title.type="text";title.placeholder=t("Resource title (optional)","عنوان المورد (اختياري)");title.setAttribute("aria-label",title.placeholder);
  const url=document.createElement("input");url.type="url";url.placeholder="https://...";url.setAttribute("aria-label",t("Published resource URL","رابط المورد المنشور"));
  const add=document.createElement("button");add.type="button";add.className="btn";add.textContent=t("＋ Add resource link","＋ إضافة رابط مورد");
  const file=document.createElement("input");file.type="file";file.accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.md,.txt,.html,.ppt,.pptx";file.style.display="none";
  const upload=document.createElement("button");upload.type="button";upload.className="btn";upload.textContent=t("＋ Import resource file","＋ إرفاق ملف محلي صغير");
  const status=document.createElement("p");status.setAttribute("role","status");const pending=document.createElement("div");pending.hidden=true;
  const list=document.createElement("div");list.style.margin="10px 0";
  const help=document.createElement("small");help.className="muted";help.textContent=t("Local files: maximum 350 KB each. Stored inside this browser's design, not publicly accessible. For larger PDFs, images or student access, upload to Moodle/Drive first and add its link. Export JSON to back up local attachments.","الملفات المحلية: حتى ٣٥٠ كيلوبايت لكل ملف. تحفظ ضمن التصميم في هذا المتصفح فقط وليست عامة. للملفات الأكبر أو لمشاركة الطلبة، ارفعها إلى Moodle أو Drive وأضف رابطها. صدّر JSON لنسخ المرفقات احتياطياً.");
  [title,url,add,upload,file,pending,status,list,help].forEach(el=>root.appendChild(el));
  title.style.width="100%";url.style.width="100%";url.style.marginTop="6px";add.style.margin="8px 8px 8px 0";upload.style.margin="8px 0";
  function render(){
   list.replaceChildren();
   if(!activity.attachments.length){const p=document.createElement("p");p.className="muted";p.textContent=t("No resources attached yet.","لا توجد موارد مرفقة بعد.");list.appendChild(p)}
   activity.attachments.forEach((item,j)=>{
    const row=document.createElement("div");row.style.cssText="display:flex;align-items:center;flex-wrap:wrap;gap:10px;padding:9px 0;border-bottom:1px solid #ddd";
    const label=document.createElement("span");label.textContent=item.title||item.name||item.url;label.style.cssText="flex:1;overflow-wrap:anywhere";row.appendChild(label);
    const open=document.createElement("button");open.type="button";open.className="btn";open.textContent=item.kind==="link"?t("Open","فتح"):t("Download","تنزيل");row.appendChild(open);
    open.onclick=()=>{if(item.kind==="link")window.open(item.url,"_blank","noopener,noreferrer");else if(item.data){const a=document.createElement("a");a.href=item.data;a.download=item.name||"resource";a.click()}};
    const remove=document.createElement("button");remove.type="button";remove.className="btn";remove.textContent=t("Remove","حذف");remove.onclick=()=>{const removed=activity.attachments.splice(j,1)[0];if(!persist()){activity.attachments.splice(j,0,removed);return}render()};row.appendChild(remove);list.appendChild(row);
   });
  }
  add.onclick=()=>{let parsed;try{parsed=new URL(url.value.trim());if(parsed.protocol!=="https:")throw Error()}catch{alert(t("Enter a valid HTTPS URL.","أدخل رابط HTTPS صالحاً."));return}
   const item={kind:"link",title:title.value.trim().slice(0,140)||parsed.hostname,url:parsed.href};
   activity.attachments.push(item);if(!persist()){activity.attachments.pop();return}title.value="";url.value="";render();status.textContent=t("Resource link saved.","تم حفظ رابط المورد.");
  };
  upload.onclick=()=>file.click();
  function stage(selected){
   if(!selected)return;
   pending.replaceChildren();pending.hidden=false;
   const info=document.createElement("p");info.textContent=selected.name+" · "+Math.ceil(selected.size/1024)+" KB";pending.appendChild(info);
   if(selected.size>maxBytes){info.textContent+=" — "+t("Too large for local storage. Upload to Moodle or Drive and add its link above.","الملف كبير. ارفعه إلى Moodle أو Drive وأضف رابطه أعلاه.");return}
   const confirm=document.createElement("button");confirm.type="button";confirm.className="btn primary";confirm.textContent=t("Confirm & attach resource","تأكيد وإرفاق المورد");pending.appendChild(confirm);
   const cancel=document.createElement("button");cancel.type="button";cancel.className="btn";cancel.textContent=t("Cancel","إلغاء");pending.appendChild(cancel);
   cancel.onclick=()=>{pending.hidden=true;pending.replaceChildren();file.value=""};
   confirm.onclick=()=>{confirm.disabled=true;cancel.disabled=true;const reader=new FileReader();
    reader.onerror=()=>{status.textContent=t("Unable to read the file. Try again.","تعذرت قراءة الملف. حاول مجدداً.");confirm.disabled=false;cancel.disabled=false};
    reader.onload=()=>{if(!root.isConnected)return;const item={kind:"file",name:selected.name,title:selected.name,size:selected.size,data:reader.result};
     activity.attachments.push(item);if(!persist()){activity.attachments.pop();confirm.disabled=false;cancel.disabled=false;return}
     pending.hidden=true;pending.replaceChildren();file.value="";render();status.textContent=t("✓ Resource attached and saved: ","✓ تم إرفاق المورد وحفظه: ")+selected.name;
    };reader.readAsDataURL(selected);
   };
  }
  file.onchange=()=>{stage(file.files&&file.files[0]);file.value=""};
  root.ldsImport=()=>{root.scrollIntoView({block:"center"});file.click()};
  root.ldsStage=selected=>{root.scrollIntoView({block:"center"});stage(selected)};
  render();
 });
}
window.LDSAttachments={mount};
})();
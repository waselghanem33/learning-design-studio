(function(){
"use strict";
const scope="https://www.googleapis.com/auth/drive.file";
let token="",expiry=0;
const key="lds-google-client-id";
async function connect(){
 const id=localStorage.getItem(key)||"";
 if(!id)throw Error("Configure your Google OAuth client ID first.");
 if(!window.google?.accounts?.oauth2)await new Promise((resolve,reject)=>{const s=document.createElement("script");s.src="https://accounts.google.com/gsi/client";s.onload=resolve;s.onerror=()=>reject(Error("Google sign-in unavailable"));document.head.appendChild(s)});
 return new Promise((resolve,reject)=>{const client=google.accounts.oauth2.initTokenClient({client_id:id,scope,callback:r=>{if(r.error){reject(Error(r.error));return}token=r.access_token;expiry=Date.now()+Number(r.expires_in)*1000;resolve()},error_callback:e=>reject(Error(e.type||"Sign-in cancelled"))});client.requestAccessToken({prompt:""})});
}
async function request(path,options={}){if(!token||Date.now()>=expiry)throw Error("Connect Google Drive first.");const res=await fetch("https://www.googleapis.com/"+path,{...options,headers:{...options.headers,Authorization:"Bearer "+token}});if(!res.ok)throw Error("Google Drive: "+res.status+" "+(await res.text()).slice(0,300));return res.json()}
async function upload(file){const body=new FormData();body.append("metadata",new Blob([JSON.stringify({name:file.name})],{type:"application/json"}));body.append("file",file);return request("upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",{method:"POST",body})}
function mount(d,lang){
 const t=(en,ar)=>lang==="ar"?ar:en;
 const host=document.getElementById("lds-drive-settings");if(!host)return;
 const add=(tag,txt,parent=host)=>{const e=document.createElement(tag);e.textContent=txt;parent.appendChild(e);return e};
 const button=(txt,parent=host)=>{const e=add("button",txt,parent);e.type="button";e.className="btn";return e};
 add("h3","Google Drive");const status=add("p",token&&Date.now()<expiry?t("Connected","متصل"):t("Not connected","غير متصل"));status.setAttribute("role","status");
 const config=add("details","");add("summary",t("One-time administrator configuration","إعداد المسؤول لمرة واحدة"),config);const id=add("input","",config);id.type="text";id.placeholder="Google OAuth web client ID";id.value=localStorage.getItem(key)||"";id.setAttribute("aria-label","Google OAuth client ID");button(t("Save client ID","حفظ معرف العميل"),config).onclick=()=>{localStorage.setItem(key,id.value.trim());token="";expiry=0;status.textContent=t("Configuration saved. Connect Drive.","تم حفظ الإعداد. اتصل بـ Drive.")};
 const c=button(t("Connect Google Drive","ربط Google Drive"));c.onclick=async()=>{try{await connect();status.textContent=t("Connected. Files remain private until you share them.","متصل. تبقى الملفات خاصة إلى أن تشاركها.")}catch(e){status.textContent=e.message}};
 button(t("Disconnect","قطع الاتصال")).onclick=()=>{if(token&&window.google?.accounts?.oauth2)google.accounts.oauth2.revoke(token,()=>{});token="";expiry=0;status.textContent=t("Disconnected","غير متصل")};
 document.querySelectorAll("[data-attachments]").forEach(root=>{const a=d.activities[Number(root.dataset.attachments)];if(!a)return;
 const wrap=document.createElement("div");root.prepend(wrap);const b=button(t("Save resource file directly to Drive","حفظ المورد مباشرة في Drive"),wrap);const file=add("input","",wrap);file.type="file";file.hidden=true;const msg=add("p","",wrap);msg.setAttribute("role","status");b.onclick=()=>{if(!token||Date.now()>=expiry){msg.textContent=t("Connect Google Drive above first.","اربط Google Drive أولاً.");return}file.click()};
 file.onchange=async()=>{const f=file.files[0];if(!f)return;b.disabled=true;try{const saved=await upload(f);const url=saved.webViewLink||"https://drive.google.com/open?id="+encodeURIComponent(saved.id);const item={kind:"link",title:saved.name,url,driveId:saved.id};a.attachments=a.attachments||[];a.attachments.push(item);try{localStorage.setItem("lds-design",JSON.stringify(d))}catch(e){a.attachments.pop();throw Error("File saved to Drive but link could not be stored: "+url)}msg.textContent=t("Saved to Drive and linked. Check sharing permissions.","تم الحفظ والربط. تحقق من أذونات المشاركة.");const link=add("a",saved.name,wrap);link.href=url;link.target="_blank";link.rel="noopener noreferrer"}catch(e){msg.textContent=e.message}finally{b.disabled=false;file.value=""}};
 });
}
window.LDSDrive={mount,upload,connect};
})();
(function(){
function minutes(a){return Math.max(0,Number(a.minutes)||0)}
function total(d){return (d.activities||[]).reduce((s,a)=>s+minutes(a),0)}
function context(d,a){const list=d.activities||[],i=list.indexOf(a),budget=Number(d.duration)||0,used=total(d),other=used-(i>=0?minutes(a):0);
return ["TIME BUDGET: planned "+budget+" min across before/during/after; allocated "+used+"; remaining "+(budget-used)+".",i>=0?"Current activity "+(i+1)+": earlier "+list.slice(0,i).reduce((s,x)=>s+minutes(x),0)+" min; later "+list.slice(i+1).reduce((s,x)=>s+minutes(x),0)+" min; maximum allowed for this activity "+Math.max(0,budget-other)+" min.":"", "Full ordered activity sequence (excluding attachment file data): "+JSON.stringify(list.map(x=>Object.fromEntries(["title","phase","type","minutes","group","mode","teacher","resource","assessment"].map(k=>[k,x[k]])))), "Build on prior activities, prepare for subsequent ones, avoid duplication. Include realistic task, transition and feedback time. Do not exceed the overall budget. If infeasible, explain the tradeoff and recommend a whole-design review; do not silently change other activities."].filter(Boolean).join("\n")}
function fits(d,oldMinutes,newMinutes){const before=total(d),after=before-Number(oldMinutes||0)+Number(newMinutes||0);return after<=Number(d.duration)||after<=before}
function redistribute(d){
 const list=d.activities||[],limit=Number(d.duration),n=list.length;
 if(!n||!Number.isSafeInteger(limit)||limit<n)throw Error("budget");
 const weights=list.map(a=>Math.max(1,minutes(a))),sum=weights.reduce((s,w)=>s+w,0);
 const quotas=weights.map(w=>w/sum*(limit-n)),out=quotas.map(q=>1+Math.floor(q));
 const order=quotas.map((q,i)=>({i,r:q-Math.floor(q)})).sort((a,b)=>b.r-a.r||a.i-b.i);
 const left=limit-out.reduce((s,v)=>s+v,0);for(let k=0;k<left;k++)out[order[k].i]++;
 return out;
}
function mount(d,lang,onApply){
 const root=document.getElementById("lds-redistribution");if(!root)return;
 const t=(en,ar)=>lang==="ar"?ar:en;
 const add=(tag,txt,parent=root)=>{const el=document.createElement(tag);el.textContent=txt;parent.appendChild(el);return el};
 const status=add("p","");status.setAttribute("role","status");
 const refresh=()=>{status.textContent=t("Planned / allocated / remaining: ","المخطط / المخصص / المتبقي: ")+d.duration+" / "+total(d)+" / "+(Number(d.duration)-total(d))+" min"};
 refresh();
 const trigger=add("button",t("Automatically redistribute activity time","إعادة توزيع وقت الأنشطة تلقائياً"));trigger.type="button";trigger.className="btn primary";
 const preview=add("div","");preview.hidden=true;
 const durationInput=document.querySelector('[data-field="duration"]');if(durationInput)durationInput.addEventListener("input",()=>{refresh();preview.hidden=true;preview.replaceChildren()});
 trigger.onclick=()=>{preview.replaceChildren();preview.hidden=false;let next;try{next=redistribute(d)}catch{add("p",t("Add activities and set a whole-minute budget of at least one minute per activity.","أضف الأنشطة وحدد مدة صحيحة لا تقل عن دقيقة لكل نشاط."),preview);return}
 add("p",t("Proportional allocation preserves relative activity time. Review task feasibility and update any time references in instructions or resources.","يحافظ التوزيع النسبي على الأوزان الزمنية. راجع قابلية التنفيذ وحدّث الأوقات في التعليمات والموارد."),preview);
 const table=add("table","",preview),head=add("tr","",table);for(const x of [t("Activity","النشاط"),t("Current","الحالي"),t("Proposed","المقترح")])add("th",x,head);
 d.activities.forEach((a,i)=>{const row=add("tr","",table);add("td",(i+1)+". "+(a.title||a.type),row);add("td",String(minutes(a)),row);add("td",String(next[i]),row)});
 add("p",t("New total: ","المجموع الجديد: ")+next.reduce((s,v)=>s+v,0)+" min",preview);
 const apply=add("button",t("Apply all durations","تطبيق جميع المدد"),preview);apply.type="button";apply.className="btn primary";
 const cancel=add("button",t("Cancel","إلغاء"),preview);cancel.type="button";cancel.className="btn";cancel.onclick=()=>{preview.hidden=true;preview.replaceChildren()};
 const snapshot=JSON.stringify([d.duration,d.activities.map(a=>[a.title,a.minutes])]);
 apply.onclick=()=>{if(snapshot!==JSON.stringify([d.duration,d.activities.map(a=>[a.title,a.minutes])])){add("p",t("Design changed. Recalculate first.","تغير التصميم. أعد الحساب أولاً."),preview);return}const old=d.activities.map(a=>a.minutes);d.activities.forEach((a,i)=>a.minutes=next[i]);try{localStorage.setItem("lds-design",JSON.stringify(d))}catch{d.activities.forEach((a,i)=>a.minutes=old[i]);add("p",t("Could not save. No durations changed.","تعذر الحفظ. لم تتغير المدد."),preview);return}onApply();const newRoot=document.getElementById("lds-redistribution");if(newRoot){const msg=document.createElement("p");msg.setAttribute("role","status");msg.textContent=t("All durations updated and saved.","تم تحديث جميع المدد وحفظها.");newRoot.appendChild(msg);newRoot.scrollIntoView({block:"nearest"})}};
 };
}
window.LDSTiming={total,context,fits,redistribute,mount};
})();
"use strict";
(function () {
  const KEY = "lds-v15-align", SNAP = "lds-v15-snapshots";
  const $ = id => document.getElementById(id);
  const tr = (en, ar) => document.documentElement.lang === "ar" ? ar : en;
  const esc = x => String(x ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const getDesign = () => read("lds-design", {});
  const outcomes = d => String(d.outcomes || "").split(/\r?\n|;|؛/).map(x => x.trim()).filter(Boolean);
  const activities = d => Array.isArray(d.activities) ? d.activities : [];
  const TYPES = ["Acquisition","Inquiry","Discussion","Practice","Collaboration","Production"];
  const outcomeKey = (x,i) => i + "|" + x;
  const activityKey = (x,i) => i + "|" + String(x.title || "");
  let state = read(KEY, {links:{}, notes:{}}), snapshots = read(SNAP, []);
  function linksFor(d) {
    const allowed = new Set(outcomes(d).map(outcomeKey)), result = {};
    activities(d).forEach((a,i) => {
      const k = activityKey(a,i);
      result[k] = (state.links[k] || []).filter(x => allowed.has(x));
    });
    return result;
  }
  function metrics(d, links) {
    const os = outcomes(d), as = activities(d);
    return {
      linked: os.map((o,i) => as.filter((a,j) => (links[activityKey(a,j)] || []).includes(outcomeKey(o,i))).length),
      unlinked: as.filter((a,i) => !(links[activityKey(a,i)] || []).length).length,
      unassessed: as.filter(a => !String(a.assessment || "").trim()).length,
      types: [...new Set(as.map(a => a.type))],
      total: as.reduce((n,a) => n + (Number(a.minutes) || 0), 0),
      duration: Number(d.duration) || 0
    };
  }
  function report(d, links) {
    const m = metrics(d,links), os = outcomes(d), as = activities(d);
    const lines = ["# Learning Design Alignment Report / تقرير مواءمة تصميم التعلم","","Module: "+(d.module||""),"Course: "+(d.course||""),"","## Outcomes / المخرجات"];
    os.forEach((o,i) => lines.push("LO"+(i+1)+": "+o+" ("+m.linked[i]+" linked activities)"));
    lines.push("","## Activities / الأنشطة");
    as.forEach((a,i) => lines.push("- "+(a.title||"Untitled")+" → "+(links[activityKey(a,i)]||[]).map(k=>"LO"+(Number(k.split("|")[0])+1)).join(", ")));
    lines.push("","## Structural checks","Unlinked activities: "+m.unlinked,"Missing assessment descriptions: "+m.unassessed,"Learning types: "+m.types.join(", "),"Total minutes: "+m.total+" / "+m.duration,"","## Instructor reflection",state.notes[d.module||""]||"","These are descriptive checks and instructor-confirmed links, not automated evidence of learning effectiveness.");
    return lines.join("\n");
  }
  function download(content) {
    const url = URL.createObjectURL(new Blob([content],{type:"text/markdown;charset=utf-8"}));
    const a = document.createElement("a"); a.href = url; a.download = "learning-alignment-report.md"; a.click();
    setTimeout(() => URL.revokeObjectURL(url),1000);
  }
  function render() {
    const root = $("alignment-root"); if (!root) return;
    const d = getDesign(), os = outcomes(d), as = activities(d), links = linksFor(d), m = metrics(d,links);
    const issues = [];
    if (!os.length) issues.push(tr("Add measurable outcomes in the design laboratory.","أضف مخرجات قابلة للقياس في مختبر التصميم."));
    if (!as.length) issues.push(tr("Add activities in the design laboratory.","أضف أنشطة في مختبر التصميم."));
    m.linked.forEach((n,i) => { if (!n) issues.push("LO"+(i+1)+": "+tr("No linked activity.","لا يوجد نشاط مرتبط.")); });
    if (m.unlinked) issues.push(m.unlinked+" "+tr("activities have no linked outcome.","أنشطة دون مخرج مرتبط."));
    if (m.unassessed) issues.push(m.unassessed+" "+tr("activities have no assessment description.","أنشطة دون وصف للتقييم."));
    if (m.duration && m.total !== m.duration) issues.push(tr("Time mismatch: ","اختلاف الوقت: ")+m.total+" / "+m.duration+" min");
    if (m.types.length < 3) issues.push(tr("Consider whether more learning-type variety supports the outcomes.","تأمل ما إذا كان تنويع أنواع التعلم يخدم المخرجات."));
    const matrix = os.length && as.length ?
      '<div class="al-scroll"><table class="al-matrix"><thead><tr><th>'+tr("Activity","النشاط")+'</th>'+
      os.map((o,i)=>'<th title="'+esc(o)+'">LO'+(i+1)+'</th>').join("")+
      '</tr></thead><tbody>'+as.map((a,j)=>'<tr><th>'+esc(a.title||tr("Untitled","دون عنوان"))+'<small>'+esc(a.phase||"")+' · '+esc(a.type||"")+'</small></th>'+
      os.map((o,i)=>{const checked=(links[activityKey(a,j)]||[]).includes(outcomeKey(o,i));return '<td><label class="al-cell"><input type="checkbox" data-al-row="'+j+'" data-al-col="'+i+'" '+(checked?"checked":"")+' aria-label="'+esc((a.title||"Activity")+" LO"+(i+1))+'"><span>'+(checked?"✓":"·")+'</span></label></td>';}).join("")+'</tr>').join("")+'</tbody></table></div>'+
      '<div class="al-outcomes">'+os.map((o,i)=>'<p><strong>LO'+(i+1)+'</strong> '+esc(o)+' <span>('+m.linked[i]+')</span></p>').join("")+'</div>' :
      '<p class="warning">'+tr("Create a module with outcomes and activities first.","أنشئ وحدة بمخرجات وأنشطة أولاً.")+'</p>';
    root.innerHTML = '<div class="al-hero"><small>'+tr("Learning Design Studio · v1.5","استوديو تصميم التعلم · الإصدار 1.5")+'</small><h1>'+tr("Learning Alignment Studio","استوديو مواءمة التعلم")+'</h1><p>'+tr("Connect outcomes, activities and assessment with instructor-confirmed evidence.","اربط المخرجات والأنشطة والتقييم بأدلة يراجعها المدرس.")+'</p></div>'+
      '<div class="al-stats">'+[[os.length,tr("Outcomes","المخرجات")],[as.length,tr("Activities","الأنشطة")],[m.types.length+"/6",tr("Learning types","أنواع التعلم")],[m.total+" / "+(m.duration||"—"),tr("Minutes","الدقائق")]].map(x=>'<div><strong>'+x[0]+'</strong><span>'+x[1]+'</span></div>').join("")+'</div>'+
      '<section class="card al-section"><h2>1. '+tr("Outcome–activity alignment matrix","مصفوفة مواءمة المخرجات والأنشطة")+'</h2><p>'+tr("Check each link you can justify. Links are instructor judgments, not AI-generated scores.","حدد كل ارتباط تستطيع تبريره. الروابط أحكام المدرس وليست درجات آلية.")+'</p>'+matrix+'</section>'+
      '<section class="card al-section"><h2>2. '+tr("Design quality checks","فحوص جودة التصميم")+'</h2><p>'+tr("These structural indicators suggest questions, not definitive judgments.","هذه مؤشرات بنيوية تثير أسئلة وليست أحكاماً نهائية.")+'</p>'+
      (issues.length?'<div class="al-issues">'+issues.map(x=>'<p>⚠ '+esc(x)+'</p>').join("")+'</div>':'<p class="al-good">'+tr("No structural gaps detected. Peer review is still recommended.","لم تُكتشف فجوات بنيوية. لا تزال مراجعة الأقران مهمة.")+'</p>')+
      '<h3>'+tr("Learning-type distribution","توزيع أنواع التعلم")+'</h3>'+TYPES.map(type=>{const n=as.filter(a=>a.type===type).reduce((sum,a)=>sum+(Number(a.minutes)||0),0),pct=m.total?Math.round(n/m.total*100):0;return '<div class="al-bar"><span>'+type+'</span><div><i style="width:'+pct+'%"></i></div><strong>'+n+'m</strong></div>';}).join("")+'</section>'+
      '<section class="card al-section"><h2>3. '+tr("Instructor reflection and export","تأمل المدرس والتصدير")+'</h2><label for="al-notes">'+tr("Explain changes you would make and why.","اشرح التعديلات التي ستجريها ولماذا.")+'</label><textarea id="al-notes" rows="4">'+esc(state.notes[d.module||""]||"")+'</textarea><div class="al-actions"><button class="btn primary" id="al-save">'+tr("Save reflection","حفظ التأمل")+'</button><button class="btn" id="al-snapshot">'+tr("Save before/after snapshot","حفظ نسخة للمقارنة")+'</button><button class="btn" id="al-export">'+tr("Download report","تنزيل التقرير")+'</button></div><p id="al-status" role="status"></p></section>'+
      '<section class="card al-section"><h2>4. '+tr("Before-and-after comparison","مقارنة التصميم قبل وبعد")+'</h2><p>'+tr("Save a snapshot before editing the module, then compare it with your current design.","احفظ نسخة قبل تعديل الوحدة ثم قارنها بالتصميم الحالي.")+'</p><div class="al-actions"><select id="al-compare"><option value="">'+tr("Select saved snapshot","اختر نسخة محفوظة")+'</option>'+snapshots.map((x,i)=>'<option value="'+i+'">'+esc(x.label)+'</option>').join("")+'</select><button class="btn" id="al-delete">'+tr("Delete selected snapshot","حذف النسخة المختارة")+'</button></div><div id="al-comparison"></div></section>';
    root.querySelectorAll("[data-al-row]").forEach(input=>input.onchange=()=>{
      const j=Number(input.dataset.alRow),i=Number(input.dataset.alCol),k=activityKey(as[j],j),v=outcomeKey(os[i],i);
      const vals=(state.links[k]||[]).filter(x=>x!==v); if(input.checked)vals.push(v);state.links[k]=vals;write(KEY,state);render();
    });
    $("al-notes").oninput=e=>{state.notes[d.module||""]=e.target.value;write(KEY,state);};
    $("al-save").onclick=()=>{$("al-status").textContent=tr("Saved in this browser.","تم الحفظ في هذا المتصفح.");};
    $("al-export").onclick=()=>download(report(d,linksFor(d)));
    $("al-snapshot").onclick=()=>{
      if(snapshots.length>=20){$("al-status").textContent=tr("Limit: 20 snapshots. Delete one first.","الحد 20 نسخة. احذف نسخة أولاً.");return;}
      snapshots.push({label:(d.module||"Module")+" · "+new Date().toLocaleString(),design:JSON.parse(JSON.stringify(d)),links:JSON.parse(JSON.stringify(linksFor(d)))});
      write(SNAP,snapshots);render();$("al-status").textContent=tr("Snapshot saved.","تم حفظ النسخة.");
    };
    $("al-compare").onchange=e=>{
      const idx=e.target.value;if(idx===""){$("al-comparison").innerHTML="";return;}
      const old=snapshots[Number(idx)],before=metrics(old.design,old.links),values=[
        [tr("Outcomes","المخرجات"),outcomes(old.design).length,os.length],
        [tr("Activities","الأنشطة"),activities(old.design).length,as.length],
        [tr("Learning types","أنواع التعلم"),before.types.length,m.types.length],
        [tr("Minutes","الدقائق"),before.total,m.total],
        [tr("Unlinked activities","أنشطة غير مرتبطة"),before.unlinked,m.unlinked],
        [tr("Missing assessments","تقييمات غير موصوفة"),before.unassessed,m.unassessed]
      ];
      $("al-comparison").innerHTML='<div class="al-scroll"><table class="al-matrix"><thead><tr><th>'+tr("Indicator","المؤشر")+'</th><th>'+tr("Before","قبل")+'</th><th>'+tr("Now","الآن")+'</th></tr></thead><tbody>'+values.map(v=>'<tr><th>'+v[0]+'</th><td>'+v[1]+'</td><td>'+v[2]+'</td></tr>').join("")+'</tbody></table></div><p>'+tr("Counts are descriptive and do not prove improved learning.","الأعداد وصفية ولا تثبت تحسن التعلم.")+'</p>';
    };
    $("al-delete").onclick=()=>{const idx=$("al-compare").value;if(idx==="")return;if(!confirm(tr("Delete this snapshot?","حذف هذه النسخة؟")))return;snapshots.splice(Number(idx),1);write(SNAP,snapshots);render();};
  }
  window.LDSAlignment={render,version:"1.5.0",report:()=>report(getDesign(),linksFor(getDesign()))};
})();
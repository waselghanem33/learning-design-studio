(function(){
function minutes(a){return Math.max(0,Number(a.minutes)||0)}
function total(d){return (d.activities||[]).reduce((s,a)=>s+minutes(a),0)}
function context(d,a){const list=d.activities||[],i=list.indexOf(a),budget=Number(d.duration)||0,used=total(d),other=used-(i>=0?minutes(a):0);
return ["TIME BUDGET: planned "+budget+" min across before/during/after; allocated "+used+"; remaining "+(budget-used)+".",i>=0?"Current activity "+(i+1)+": earlier "+list.slice(0,i).reduce((s,x)=>s+minutes(x),0)+" min; later "+list.slice(i+1).reduce((s,x)=>s+minutes(x),0)+" min; maximum allowed for this activity "+Math.max(0,budget-other)+" min.":"", "Full ordered activity sequence (excluding attachment file data): "+JSON.stringify(list.map(x=>Object.fromEntries(["title","phase","type","minutes","group","mode","teacher","resource","assessment"].map(k=>[k,x[k]])))), "Build on prior activities, prepare for subsequent ones, avoid duplication. Include realistic task, transition and feedback time. Do not exceed the overall budget. If infeasible, explain the tradeoff and recommend a whole-design review; do not silently change other activities."].filter(Boolean).join("\n")}
function fits(d,oldMinutes,newMinutes){const before=total(d),after=before-Number(oldMinutes||0)+Number(newMinutes||0);return after<=Number(d.duration)||after<=before}
window.LDSTiming={total,context,fits};
})();
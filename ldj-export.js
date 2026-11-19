"use strict";
/* LDJ exporter based on an actual UCL Learning Designer .ldj sample (test1.ldj).
   A structural match is verified; live import into UCL must still be acceptance-tested. */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.LDSLDJ=api;
})(typeof window!=="undefined"?window:null,function(){
 const types={Acquisition:"Read",Inquiry:"Investigate",Discussion:"Discuss",Practice:"Practice",Collaboration:"Collaborate",Production:"Produce"};
 const bool=v=>v===true||v==="true"||/present|facilitat|available|yes|حاضر|متاح/i.test(String(v||""));
 const modeOnline=v=>/online|blended|hybrid|remote|افتراض|مدمج|عن بعد/i.test(String(v||""));
 const group=v=>{const n=parseInt(v,10);return Number.isInteger(n)&&n>0?String(n):"1"};
 const duration=v=>{const n=Number(v);return Number.isFinite(n)&&n>0?String(n):"0"};
 function validate(d){
  const issues=[];
  if(!d||typeof d!=="object")return ["Missing design"];
  if(!String(d.module||"").trim())issues.push("Module title is required");
  if(!Array.isArray(d.activities)||!d.activities.length)issues.push("At least one activity is required");
  (d.activities||[]).forEach((a,i)=>{
   if(!types[a.type])issues.push("Activity "+(i+1)+": unknown learning type");
   if(!String(a.title||"").trim())issues.push("Activity "+(i+1)+": title is required");
   if(Number(a.minutes)<=0||!Number.isFinite(Number(a.minutes)))issues.push("Activity "+(i+1)+": duration must be positive");
  });
  return issues;
 }
 function encode(d,opts={}){
  const errors=validate(d);if(errors.length)throw new Error(errors.join("; "));
  const acts=d.activities.map((a,i)=>({
   title:String(a.title).trim(),resources:[],notes:"Phase: "+String(a.phase||"during"),
   teachingMethod:"",slas:[{type:types[a.type],assessmentType:String(a.assessment||""),
    groupSize:group(a.group),groupSizeSameAsSession:false,duration:duration(a.minutes),
    tutorAvailable:String(bool(a.teacher)),onlineActivity:String(modeOnline(a.mode)),
    syncActivity:String(/face to face|in.person|synchronous|حضوري|متزامن/i.test(String(a.mode||""))),
    resources:[],description:String(a.resource||"")}],isCustom:true
  }));
  const total=d.activities.reduce((s,a)=>s+Number(a.minutes),0);
  return {name:String(d.module),type:"session",author:String(opts.author||""),
   exportedOn:Date.now(),topic:String(d.course||d.discipline||""),
   learningTime:String(d.duration||total),groupSize:group(opts.groupSize||"1"),
   description:String(d.problem||""),modeOfDelivery:"Blended",
   aims:String(d.problem||""),outcomes:String(d.outcomes||"").split(/\r?\n/).filter(Boolean),
   activities:acts,designedTime:String(total),user_generated_charts:[]};
 }
 function exportText(d,opts){return JSON.stringify(encode(d,opts),null,2)}
 return {types,validate,encode,exportText};
});

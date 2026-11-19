"use strict";
/*
 * UCL Learning Designer export preparation.
 * IMPORTANT: This is an intermediate normalized representation, NOT an LDJ encoder.
 * Do not rename JSON output to .ldj without a genuine LDJ fixture and round-trip test.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.LDSLDJ=api;
})(typeof window!=="undefined"?window:null,function(){
 const types={Acquisition:"Read Watch Listen",Inquiry:"Investigate",Discussion:"Discuss",Practice:"Practice",Collaboration:"Collaborate",Production:"Produce"};
 const phases=["before","during","after"];
 function normalize(design){
  if(!design||typeof design!=="object")throw new Error("Design is required");
  const issues=[];
  const activities=Array.isArray(design.activities)?design.activities:[];
  if(!String(design.module||"").trim())issues.push("Module title is missing");
  if(!activities.length)issues.push("No learning activities");
  const mapped=activities.map((a,i)=>{
   if(!types[a.type])issues.push("Activity "+(i+1)+": unsupported learning type");
   if(!phases.includes(a.phase))issues.push("Activity "+(i+1)+": invalid phase");
   const minutes=Number(a.minutes);
   if(!Number.isFinite(minutes)||minutes<=0)issues.push("Activity "+(i+1)+": duration must be positive");
   return {title:String(a.title||""),phase:a.phase,learningType:types[a.type]||null,minutes,
    groupSize:String(a.group||""),teacherPresence:String(a.teacher||""),deliveryMode:String(a.mode||""),
    studentGuidance:String(a.resource||""),assessment:String(a.assessment||"")};
  });
  const total=mapped.reduce((s,a)=>s+(Number.isFinite(a.minutes)?a.minutes:0),0);
  if(Number(design.duration)!==total)issues.push("Planned duration differs from activity total");
  return {schema:"lds-ldj-intermediate-v1",status:"NOT_LDJ",module:String(design.module||""),
   course:String(design.course||""),discipline:String(design.discipline||""),
   authenticProblem:String(design.problem||""),outcomes:String(design.outcomes||"").split(/\r?\n/).filter(Boolean),
   plannedMinutes:Number(design.duration)||0,totalMinutes:total,activities:mapped,issues};
 }
 return {normalize,types};
});

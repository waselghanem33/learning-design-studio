/* Configure the deployed HTTPS Worker URL here, never an API key. */
window.LDS_AI_ENDPOINT = ""; // Example: https://learning-design-ai.your-subdomain.workers.dev
window.LDSDirectAI = {
 async generate(prompt) {
  const endpoint=window.LDS_AI_ENDPOINT;
  if(!endpoint || !/^https:\/\//.test(endpoint)) throw Error("AI backend not configured. Deploy the backend and set LDS_AI_ENDPOINT in ai-config.js.");
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),45000);
  try {
   const response=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt}),signal:controller.signal});
   let data;try{data=await response.json()}catch{throw Error("AI server returned an invalid response")}
   if(!response.ok)throw Error(data.error||"AI generation failed");
   if(typeof data.text!=="string"||!data.text.trim())throw Error("AI returned an empty response");
   return data.text.trim();
  }finally{clearTimeout(timer)}
 }
};
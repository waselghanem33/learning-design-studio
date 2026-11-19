/* Configure the deployed HTTPS Worker URL here, never an API key. */
window.LDS_AI_ENDPOINT = "https://learning-design-ai.waselghanem3.workers.dev";// Example: https://learning-design-ai.your-subdomain.workers.dev
window.LDSDirectAI = {
 async generate(prompt) {
  const endpoint=window.LDS_AI_ENDPOINT;
  if(!endpoint || !/^https:\/\//.test(endpoint)) throw Error("AI backend not configured. Deploy the backend and set LDS_AI_ENDPOINT in ai-config.js.");
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),45000);
  try {
   const response=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt}),signal:controller.signal});
   let data;try{data=await response.json()}catch{throw Error("AI server returned an invalid response")}
   if(!response.ok){const message=String(data.error||"AI generation failed");const error=new Error(message);error.status=response.status;error.code=response.status===429?(/quota|credit|billing|insufficient_quota/i.test(message)?"quota":"rate_limit"):response.status===401||response.status===403?"auth":"unavailable";throw error;}
   if(typeof data.text!=="string"||!data.text.trim())throw Error("AI returned an empty response");
   return data.text.trim();
  }finally{clearTimeout(timer)}
 }
};

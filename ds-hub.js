(()=>{
'use strict';
const core=window.DreamSpecCore,{esc,safeUrl,GOALS}=core;
let preview=null,previewSignature='',busy=false,apiKey='',diagnosis=null,diagnoseRequest=null;
function message(id,text){const node=document.querySelector('#'+id);if(node)node.textContent=text}
function status(text){if(typeof toast==='function')toast(text)}
function signature(){return JSON.stringify({vehicle:state.vehicleId,build:state.build,meta:state.buildMeta})}
function goal(){return document.querySelector('#guidedGoal').value}
// The compressor housing wraps around the wheel and exits through a flanged outlet.
const turbine = '<path d="M12 3h9v5h-6a8 8 0 1 1-3-5Z" fill="currentColor" fill-opacity=".1"/><path d="M21 2v7M12 2v3"/><circle cx="10" cy="14" r="5.5"/>'+Array.from({length:8},(_,index)=>'<path transform="rotate('+index*45+' 10 14)" d="M10 13q3-2 1.2-4.1-2.3 1-2.3 3.7" stroke-width=".8"/>').join('')+'<circle cx="10" cy="14" r="1.2" fill="currentColor"/><path d="M5 21v2h9v-2"/>';
const passenger = '<circle cx="12" cy="4" r="2.5"/><path d="M8 21v-7l-1 4H4l2-7q.6-2.5 4-3h4q3.4.5 4 3l2 7h-3l-1-4v7H8Zm1-2 7-10"/>';
const goalArt = {
 power: turbine,
 reliability: '<path d="m12 2 8 3v6q0 7-8 11-8-4-8-11V5z"/><path d="m8 12 3 3 5-6"/>',
 handling: '<g transform="translate(-1 4) scale(.7)"><path d="M3 13a9.2 9.2 0 1 1 18 0c-.4 2.8-2.1 5.2-4.5 7h-9C5.1 18.2 3.4 15.8 3 13Z" stroke-width="2.6"/><path d="M3 10.5 9 12l2 7h2l2-7 6-1.5M9 12q3-3 6 0"/><circle cx="12" cy="13" r="1.4"/><path d="M12 2v2.5" stroke-width="2.4"/></g><path d="M20 2v3m-3 0h6l-6 3 6 3-6 3 6 3h-6m3 0v5m-3 0h6" stroke-width="1.4"/>',
 offroad: '<path d="m1 20 8-13 4 6 3-9 7 16zm5-8 3 2 2-3"/>',
 lightweight: '<path d="M4 19C0 9 11 2 22 2c0 10-7 20-17 17M2 22 17 7m-7 7h5"/>',
 safety: passenger,
 balanced: '<path d="M12 6v15m-4 1h8M2 8l10-3 10 3M1 17q4 5 8 0zm14 0q4 5 8 0z"/><g transform="translate(1 9) scale(.36)">'+turbine+'</g><g transform="translate(15 9) scale(.4)">'+passenger+'</g>',
 track: '<path d="M5 20c-4 0-4-5-2-8l4-7q1-2 4-2h6q5 0 5 4t-5 4h-3l-4 7q-1 2-5 2z"/><path d="m6 16 5-9h6" stroke-dasharray="2 2"/>'
};
const improvements=[
 ['Engine and Powertrain','power',{'Air Intakes & Filters':'intake|air filter','Exhaust Systems':'exhaust|muffler|header','ECU Tuning & Reprogramming':'ecu|tuning|reflash','Forced Induction':'turbo|supercharger|intercooler','Ignition & Spark':'ignition|spark plug','Fuel System':'fuel|injector','Cooling System':'cooling|radiator|water pump'}],
 ['Handling and Suspension','handling',{'Suspension & Coilovers':'suspension|coilover|damper','Sway Bars & Anti-Roll Bars':'sway bar|anti.roll','Bushings':'bushing','Wheels and Tires':'wheel|tire','Alignment & Corner Balancing':'alignment|camber|corner balanc'}],
 ['Brakes and Drivetrain','safety',{'Brake Upgrades':'brake|rotor|caliper','Clutch & Flywheel':'clutch|flywheel','Differential & Gearing':'differential|final drive|ring and pinion','Short Shifters / Shift Kits':'shifter|shift kit'}],
 ['Weight Reduction and Aerodynamics','lightweight',{'Weight Reduction':'weight.reduction|lightweight','Aerodynamic Body Kits':'aero|splitter|diffuser|spoiler'}],
 ['Interior, Electronics, and Comfort','balanced',{'Infotainment & Audio':'audio|speaker|infotainment','Sound Deadening':'sound deadening|sound damping','Seating & Controls':'seat|steering wheel|pedal','Lighting':'lighting|headlight|taillight'}],
 ['Safety','reliability',{'Roll Cages & Roll Bars':'roll[ -]?(cage|bar)','Fire Extinguishers & Suppression Systems':'fire (extinguisher|suppression)|fire bottle','Drag Racing Parachutes':'parachute','Racing Harnesses':'racing harness|safety harness|point harness','Window Nets & Arm Restraints':'window net|arm restraint','Battery Cutoff Switches':'battery (cutoff|cut.off|disconnect)|master kill switch'}]
];
const types=[
 ['Motorsport & Performance Builds','track',{'Track / Road Course':'track','Drag Racing (Pro Street / Drag)':'power','Drift':'handling','Rally / Rallycross':'offroad','Formula / Scratch-Built':'track'}],
 ['Street, Show & Aesthetic Builds','balanced',{'Daily Driver':'balanced','VIP':'balanced','Static':'handling','Bagged':'handling','Donks / High-Riser':'balanced'}],
 ['Off-Road, Utility & Heritage Builds','offroad',{'Overland / Off-Road':'offroad','Hot Rod / Street Rod':'power','Rat Rod':'balanced','Pro Touring':'handling','Restomod':'balanced'}]
];
const chosenImprovements=new Set(), chosenTypes=new Set();
const patterns=Object.assign({},...improvements.map(group=>group[2]));
const typeGoals=Object.assign({},...types.map(group=>group[2]));
function renderGoals(){
 for(const [target,groups,kind] of [['improveCards',improvements,'improvement'],['typeCards',types,'type']]){
  document.getElementById(target).innerHTML=groups.map(([name,icon,items])=>
   '<details class="goal-branch"><summary class="ds-goal-tile"><svg class="goal-icon" viewBox="-1 -1 26 26" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">'+goalArt[icon]+'</svg><strong>'+esc(name.toUpperCase())+'</strong></summary><div class="branch-options">'+Object.keys(items).map(label=>'<button type="button" class="branch-choice" data-kind="'+kind+'" data-choice="'+esc(label)+'" aria-pressed="false">'+esc(label==='Overland / Off-Road'?'OFF-ROAD':label.toUpperCase())+'</button>').join('')+'</div></details>').join('');
 }
 syncChoices();
}
function syncChoices(){
 const blend=document.getElementById('blendTypes').checked;
 for(const button of document.querySelectorAll('[data-choice]')){
  const isType=button.dataset.kind==='type',selected=(isType?chosenTypes:chosenImprovements).has(button.dataset.choice);
  button.setAttribute('aria-pressed',String(selected));
  button.disabled=isType&&blend&&!selected&&chosenTypes.size>=4;
 }
 document.getElementById('choiceSummary').textContent=[...chosenImprovements,...chosenTypes].map(x=>x==='Overland / Off-Road'?'Off-Road':x).join(' · ');
}
function changeChoices(){
 document.getElementById('guidedGoal').value=typeGoals[[...chosenTypes][0]]||'balanced';
 preview=null;syncChoices();renderPlan();
}
let budgetRevision=0;
async function budgetInUSD(){
 const amount=document.getElementById('guidedBudget').value;
 const currency=document.getElementById('budgetCurrency').value;
 const revision=budgetRevision;
 if(currency==='USD')return {usd:amount===''?null:Number(amount),currency,rate:1};
 const response=await fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols='+encodeURIComponent(currency),{signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw new Error('Currency rates are unavailable. Try again or select USD.');
 const data=await response.json(),rate=data.rates?.[currency];
 if(revision!==budgetRevision)throw new Error('Budget changed. Preview your plan again.');
 if(!Number.isFinite(rate)||rate<=0)throw new Error('A valid currency rate is unavailable.');
 return {usd:amount===''?null:Number(amount)/rate,currency,rate,date:data.date};
}
function renderPlan(){
 const root=document.querySelector('#guidedPlan');
 if(!preview){root.innerHTML='';return}
 const p=preview,fmt=n=>new Intl.NumberFormat(undefined,{style:'currency',currency:p.currency||'USD'}).format(n*(p.fxRate||1));
 root.innerHTML='<div class="ds-plan-summary"><div><span>Known parts cost</span><strong>'+fmt(p.knownParts)+'</strong></div><div><span>Known install time</span><strong>'+p.knownHours.toFixed(1)+' hr'+(p.unknownHours?' + unknowns':'')+'</strong></div><div><span>Labor at your rate</span><strong>'+(p.laborRate?fmt(p.knownLabor)+(p.unknownHours?' + unknowns':''):'Rate not set')+'</strong></div></div><section class="ds-card"><span class="eyebrow">The work behind the build</span><p>'+esc(p.work)+'</p>'+p.messages.map(t=>'<p class="ds-notice">'+esc(t)+'</p>').join('')+'</section>'+p.picks.map(part=>'<article class="ds-plan-part"><div><span class="eyebrow">'+esc(part.category)+'</span><h3>'+esc(part.brand+' '+part.name)+'</h3><p>'+esc(part.install?.difficulty||'Install difficulty unknown')+' · '+(core.hours(part)==null?'Install time unknown':core.hours(part)+' hr planning estimate')+'</p><p>'+(part.requires?.length?'Recorded supporting requirements are included or already in your build.':'Follow the linked manufacturer instructions for this exact part.')+'</p></div><div><strong>'+(core.price(part)==null?'Price unknown':fmt(core.price(part)))+'</strong><button type="button" class="button secondary small" data-plan-detail="'+esc(part.id)+'">Details and sources</button></div></article>').join('')+(p.picks.length?'<button id="applyGuidedPlan" class="button primary" type="button">Add this plan to my build sheet ↗</button>':'');
}
async function generate(){
 let budget;
 try{budget=await budgetInUSD()}catch(error){status(error.message);return}
 const selected=vehicle();if(!selected)return;
 preview=core.draftPlan({parts:DATA.parts,vehicleId:selected.id,goal:goal(),goals:[...chosenTypes].map(type=>typeGoals[type]),candidateFilter:chosenImprovements.size?part=>[...chosenImprovements].some(choice=>new RegExp(patterns[choice],'i').test([part.category,part.name,...(part.tags||[])].join(' '))):null,budget:budget.usd,laborRate:state.laborRate,existing:state.build,existingMeta:state.buildMeta});
 if(chosenTypes.size||chosenImprovements.size){
  preview.selection=[...chosenTypes,...chosenImprovements].map(name=>name==='Overland / Off-Road'?'Off-Road':name);
  const guidance=[...new Set([...chosenTypes].map(type=>GOALS[typeGoals[type]].work))];
  preview.work=[preview.selection.join(' · '),...(guidance.length?guidance:[preview.work])].join(' — ');
 }
 preview.currency=budget.currency;preview.fxRate=budget.rate;preview.budgetUSD=budget.usd;
 if(budget.date)preview.messages.push('Currency conversion uses reference rates dated '+budget.date+'.');
 previewSignature=signature();renderPlan();
}
function apply(){
 if(!preview?.picks.length)return;
 if(signature()!==previewSignature){generate();status('Your vehicle or build changed. Review the updated plan before adding it.');return}
 rememberUndo();
 for(const p of preview.picks)if(!state.build.includes(p.id)){state.build.push(p.id);state.buildMeta[p.id]={status:'planned',note:'Dream Spec '+GOALS[preview.goal].short+' plan. Verify final installation and supporting requirements.'}}
 state.goal=preview.goal;state.buildName=vehicle().year+' '+vehicle().make+' '+vehicle().model+' '+(preview.selection?.join(' + ')||GOALS[preview.goal].short)+' build';
 const budget=document.querySelector('#guidedBudget').value,rate=state.laborRate;
 if(budget!=='')state.budget=preview.budgetUSD;if(rate!=='')state.laborRate=Number(rate);
 saveState();renderAll();route('build');
}
function renderAccount(){
 const user=DSAuth.user,form=document.querySelector('#accountForm'),signed=document.querySelector('#signedInAccount');
 if(!form||!signed)return;form.hidden=!!user;signed.hidden=!user;
 message('accountEmail',user?.email||'');
 const recovery=!!window.DreamSpecPasswordRecovery;document.querySelector('#passwordRecoveryForm').hidden=!recovery;
 if(recovery)form.hidden=true;
}
async function accountSubmit(event){
 event.preventDefault();const form=event.currentTarget,button=event.submitter,action=button?.value||'login';
 button.disabled=true;message('accountStatus','Connecting…');
 try{
  const email=form.elements.email.value.trim(),password=form.elements.password.value;
  if(action==='signup'){if(password.length<12)throw new Error('Use at least 12 characters for a new password.');const r=await DSAuth.signUp(email,password);if(r.confirmationRequired){message('accountStatus','Check your email to confirm your account, then log in.');return}}
  else await DSAuth.signIn(email,password);
  form.elements.password.value='';message('accountStatus','Signed in.');route(DSAuth.consumeNext());
 }catch(e){message('accountStatus',e.message)}
 finally{button.disabled=false;renderAccount()}
}
function clearKey(){apiKey='';const input=document.querySelector('#diagnosisApiKey');if(input)input.value='';message('aiConnectionStatus','No AI key connected.');}
function renderAI(){
 const connected=!!apiKey;
 document.querySelector('#diagnosisKeyForm').hidden=connected;
 document.querySelector('#disconnectAI').hidden=!connected;
 document.querySelector('#diagnosisForm').hidden=!connected;
 message('aiConnectionStatus',connected?'OpenAI key connected for this tab. Calls use your API account.':'Connect your OpenAI API key to begin.');
 DSOwned.render();
}
function resultHtml(result){
 const safeLink=(url,label)=>safeUrl(url)?'<a href="'+esc(safeUrl(url))+'" target="_blank" rel="noopener noreferrer">'+esc(label)+'</a>':esc(label);
 return '<section class="ds-card"><span class="eyebrow">Diagnostic guidance · unconfirmed</span><h2>'+esc(result.summary)+'</h2><p>'+esc(result.urgency)+'</p><p>'+esc(result.limitations)+'</p></section>'+
 '<section class="ds-card"><h3>Possible causes</h3>'+result.causes.map(x=>'<div class="ds-diagnostic-item"><strong>'+esc(x.cause)+'</strong><p>'+esc(x.reason)+'</p></div>').join('')+'</section>'+
 '<section class="ds-card"><h3>Test before replacing</h3><ol class="ds-steps">'+result.steps.map(x=>'<li><strong>'+esc(x.action)+'</strong><p>'+esc(x.expected)+'</p><small>'+esc(x.safety)+'</small></li>').join('')+'</ol></section>'+
 '<section class="ds-card"><h3>Repair candidates</h3><p>Confirm the fault with the tests above before buying parts.</p>'+result.repairs.map(x=>'<div class="ds-diagnostic-item"><strong>'+esc(x.component)+'</strong><p>'+esc(x.when_confirmed)+'</p></div>').join('')+
 (result.catalog_parts?.length?'<h4>Source-listed catalog candidates</h4>'+result.catalog_parts.map(p=>'<p>'+safeLink(p.source_url,p.brand+' '+p.name)+' · '+esc(p.mpn||'Part number not established')+' · confirm exact application</p>').join(''):'<p>No exact catalog replacement was established. Use the confirmed component, engine and VIN to verify the OEM part number.</p>')+'</section>'+
 '<section class="ds-card"><h3>Community experience and reference material</h3>'+result.sources.map(s=>'<article class="ds-source">'+safeLink(s.url,s.title)+'<p>'+esc(s.note||'Retrieved reference; check the vehicle and engine match.')+'</p></article>').join('')+
 (!result.sources.length?'<p>No retrievable matching references were returned. This result has no verified forum-source support.</p>':'')+'</section>';
}
function showDiagnosis(){
 const root=document.querySelector('#diagnosisResult');if(!diagnosis){root.innerHTML='';return}
 root.innerHTML='<p class="ds-notice" role="status">'+(diagnosis.saved?'Saved to the selected vehicle’s service history as an unconfirmed diagnostic session.':'The result is ready, but history was not saved. Retry saving below without another AI call.')+'</p>'+(!diagnosis.saved?'<button class="button secondary" id="retryDiagnosisSave">Retry saving history</button>':'')+resultHtml(diagnosis.result);
}
async function runDiagnosis(event){
 event.preventDefault();if(busy)return;
 if(!apiKey||!DSAuth.user){clearKey();renderAI();return}
 const form=event.currentTarget,vehicleId=form.elements.vehicle.value,symptoms=form.elements.symptoms.value.trim(),codes=form.elements.codes.value.toUpperCase().split(/[\s,;]+/).filter(Boolean);
 if(!vehicleId)return message('diagnosisStatus','Save a vehicle in My Garage first.');
 if(codes.some(code=>!/^([PBCU][0-3][0-9A-F]{3})$/.test(code)))return message('diagnosisStatus','Use five-character OBD-II codes, such as P0171.');
 if(codes.length>15)return message('diagnosisStatus','Enter at most 15 trouble codes.');
 busy=true;form.elements.vehicle.disabled=true;form.querySelector('button[type="submit"]').disabled=true;message('diagnosisStatus','Researching sources and building a diagnostic plan…');
 const owner=DSAuth.user.id;diagnoseRequest=new AbortController();const timeout=setTimeout(()=>diagnoseRequest?.abort(),120000);
 try{
  await DSOwned.flush();const token=await DSAuth.token(),cfg=window.DREAM_SPEC_CONFIG;
  const response=await fetch(cfg.supabaseUrl+'/functions/v1/'+cfg.diagnoseFunction,{method:'POST',headers:{'Content-Type':'application/json',apikey:cfg.publishableKey,Authorization:'Bearer '+token,'X-DreamSpec-AI-Key':apiKey},body:JSON.stringify({vehicle_id:vehicleId,request_id:crypto.randomUUID(),symptoms,codes,model:cfg.diagnosisModel}),signal:diagnoseRequest.signal});
  const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'Diagnosis could not finish. Check your connection, key and API quota.');
  if(DSAuth.user?.id!==owner)return;
  diagnosis={...data,vehicleId};showDiagnosis();message('diagnosisStatus','Diagnostic plan ready.');
  if(DSOwned.active?.id===vehicleId)await DSOwned.loadEvents();
 }catch(e){if(DSAuth.user?.id===owner)message('diagnosisStatus',e.name==='AbortError'?'The request timed out or was cancelled. Check service history before starting a new diagnosis.':e.message)}
 finally{clearTimeout(timeout);busy=false;form.elements.vehicle.disabled=false;form.querySelector('button[type="submit"]').disabled=false}
}
async function retrySave(){
 if(!diagnosis||diagnosis.saved)return;
 try{await DSAuth.request('rpc/finish_diagnostic_run',{method:'POST',body:JSON.stringify({p_run_id:diagnosis.run_id,p_result:diagnosis.result})});diagnosis.saved=true;showDiagnosis();await DSOwned.loadEvents()}
 catch(e){message('diagnosisStatus',e.message)}
}
window.DSGuided={preview(profile={}){chosenImprovements.clear();chosenTypes.clear();document.getElementById('budgetCurrency').value='USD';document.getElementById('budgetLabel').textContent='BUDGET (USD)';budgetRevision++;const select=document.querySelector('#guidedGoal');select.value=GOALS[profile.primaryGoal]?profile.primaryGoal:'balanced';document.querySelector('#guidedBudget').value=profile.budget||'';renderGoals();route('goals');generate()}};
function init(){
 renderGoals();renderPlan();renderAccount();renderAI();
 document.querySelector('#goalCards').addEventListener('click',event=>{
  const button=event.target.closest('[data-choice]');if(!button)return;
  const isType=button.dataset.kind==='type',set=isType?chosenTypes:chosenImprovements,label=button.dataset.choice;
  if(set.has(label))set.delete(label);
  else{if(isType&&!document.getElementById('blendTypes').checked)set.clear();set.add(label)}
  changeChoices();
 });
 document.getElementById('blendTypes').onchange=event=>{
  if(!event.target.checked)for(const type of [...chosenTypes].slice(1))chosenTypes.delete(type);
  changeChoices();
 };
 for(const id of ['guidedBudget','budgetCurrency'])document.getElementById(id).addEventListener('input',()=>{
  budgetRevision++;preview=null;renderPlan();
  document.getElementById('budgetLabel').textContent='BUDGET ('+document.getElementById('budgetCurrency').value+')';
 });
 document.querySelector('#guidedPlanForm').addEventListener('submit',e=>{e.preventDefault();generate()});
 document.querySelector('#guidedPlan').addEventListener('click',e=>{if(e.target.closest('#applyGuidedPlan'))apply();const b=e.target.closest('[data-plan-detail]');if(b)showPart(b.dataset.planDetail)});
 document.querySelector('#accountForm').addEventListener('submit',accountSubmit);
 document.querySelector('#signOutButton').addEventListener('click',()=>DSAuth.signOut());
 document.querySelector('#forgotPassword').addEventListener('click',async()=>{const email=document.querySelector('#accountForm').elements.email.value.trim();if(!email)return message('accountStatus','Enter your email first.');try{await DSAuth.recover(email);message('accountStatus','If an account matches, a reset link will arrive by email.')}catch(e){message('accountStatus',e.message)}});
 document.querySelector('#passwordRecoveryForm').addEventListener('submit',async e=>{
  e.preventDefault();const form=e.currentTarget;
  try{await DSAuth.updatePassword(form.elements.password.value);form.reset();window.DreamSpecPasswordRecovery=false;renderAccount();message('accountStatus','Password updated.')}
  catch(err){message('accountStatus',err.message)}
 });
 document.querySelector('#diagnosisKeyForm').addEventListener('submit',e=>{e.preventDefault();const input=document.querySelector('#diagnosisApiKey'),value=input.value.trim();if(!/^sk-[A-Za-z0-9_-]{20,}$/.test(value))return message('aiConnectionStatus','Enter a valid OpenAI API key.');apiKey=value;input.value='';renderAI()});
 document.querySelector('#disconnectAI').addEventListener('click',()=>{diagnoseRequest?.abort();clearKey();renderAI()});
 document.querySelector('#diagnosisForm').addEventListener('submit',runDiagnosis);
 document.querySelector('#diagnosisResult').addEventListener('click',e=>{if(e.target.closest('#retryDiagnosisSave'))retrySave()});
 document.querySelector('#diagnoseVehicle').addEventListener('change',async e=>{diagnosis=null;showDiagnosis();message('diagnosisStatus','');try{await DSOwned.select(e.target.value)}catch(err){message('diagnosisStatus',err.message)}});
 DSAuth.ready.then(()=>{renderAccount();if(window.DreamSpecPasswordRecovery)route('account');else if(DSAuth.user&&DSAuth.hasPendingRoute&&state.route==='account')route(DSAuth.consumeNext())});
}
document.addEventListener('ds:auth',()=>{
 renderAccount();if(!DSAuth.user){clearKey();diagnoseRequest?.abort();diagnosis=null;showDiagnosis();renderAI();if(['garage','diagnose'].includes(state.route))route(state.route)}
});
document.addEventListener('ds:owned',()=>{DSOwned.render()});
document.addEventListener('ds:catalog-change',()=>{preview=null;renderPlan()});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

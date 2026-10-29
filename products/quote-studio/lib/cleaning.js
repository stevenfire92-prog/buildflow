import {normalizeQuote,totals,text} from './quote.js';
export const cleaningPackages=[
 {key:'regular',name:'Regular home clean',hours:3,scope:['Kitchen surfaces and sink','Bathroom fixtures and mirrors','Dust reachable surfaces','Vacuum and mop floors','Empty household bins']},
 {key:'deep',name:'Deep clean',hours:5,scope:['Regular cleaning tasks','Baseboards and reachable doors','Detailed bathroom and kitchen clean','Exterior appliance surfaces','Final room-by-room inspection']},
 {key:'moveout',name:'Move-in / move-out clean',hours:7,scope:['Deep cleaning tasks','Empty cupboards and drawers','Inside empty fridge and oven, if agreed','Closets and storage surfaces','Final walkthrough']}
];
export function makeCleaningQuote(key,options={}){
 const p=cleaningPackages.find(p=>p.key===key);if(!p)throw Error('Unknown cleaning package');
 const hours=Number(options.hours??p.hours),rate=Number(options.rate??0);
 return normalizeQuote({title:p.name,items:[{description:p.name+' — labour',quantity:hours,rate}],notes:'Scope: '+p.scope.join('; ')+'. Confirm property size, condition, access and exclusions before agreeing the final price.',checklist:p.scope.map(label=>({label,done:false})),jobCosts:{labourHours:hours,labourRate:0,supplies:0,travel:0,overhead:0}});
}
export function jobProfit(input){const q=normalizeQuote(input),c=q.jobCosts;
 const labour=Math.round(c.labourHours*c.labourRate*100),supplies=Math.round(c.supplies*100),travel=Math.round(c.travel*100),overhead=Math.round(c.overhead*100),cost=labour+supplies+travel+overhead;
 const t=totals(q),revenue=t.subtotal-t.discount,profit=revenue-cost;
 return {labour,supplies,travel,overhead,cost,revenue,profit,margin:revenue?Math.round(profit/revenue*10000)/100:null};
}
export function normalizeCustomer(c){return {id:text(c.id,80),name:text(c.name,100),email:text(c.email,150),phone:text(c.phone,40),address:text(c.address,300),notes:text(c.notes,1500)};}
export function dueFollowUps(quotes,today){return quotes.filter(q=>q.status==='sent'&&q.followUpDate&&q.followUpDate<=today).sort((a,b)=>a.followUpDate.localeCompare(b.followUpDate));}
function icsEscape(s){return text(s,2000).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');}
export function followUpCalendar(q){if(!/^\d{4}-\d{2}-\d{2}$/.test(q.followUpDate||''))throw Error('Set a follow-up date first');return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Se Fire Tech//Quote Studio//EN','BEGIN:VEVENT','UID:'+icsEscape(q.id)+'-followup@quote-studio','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''),'DTSTART;VALUE=DATE:'+q.followUpDate.replaceAll('-',''),'SUMMARY:'+icsEscape('Follow up: '+q.number+' — '+q.client),'DESCRIPTION:'+icsEscape('Review estimate '+q.number+' for '+q.client+'. Quote Studio does not send this reminder automatically.'),'BEGIN:VALARM','TRIGGER:-PT9H','ACTION:DISPLAY','DESCRIPTION:Estimate follow-up','END:VALARM','END:VEVENT','END:VCALENDAR',''].join('\r\n');}
// Approval exports intentionally exclude internal job costs and workflow data.
export function publicQuote(q){const {jobCosts,customerId,followUpDate,lastContacted,checklist,...publicFields}=normalizeQuote(q);return publicFields;}

export function text(value, max = 500) { return String(value ?? '').trim().slice(0, max); }
export function escapeHtml(value) { return text(value, 10000).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function decimal(value, name, max) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > max) throw new Error(`Invalid ${name}`);
  return n;
}
export function normalizeQuote(input) {
  if (!input || !Array.isArray(input.items) || !input.items.length || input.items.length > 50) throw new Error('Add between 1 and 50 line items');
  const items = input.items.map(item => ({description:text(item.description,200),quantity:decimal(item.quantity,'quantity',100000),rate:decimal(item.rate,'rate',1000000)}));
  if (items.some(i => !i.description || !i.quantity)) throw new Error('Each item needs a description and quantity');
  const date = /^\d{4}-\d{2}-\d{2}$/;
  return {
    number:text(input.number,40), business:text(input.business,100),businessEmail:text(input.businessEmail,150),businessAddress:text(input.businessAddress,300),
    client:text(input.client,100),clientEmail:text(input.clientEmail,150),clientAddress:text(input.clientAddress,300),
    title:text(input.title,150),notes:text(input.notes,2000),date:date.test(input.date)?input.date:new Date().toISOString().slice(0,10),
    validUntil:date.test(input.validUntil)?input.validUntil:'',currency:['CAD','USD','GBP','EUR'].includes(input.currency)?input.currency:'CAD',
    discount:decimal(input.discount ?? 0,'discount',100),tax:decimal(input.tax ?? 0,'tax',100),deposit:decimal(input.deposit ?? 0,'deposit',100),
    status:['draft','sent','accepted','declined'].includes(input.status)?input.status:'draft',items,
    customerId:text(input.customerId,80),followUpDate:date.test(input.followUpDate)?input.followUpDate:'',lastContacted:date.test(input.lastContacted)?input.lastContacted:'',
    checklist:(Array.isArray(input.checklist)?input.checklist:[]).slice(0,50).map(c=>({label:text(c.label,200),done:c.done===true})).filter(c=>c.label),
    jobCosts:Object.fromEntries(['labourHours','labourRate','supplies','travel','overhead'].map(k=>[k,decimal(input.jobCosts?.[k]??0,k,1000000)]))
  };
}
export function totals(q) {
  const subtotal=q.items.reduce((sum,i)=>sum+Math.round(i.quantity*i.rate*100),0);
  const discount=Math.round(subtotal*q.discount/100),tax=Math.round((subtotal-discount)*q.tax/100),total=subtotal-discount+tax;
  return {subtotal,discount,tax,total,deposit:Math.round(total*q.deposit/100)};
}
export function money(cents,currency='CAD') {return new Intl.NumberFormat('en-CA',{style:'currency',currency}).format(cents/100);}
export function quoteHtml(input, demo=false) {
  const q=normalizeQuote(input),t=totals(q),e=escapeHtml,m=n=>money(n,q.currency);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${e(q.number)} — Quote</title><style>body{font:15px/1.6 system-ui;color:#172c31;margin:0;padding:50px;max-width:800px;margin:auto}header{display:flex;justify-content:space-between;border-bottom:3px solid #167363;padding-bottom:25px}h1{font-size:38px;margin:0}h2{font-size:17px}p{white-space:pre-line}table{width:100%;border-collapse:collapse;margin:30px 0}th,td{text-align:left;padding:12px 7px;border-bottom:1px solid #dce5e3}td:last-child,th:last-child{text-align:right}.totals{margin-left:auto;max-width:320px}.totals p{display:flex;justify-content:space-between}.grand{font-size:22px;font-weight:700}.demo{border:1px solid #b8831e;background:#fffae9;padding:12px;margin-bottom:20px}footer{border-top:1px solid #ddd;margin-top:40px;font-size:12px;color:#52666a}@media print{body{padding:15px}button{display:none}thead{display:table-header-group}tr{break-inside:avoid}}</style></head><body>${demo?'<div class="demo">SAMPLE ESTIMATE · Preview export from Quote Studio</div>':''}<header><div><h2>${e(q.business||'Your business')}</h2><p>${e(q.businessAddress)}<br>${e(q.businessEmail)}</p></div><div><h1>QUOTE</h1><p>${e(q.number)}<br>Date: ${e(q.date)}${q.validUntil?'<br>Valid until: '+e(q.validUntil):''}</p></div></header><h2>Prepared for ${e(q.client||'Your customer')}</h2><p>${e(q.clientAddress)}<br>${e(q.clientEmail)}</p><h2>${e(q.title)}</h2><table><thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>${q.items.map(i=>`<tr><td>${e(i.description)}</td><td>${i.quantity}</td><td>${m(Math.round(i.rate*100))}</td><td>${m(Math.round(i.quantity*i.rate*100))}</td></tr>`).join('')}</tbody></table><div class="totals"><p><span>Subtotal</span><span>${m(t.subtotal)}</span></p>${q.discount?`<p><span>Discount (${q.discount}%)</span><span>−${m(t.discount)}</span></p>`:''}<p><span>Tax (${q.tax}%)</span><span>${m(t.tax)}</span></p><p class="grand"><span>Total ${q.currency}</span><span>${m(t.total)}</span></p>${q.deposit?`<p><span>Requested deposit (${q.deposit}%)</span><span>${m(t.deposit)}</span></p>`:''}</div><h2>Notes & terms</h2><p>${e(q.notes||'Thank you for considering this estimate.')}</p><footer>Estimate only. Status is recorded by the business, not proof of customer acceptance or payment. Tax rate is entered by the business.</footer></body></html>`;
}

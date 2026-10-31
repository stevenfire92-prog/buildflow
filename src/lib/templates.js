// Contract template definitions for Se Fire Contracts.
// Each template: id, name, blurb, fields[], render(data) -> sections[{heading, body[]}]
// Body paragraphs support {{fieldKey}} interpolation automatically.

const F = (key, label, type = 'text', extra = {}) => ({ key, label, type, ...extra });

export const TEMPLATES = [
  {
    id: 'freelance',
    name: 'Freelance Contract',
    blurb: 'Client ↔ freelancer project agreement with scope, fees and payment terms.',
    fields: [
      F('freelancerName', 'Freelancer name'),
      F('freelancerAddress', 'Freelancer address'),
      F('clientName', 'Client name'),
      F('clientAddress', 'Client address'),
      F('projectTitle', 'Project title'),
      F('scope', 'Scope of work', 'textarea', { placeholder: 'Describe deliverables, milestones, revisions...' }),
      F('startDate', 'Start date', 'date'),
      F('endDate', 'End date', 'date'),
      F('fee', 'Total fee', 'text', { placeholder: 'e.g. 2,500 USD' }),
      F('deposit', 'Upfront deposit', 'text', { placeholder: 'e.g. 50%' }),
      F('paymentTerms', 'Payment terms', 'textarea', { placeholder: 'e.g. Balance due within 14 days of final delivery via bank transfer.' }),
    ],
    render: (d) => [
      { heading: '1. Parties', body: [`This Freelance Contract ("Agreement") is entered into between ${d.freelancerName || '[Freelancer]'} ("Freelancer"), located at ${d.freelancerAddress || '[Address]'}, and ${d.clientName || '[Client]'} ("Client"), located at ${d.clientAddress || '[Address]'}.`] },
      { heading: '2. Project', body: [`Freelancer agrees to complete the following project: ${d.projectTitle || '[Project title]'}.`, `Scope of work: ${d.scope || '[Describe scope]'}.`] },
      { heading: '3. Term', body: [`Work begins on ${d.startDate || '[Start date]'} and is expected to be completed by ${d.endDate || '[End date]'}.`] },
      { heading: '4. Compensation', body: [`Client agrees to pay Freelancer a total fee of ${d.fee || '[Fee]'}.`, `An upfront deposit of ${d.deposit || '[Deposit]'} is due before work begins.`, `Payment terms: ${d.paymentTerms || '[Payment terms]'}.`] },
      { heading: '5. Ownership', body: ['Upon full payment, all deliverables become the exclusive property of the Client. Freelancer retains the right to display the work in a portfolio unless otherwise agreed in writing.'] },
      { heading: '6. Independent contractor', body: ['Freelancer is an independent contractor, not an employee of the Client, and is responsible for their own taxes and insurance.'] },
      { heading: '7. Termination', body: ['Either party may terminate with 14 days written notice. Client pays for all work completed through the termination date.'] },
      { heading: '8. Governing law', body: ['This Agreement is governed by the laws of the jurisdiction where the Freelancer resides, unless otherwise agreed in writing.'] },
    ],
  },
  {
    id: 'service',
    name: 'Service Agreement',
    blurb: 'Ongoing services between a provider and a client with term and fees.',
    fields: [
      F('providerName', 'Service provider name'),
      F('providerAddress', 'Service provider address'),
      F('clientName', 'Client name'),
      F('clientAddress', 'Client address'),
      F('serviceDescription', 'Description of services', 'textarea', { placeholder: 'What services will be provided?' }),
      F('startDate', 'Start date', 'date'),
      F('termMonths', 'Term (months)', 'text', { placeholder: 'e.g. 12' }),
      F('fee', 'Fee', 'text', { placeholder: 'e.g. 500 USD / month' }),
      F('paymentSchedule', 'Payment schedule', 'textarea', { placeholder: 'e.g. Monthly in advance, due on the 1st.' }),
      F('terminationDays', 'Termination notice (days)', 'text', { placeholder: 'e.g. 30' }),
    ],
    render: (d) => [
      { heading: '1. Parties', body: [`This Service Agreement is between ${d.providerName || '[Provider]'} ("Provider"), located at ${d.providerAddress || '[Address]'}, and ${d.clientName || '[Client]'} ("Client"), located at ${d.clientAddress || '[Address]'}.`] },
      { heading: '2. Services', body: [`Provider agrees to provide the following services: ${d.serviceDescription || '[Describe services]'}.`] },
      { heading: '3. Term', body: [`This Agreement begins on ${d.startDate || '[Start date]'} and continues for ${d.termMonths || '[Term]'} months, renewing automatically unless terminated.`] },
      { heading: '4. Fees and payment', body: [`Client agrees to pay ${d.fee || '[Fee]'}.`, `Payment schedule: ${d.paymentSchedule || '[Payment schedule]'}. Late payments may incur a 1.5% monthly charge.`] },
      { heading: '5. Confidentiality', body: ['Each party agrees to keep confidential information received from the other party strictly confidential.'] },
      { heading: '6. Termination', body: [`Either party may terminate with ${d.terminationDays || '[Notice]'} days written notice. Fees for services rendered through termination are due in full.`] },
      { heading: '7. Limitation of liability', body: ['Provider\'s total liability under this Agreement shall not exceed the fees paid in the three months preceding the claim.'] },
      { heading: '8. Governing law', body: ['This Agreement is governed by the laws of the jurisdiction where the Provider resides, unless otherwise agreed in writing.'] },
    ],
  },
  {
    id: 'nda',
    name: 'Non-Disclosure Agreement',
    blurb: 'Mutual NDA protecting confidential information shared between parties.',
    fields: [
      F('partyA', 'Party A name'),
      F('partyAAddress', 'Party A address'),
      F('partyB', 'Party B name'),
      F('partyBAddress', 'Party B address'),
      F('purpose', 'Purpose of disclosure', 'textarea', { placeholder: 'e.g. Evaluating a potential business partnership.' }),
      F('effectiveDate', 'Effective date', 'date'),
      F('termYears', 'Confidentiality term (years)', 'text', { placeholder: 'e.g. 3' }),
    ],
    render: (d) => [
      { heading: '1. Parties', body: [`This Non-Disclosure Agreement is between ${d.partyA || '[Party A]'} ("Party A"), located at ${d.partyAAddress || '[Address]'}, and ${d.partyB || '[Party B]'} ("Party B"), located at ${d.partyBAddress || '[Address]'}.`] },
      { heading: '2. Purpose', body: [`The parties wish to share confidential information for the following purpose: ${d.purpose || '[Purpose]'}.`] },
      { heading: '3. Confidential information', body: ['"Confidential Information" means any non-public information disclosed by either party, whether written, oral, or electronic, that is marked confidential or reasonably understood to be confidential.'] },
      { heading: '4. Obligations', body: ['The receiving party agrees to (a) hold Confidential Information in strict confidence, (b) use it solely for the Purpose above, and (c) not disclose it to any third party without prior written consent.'] },
      { heading: '5. Exclusions', body: ['Confidential Information does not include information that is publicly available, already known to the receiving party, independently developed, or received from a third party without restriction.'] },
      { heading: '6. Term', body: [`This Agreement is effective as of ${d.effectiveDate || '[Effective date]'} and the confidentiality obligations survive for ${d.termYears || '[Term]'} years from disclosure.`] },
      { heading: '7. Return of materials', body: ['Upon request, the receiving party shall promptly return or destroy all Confidential Information and certify destruction in writing.'] },
      { heading: '8. Governing law', body: ['This Agreement is governed by the laws of the jurisdiction where Party A resides, unless otherwise agreed in writing.'] },
    ],
  },
  {
    id: 'music',
    name: 'Music License Agreement',
    blurb: 'License a track for use — exclusive or non-exclusive, with royalties.',
    fields: [
      F('licensorName', 'Licensor (rights holder) name'),
      F('licensorAddress', 'Licensor address'),
      F('licenseeName', 'Licensee name'),
      F('licenseeAddress', 'Licensee address'),
      F('trackTitle', 'Track title'),
      F('licenseType', 'License type', 'select', { options: ['Non-exclusive', 'Exclusive'] }),
      F('fee', 'License fee', 'text', { placeholder: 'e.g. 150 USD' }),
      F('royaltyPercent', 'Royalty % (if any)', 'text', { placeholder: 'e.g. 50' }),
      F('termYears', 'Term (years)', 'text', { placeholder: 'e.g. 5' }),
      F('territory', 'Territory', 'text', { placeholder: 'e.g. Worldwide' }),
      F('effectiveDate', 'Effective date', 'date'),
    ],
    render: (d) => [
      { heading: '1. Parties', body: [`This Music License Agreement is between ${d.licensorName || '[Licensor]'} ("Licensor"), located at ${d.licensorAddress || '[Address]'}, and ${d.licenseeName || '[Licensee]'} ("Licensee"), located at ${d.licenseeAddress || '[Address]'}.`] },
      { heading: '2. Grant of license', body: [`Licensor grants Licensee a ${(d.licenseType || 'Non-exclusive').toLowerCase()} license to use the track "${d.trackTitle || '[Track title]'}" (the "Work") in ${d.territory || '[Territory]'} for a term of ${d.termYears || '[Term]'} years from ${d.effectiveDate || '[Effective date]'}.`] },
      { heading: '3. Permitted uses', body: ['Licensee may reproduce, distribute, stream, and publicly perform the Work as part of their own recordings and content. The Work may not be resold or re-licensed as a standalone beat/track without written consent.'] },
      { heading: '4. Fee and royalties', body: [`Licensee shall pay Licensor a license fee of ${d.fee || '[Fee]'} upon signing.${d.royaltyPercent ? ` In addition, Licensee shall pay Licensor ${d.royaltyPercent}% of net royalties earned from exploitations of the Work.` : ''}`] },
      { heading: '5. Credit', body: [`Licensee agrees to credit the Licensor as producer/writer of the Work in all releases where credits are customarily given.`] },
      { heading: '6. Warranties', body: ['Licensor warrants that they own or control the rights granted and that the Work does not infringe any third-party rights.'] },
      { heading: '7. Termination', body: ['Licensor may terminate for non-payment after 30 days written notice and opportunity to cure.'] },
      { heading: '8. Governing law', body: ['This Agreement is governed by the laws of the jurisdiction where the Licensor resides, unless otherwise agreed in writing.'] },
    ],
  },
];

export const getTemplate = (id) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];

// ---- Saved contracts (localStorage) ----
const LS_KEY = 'sfcontracts:contracts';

export function getContracts() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveContract(record) {
  const all = getContracts();
  const existing = all.findIndex((c) => c.id === record.id);
  if (existing >= 0) all[existing] = record;
  else all.unshift(record);
  localStorage.setItem(LS_KEY, JSON.stringify(all));
  return record;
}

export function deleteContract(id) {
  localStorage.setItem(LS_KEY, JSON.stringify(getContracts().filter((c) => c.id !== id)));
}

export function newRecord(templateId) {
  return {
    id: Date.now().toString(),
    templateId,
    name: '',
    data: {},
    updated: new Date().toISOString(),
  };
}

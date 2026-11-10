// Run after 01-fetch-customer-optins.js has finished, in the same tab.
// Needs two local files loaded through a file input (nothing is uploaded to the server):
//   1. The CC export of "No Permissions Set" contacts (CSV: Email address, ..., Created At last column)
//   2. A text file with one email per line to exclude (emails already in the other result files)
// Then fetches each candidate's paid orders and downloads the account-opt-in CSV.

function addInput(id, label) {
  const i = document.createElement('input');
  i.type = 'file'; i.id = id; i.setAttribute('aria-label', label);
  i.style.cssText = 'position:fixed;left:5px;z-index:99999;top:' + (5 + 35 * document.querySelectorAll('input[id$="-in"]').length) + 'px';
  document.body.appendChild(i);
}
addInput('cc-export-in', 'CC export file input');
addInput('excl-in', 'Exclusion list file input');
// Choose both files, then run buildAccountOptinCsv().

window.buildAccountOptinCsv = async function () {
  const nonce = wpApiSettings.nonce;
  const txt = (await document.getElementById('cc-export-in').files[0].text()).replace(/^﻿/, '');
  const cc = {};
  for (const l of txt.split(/\r?\n/).slice(1).filter(Boolean)) {
    const p = l.split(',');
    cc[p[0].trim().toLowerCase()] = p[p.length - 1];
  }
  const excl = new Set((await document.getElementById('excl-in').files[0].text()).split('\n').map(s => s.trim().toLowerCase()));
  const cand = window.__cj.rows
    .filter(r => r[5] === 'true' && cc[(r[1] || '').toLowerCase()] !== undefined && !excl.has(r[1].toLowerCase()))
    .map(r => [...r, cc[r[1].toLowerCase()]]);

  const orders = {};
  let k = 0;
  async function worker() {
    while (k < cand.length) {
      const r = cand[k++];
      const url = `/wp-json/wc/v3/orders?customer=${r[0]}&per_page=100&status=processing,completed&orderby=date&order=asc` +
        '&_fields=id,number,date_created_gmt,meta_data';
      const o = await (await fetch(url, { headers: { 'X-WP-Nonce': nonce } })).json();
      orders[r[0]] = o.map(x => [x.number, x.date_created_gmt,
        (x.meta_data.find(m => m.key === 'cc_woo_customer_agrees_to_marketing') || {}).value ?? '']);
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker));

  const q = s => { s = String(s ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const out = [['Email', 'First name', 'Last name', 'Customer ID', 'Account created (UTC)', 'Account opt-in (user meta)',
    'First paid order', 'First paid order date (UTC)', 'First order opt-in on order', 'Paid orders',
    'Orders with no choice on order', 'Orders with yes on order', 'Orders with no on order', 'Last order date (UTC)',
    'CC status', 'CC source', 'CC created']];
  for (const r of cand) {
    const o = orders[r[0]] || [];
    const t = s => (s || '').replace('T', ' ');
    out.push([r[1], r[2], r[3], r[0], t(r[4]), 'yes', o[0]?.[0] ?? '', t(o[0]?.[1]), o[0] ? (o[0][2] || 'none') : '',
      o.length, o.filter(x => x[2] === '').length, o.filter(x => x[2] === 'true').length, o.filter(x => x[2] === 'false').length,
      t(o.at(-1)?.[1]), 'No Permissions Set', 'WooCommerce', r[6]]);
  }
  const blob = new Blob(['﻿' + out.map(a => a.map(q).join(',')).join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'sms-account-optin-yes-no-cc-permissions.csv';
  a.click();
  return { candidates: cand.length };
};

// Run in the browser console on any wp-admin page of strictlymedicinalseeds.com (logged in as admin).
// Pulls every WooCommerce customer that has cc_woo_customer_agrees_to_marketing in user meta.
// Result: window.__cj.rows = [id, email, first_name, last_name, date_created_gmt, value]
// ~1,060 pages of 100 customers, ~5 minutes with 4 workers. Poll window.__cj.done / .finished.

window.__cj = { rows: [], done: 0, err: [], finished: false };
(async () => {
  const nonce = wpApiSettings.nonce;
  const head = await fetch('/wp-json/wc/v3/customers?per_page=1&role=all', { headers: { 'X-WP-Nonce': nonce } });
  const pages = Math.ceil(Number(head.headers.get('X-WP-Total')) / 100);
  let next = 1;
  async function worker() {
    while (next <= pages) {
      const p = next++;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const url = `/wp-json/wc/v3/customers?per_page=100&page=${p}&role=all&orderby=registered_date&order=desc` +
            '&_fields=id,email,first_name,last_name,date_created_gmt,meta_data';
          const list = await (await fetch(url, { headers: { 'X-WP-Nonce': nonce } })).json();
          for (const c of list) {
            const m = c.meta_data.find(x => x.key === 'cc_woo_customer_agrees_to_marketing');
            if (m) window.__cj.rows.push([c.id, c.email, c.first_name, c.last_name, c.date_created_gmt, m.value]);
          }
          window.__cj.done++;
          break;
        } catch (e) {
          if (attempt === 2) window.__cj.err.push(p);
          await new Promise(r => setTimeout(r, 2000));
        }
      }
    }
  }
  await Promise.all([worker(), worker(), worker(), worker()]);
  window.__cj.finished = true;
})();

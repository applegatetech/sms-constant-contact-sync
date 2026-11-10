// Run in the browser console on a wp-admin page.
// Checks the most recent paid checkout orders: how many have no opt-in on the order,
// and whether those are all "account created at checkout" with the choice on user meta.

(async () => {
  const H = { headers: { 'X-WP-Nonce': wpApiSettings.nonce } };
  let orders = [];
  for (const p of [1, 2]) {
    orders = orders.concat(await (await fetch(
      `/wp-json/wc/v3/orders?per_page=100&page=${p}&status=processing,completed&_fields=id,number,customer_id,date_created_gmt,created_via,meta_data`, H)).json());
  }
  const ck = orders.filter(o => o.created_via === 'checkout');
  const has = o => o.meta_data.some(m => m.key === 'cc_woo_customer_agrees_to_marketing');
  const missing = ck.filter(o => !has(o));
  const ids = [...new Set(missing.filter(o => o.customer_id).map(o => o.customer_id))];
  const cust = ids.length ? await (await fetch(`/wp-json/wc/v3/customers?per_page=100&role=all&include=${ids.join(',')}&_fields=id,date_created_gmt,meta_data`, H)).json() : [];
  const byId = Object.fromEntries(cust.map(c => [c.id, c]));
  let newAcct = 0, yes = 0, no = 0;
  for (const o of missing.filter(o => o.customer_id)) {
    const c = byId[o.customer_id]; if (!c) continue;
    const dt = (new Date(o.date_created_gmt + 'Z') - new Date(c.date_created_gmt + 'Z')) / 1000;
    if (dt >= 0 && dt < 300) newAcct++;
    const v = (c.meta_data.find(m => m.key === 'cc_woo_customer_agrees_to_marketing') || {}).value;
    if (v === 'true') yes++; else if (v === 'false') no++;
  }
  console.table({
    checkoutOrders: ck.length, missingOnOrder: missing.length,
    guestMissing: missing.filter(o => !o.customer_id).length,
    accountCreatedAtCheckout: newAcct, userMetaYes: yes, userMetaNo: no,
  });
})();

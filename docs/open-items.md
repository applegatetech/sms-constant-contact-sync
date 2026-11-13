# Open items

## HPOS checks (needs a session with SSH/WP-CLI on the live server; read-only)
Background: Drive "HANDOFF-hpos-2026-11-13.md". HPOS is authoritative and compatibility mode has been OFF since Feb 3, 2026, 4:06-4:25 PM PT; orders after that exist only in `wp_wc_orders*` (`wp_posts` has empty `shop_order_placehold` rows). The CC "No permission set" problem started Aug-Sep 2025, before HPOS, so HPOS didn't cause it, but it may have made it worse (226 affected in March 2026, the month after).

- [x] **Plugin code check.** Done Nov 13, 2026 (Mac Pro session): HPOS-safe; CC reads the opt-in via the WooCommerce REST API, which returns it for post-Feb 3 orders. See findings.md "HPOS". In `wp-content/plugins/constant-contact-woocommerce/` (v2.4.3), find every read of `cc_woo_customer_agrees_to_marketing` and of order data the sync sends to CC. Record for each: file:line, and whether it uses HPOS-safe calls (`$order->get_meta()`, `wc_get_order()`, `wc_get_orders()`) or post-based calls (`get_post_meta($order_id, ...)`, `WP_Query` on `shop_order`, `$wpdb` on `wp_posts`/`wp_postmeta`). A post-based read returns nothing for every order since Feb 3, 2026. Also note how the user-meta opt-in (account created at checkout) is read, if at all. Do not edit the plugin; write the findings to docs/findings.md.
  - Starting point: `grep -rn "cc_woo_customer_agrees_to_marketing\|get_post_meta\|shop_order\|postmeta" wp-content/plugins/constant-contact-woocommerce/`
- [x] **Before/after Feb 3, 2026 rate.** Done Nov 13, 2026: no jump at Feb 3 (30.5% before vs 34.0% after, same band); the jump was Aug-Sep 2025. See findings.md "HPOS". For checkout orders with `cc_woo_customer_agrees_to_marketing = true` (order meta, plus user meta for accounts created at checkout), compare the share whose CC contact is "No Permissions Set" for orders placed Aug 2025-Feb 3, 2026 vs Feb 3, 2026-now, by month. Use the Nov 10 CC export (Drive) or a fresh export; CC data stays out of git. A jump after Feb 3 = HPOS made it worse.

- [ ] Wait for the CC developers' answer (see case-log.md questions).
- [ ] CC will fix "No Permissions Set" (Nov 13 call). Confirm with John which contacts they'll switch: only opted-in customers (always yes, no-then-yes, account opt-in; ~3,611 with a paid order, plus new cases since Nov 10). Not abandoned-cart contacts with no order, not yes-then-no or always-no. Ask for a date, then spot-check a sample afterwards. Johnny no longer bulk-switches these himself.
- [ ] Unlisted Subscribed customers (John's Nov 13 suggestion): add them to a list that is not a WooCommerce list (e.g. General Interest, which campaigns already target) so the nightly sync can't strip them. Needs Johnny's OK before doing it in CC. Nov 13: Johnny moved that day's unlisted Subscribed contacts to General Interest. Repeat after each nightly sync (check the "not in any list" banner) until CC fixes the cause.
- [ ] WPForms logging is ON (WPForms > Tools > Logs, turned on Nov 10). After a few real homepage signups, check Providers/Errors, confirm whether existing contacts reach General Interest, then turn logging off.
- [ ] Delete the test contact johnnydragonhearts+smstest@gmail.com in CC.
- [ ] Delete ~/Downloads/sms-account-optin-yes-no-cc-permissions-2026-11-10.csv on Johnny's computer (Drive copy is the kept one).
- [ ] Delete the empty CC list "Non-existent bounces Oct 26 UNSUBSCRIBE" (list only).
- [ ] Find out why boss@strictlymedicinalseeds.com bounces as non-existent.
- [ ] Before each send, check CC's "contacts aren't in any list" banner and add stripped customers to General Interest (not a WooCommerce list: the nightly sync clears and refills those, so they'd be stripped again). See the unlisted-customers item above.
- [ ] Consider a CAPTCHA (e.g. Turnstile) on the homepage form if bot signups grow.
- [ ] Optional: a site-side fix so the opt-in is also written to the order when an account is created (only if CC confirms the sync reads order meta only).

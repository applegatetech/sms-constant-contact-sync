# CLAUDE.md

Project: Constant Contact + WooCommerce sync investigation for strictlymedicinalseeds.com (owner: Johnny / applegatetech).

## Rules
- Never commit customer data. CC exports, result CSVs and anything with customer emails or names go to Google Drive only. `data/` and `*.csv` are git-ignored; keep it that way.
- Never bulk-change contacts in Constant Contact (permission, lists, delete) without Johnny's explicit OK. Contacts created by the abandoned-cart capture that never placed an order never opted in: do not switch them to Subscribed.
- Bounce policy: unsubscribe dead addresses (non-existent, suspended, undeliverable); leave mailbox-full, other and vacation alone. Never delete WooCommerce-synced contacts to remove them; the nightly sync re-creates them. Unsubscribe instead.
- Johnny writes to CC support from applegatetech@me.com and signs "John". Keep emails to support short.
- Avoid "medicine" wording in anything customer-facing (FDA).
- Keep docs/findings.md, docs/case-log.md and docs/open-items.md current when something changes.

## Key facts
- Plugin: Constant Contact + WooCommerce (slug constant-contact-woocommerce), v2.4.3. Opt-in key: `cc_woo_customer_agrees_to_marketing` ("true"/"false").
  - Guest checkout and existing-account orders: saved on the order (HPOS order meta).
  - Checkout that creates an account: saved on the user (user meta) only.
- WooCommerce uses HPOS; order edit URL `wp-admin/admin.php?page=wc-orders&action=edit&id=<internal id>`. Sequential order numbers differ from internal ids.
- The sync is a full nightly overwrite of the WooCommerce lists (by design per CC). Observed ~9:43-10:15 PM PT.
- Homepage newsletter form: WPForms Lite form 1049149 -> CC v3, Subscribe, list General Interest.
- Theme repo: applegatetech/sms-theme-kit.

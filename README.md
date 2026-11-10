# sms-constant-contact-sync

Investigation of the Constant Contact + WooCommerce integration on strictlymedicinalseeds.com: customers who opt in to email at checkout end up as "No Permissions Set" in Constant Contact, new customers get stripped from all lists, and bounce-report actions miss re-created contacts.

**Customer data is not stored here.** The Constant Contact exports and the four result CSVs (emails and names) live in Google Drive only. `data/` is git-ignored; put local copies there while working.

## Status (Nov 10, 2026)
- Constant Contact case open with John Tran, Tier 2 (support2@constantcontact.com, ref `ref:!00D7008xak.!500PW0245yjN:ref`). CC confirmed Nov 9 that "No Permissions Set" for opted-in customers is **not by design**; developers are investigating.
- Nov 10: four CSV files and a summary emailed to John. Waiting on the developers.
- See [docs/findings.md](docs/findings.md) for the full picture and [docs/open-items.md](docs/open-items.md) for what's next.

## Layout
| Path | What |
|---|---|
| `docs/findings.md` | What we found, with numbers and example orders |
| `docs/case-log.md` | Timeline of the Constant Contact support case |
| `docs/open-items.md` | Next steps and cleanup |
| `docs/how-the-plugin-stores-opt-in.md` | Where `cc_woo_customer_agrees_to_marketing` is saved |
| `scripts/browser/` | Snippets run in the browser console while logged in to wp-admin (WooCommerce REST API with the admin nonce) |
| `scripts/python/` | Matching the CC export against WooCommerce data to build the result CSVs |
| `sql/` | Queries to check opt-in values straight in MySQL |

## Result files (Google Drive, same folder as the other SMS result files)
| File | Customers |
|---|---|
| sms-always-yes-marketing-no-cc-permissions-2026-11-10.csv | 1,455 |
| sms-no-then-yes-marketing-no-cc-permissions-2026-11-10.csv | 317 |
| sms-yes-then-no-marketing-no-cc-permissions-2026-11-10.csv | 89 |
| sms-account-optin-yes-no-cc-permissions-2026-11-10.csv | 1,894 |

All four contain only contacts that are "No Permissions Set" in the Nov 10 CC export (16,558 contacts, all source WooCommerce).

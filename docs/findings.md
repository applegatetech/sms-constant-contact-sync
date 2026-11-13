# Findings

## 1. Opted-in customers end up "No Permissions Set"
CC export Nov 10, 2026: 16,558 contacts with status "No Permissions Set", all source WooCommerce. Compared against the opt-in saved by the plugin on paid orders (Feb 2020 - Nov 10, 2026) and on customer accounts.

| Group | Customers | Meaning |
|---|---|---|
| Always yes | 1,455 | Ticked the box on every paid order |
| No, then yes | 317 | Earlier order no, later order yes |
| Yes, then no | 89 | Latest choice is no (included to show how a later no is handled) |
| Account opt-in | 1,894 | Ticked yes while creating an account at checkout (user meta), none of them in the other files |
| Always no | ~5,898 | Never opted in, still synced |
| No matching order | ~8,800 | Mostly abandoned-cart captures |

About **3,666** customers opted in (always yes + no-then-yes + account opt-in) but have no permission.

### Pattern
- Many contacts were created in CC minutes **before** the order: the abandoned-cart capture creates the contact as No Permissions Set when the shopper types an email at checkout. The opt-in on the finished order (or new account) never upgrades that existing contact.
  - Always yes: 1,026 of 1,455 created before the opt-in order, 632 less than 10 minutes before.
  - No then yes: 248 of 317 existed before the opt-in order.
  - Account opt-in: 1,103 of 1,894 created before the account, 752 less than 10 minutes before.
- The rest were created **after** the order and still have no permission (always yes 427, account opt-in 791), so the opt-in isn't read for them at all.
- Started around Aug-Sep 2025 (about 1,330 contacts added Sep 9-14, 2025), new cases every day since; 20-120 opted-in customers a month, 226 in March 2026. The Oct 24, 2026 reconnect did not fix it.

### Examples
- Guest checkouts, single order, opted in, No Permissions Set: Noel Christensen #349494 (Nov 9), Rachel Orman #349522 (Nov 9).
- Account created at checkout: Eileen Cimermancic #349018 (Nov 1; user 106859 = true, nothing on the order). Paulette Moore #349372 (Nov 8), Robert Powell #349325 (Nov 7).
- Correctly no permission: Penny Creel #349557 (account, user meta false).

### Still happening (checked Nov 13, 2026)
All 41 customers who opted in at checkout Nov 11-13 were looked up in CC: 26 Subscribed and listed, 4 Subscribed but on no list (all account-created checkouts), **9 No permission set (22%)**, 2 Unsubscribed long before (expected; a checkout tick doesn't resubscribe). The 9 cover every checkout type: 4 account created at checkout (#349807, #349794, #349736, #349708), 1 guest with yes on the order (#349741), 4 repeat customers. So new cases are still added (~3/day at this week's volume); any bulk fix needs a final re-run.

Note: a CC view filtered to "Subscribed + not in any list" can't show No-permission contacts, and "No permission set + not in any list" misses those the sync put on lists. Check opted-in customers by email instead.

### HPOS
HPOS has been authoritative with compatibility mode off since Feb 3, 2026 (Drive "HANDOFF-hpos-2026-11-13.md"). Not the cause (problem began Aug-Sep 2025) but possibly an aggravator; checks in open-items.md.

## 2. "No marketing choice saved" on ~17% of orders
Not a nonce failure (an earlier guess, corrected in the Nov 10 email). Last 200 checkout orders (Nov 9-10): 33 had no opt-in on the order; all 33 created an account at that checkout and all 33 had the choice on user meta (20 yes, 13 no). No guest or existing-account order was missing it.

## 3. New customers stripped from all lists
Each nightly sync leaves some Subscribed WooCommerce customers on no list. 33 re-listed Nov 8, 15 more Nov 9. Four were stripped twice (re-added Nov 1 and again Nov 8): Eileen Cimermancic, Meishel Montanye, Jeremy Burton, Daniel Ross; on Nov 13 they were on no list a third time.

Nov 13: 49 Subscribed contacts on no list; 48 are WooCommerce contacts added Oct 31-Nov 12 and **all 48 created a store account at checkout** (43 on their first order, 4 earlier guests on their latest order, 1 with no account now). Account-created checkouts are also the ones missing names and lists among No-permission contacts (sample of 15, Nov 13). The list bug and the account-opt-in permission bug look like the same root cause: the sync doesn't treat account-created checkouts as customers.

## 4. Bounce-report actions miss re-created contacts
Delete / Add to list from a campaign's bounce report acts on the contact record as of send day. If the sync deleted and re-created the contact, the action hits the dead record. Nov 8: Delete & Unsubscribe of 147 non-existent bounces changed ~2. Working method: export the bounce report, import (email column only) into a temp list, then Delete & Unsubscribe from that list.

## 5. Sync timing
CC moved the daily full sync from ~11 AM PDT to night (stated 8 PM PST from Nov 6). Nov 9 activity log showed ~9:43-10:15 PM PT. No reconnect needed (John Tran, Nov 9).

## 6. Homepage newsletter form
WPForms Lite form 1049149 -> CC v3 Subscribe -> General Interest. Nov 10 test with a new address: Subscribed, source API, on General Interest. Six real signups on Nov 10 ran (Action Scheduler `wpforms_constant_contact_v3_process`, Complete) but created no new contacts, so those addresses already existed in CC. Unconfirmed whether existing contacts get added to General Interest. No CAPTCHA (honeypot fields only).

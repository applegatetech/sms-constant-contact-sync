# Constant Contact case log

Case: John Tran, Tier 2 Technical Support (support2@constantcontact.com, direct 781-482-5737, Mon-Fri 12-8 PM ET). Ref `ref:!00D7008xak.!500PW0245yjN:ref`. Earlier chat case with Manoj K (Nov 2).

| Date | What happened |
|---|---|
| Oct 24, 2026 | Integration starts a daily full sync of the whole order history (~268k orders) during business hours. Reconnect done. |
| Nov 2 | Chat with Manoj K; specialist case opened. |
| Nov 3 | John: full overwrite by design (clears and refills the WooCommerce lists); no incremental option. Deleted contacts come back while they exist in WooCommerce. Suggested reconnecting at night. |
| Nov 4 | John: only contacts who opt in at checkout get synced; unsubscribes in CC survive the sync. |
| Nov 6 | CC developers move the sync to 11 PM EST (8 PM PST). |
| Nov 9 | Call. John confirms "No Permissions Set" for opted-in customers is not by design; checking with developers. Email: no reconnect needed; Keren shows Subscribed (Johnny had fixed her by hand). Screenshare set for Nov 10. |
| Nov 10 | Screenshare. Johnny emails three CSVs, then a follow-up with the abandoned-cart pattern, then all four CSVs with a short summary (account opt-ins saved on user meta). |
| Nov 13 | Voicemail from John Tran: CC compliance should be able to switch the No Permissions Set contacts to Subscribed, but wants more examples before approving. Asks for a screenshare to collect them and answer our questions. On phones until 6 PM ET (3 PM PT); will call again and email. |
| Nov 13 | New customers added by WooCommerce on Nov 12 show Email subscribed (correct) but are on no list. Built a combined CSV of the 3,666 opted-in No Permissions Set customers for compliance (Drive only: sms-optedin-no-permissions-set-2026-11-10.csv). |

## Questions waiting on the developers
1. Why don't opt-ins at checkout give these contacts permission?
2. Does the sync read the opt-in from the customer's account (user meta), or only from the order?
3. Can CC fix permission for the opted-in customers, or should we update them ourselves? (Nov 13: compliance likely yes, pending more examples. Scope must be the ~3,666 opted-in only, not all 16,558.)
4. Why do new opted-in customers end up on no list? (Still happening Nov 12, now with the correct Subscribed permission.)
4b. Does the sync read the order opt-in through the WooCommerce order API (HPOS-aware) or post meta? HPOS is on with compatibility mode off; the opt-in is only in wc_orders_meta.
4a. Was something changed around Nov 10-12? New customers now arrive Subscribed.
5. Do bounce-report actions follow the current contact record?
6. Who deleted three lists on Nov 9 at 12:21 PM EST (not Johnny)?

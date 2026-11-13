# Where the plugin stores the checkout opt-in

Plugin: Constant Contact + WooCommerce v2.4.3. Meta key: `cc_woo_customer_agrees_to_marketing`, value `"true"` or `"false"`.

| Checkout type | Saved on | Example |
|---|---|---|
| Guest | Order meta | #349494, #349522 (true) |
| Logged-in existing account | Order meta | most repeat customers |
| Creates an account at checkout | User meta only, nothing on the order | #349018 -> user 106859 (true); #349557 -> user 106958 (false) |

Every order also gets `cc_woo_checkout_uuid`.

Why the account case has nothing on the order: the box's nonce was made for the logged-out shopper; WooCommerce logs
the new account in before it creates the order, so the order save fails the nonce check and is skipped. Details in
findings.md 2, "Cause in the plugin code".

Neither value is visible in wp-admin: the order screen and the Edit User screen don't show it. Use the REST API (scripts/browser), WP-CLI, or SQL:

```
wp user meta get <user_id> cc_woo_customer_agrees_to_marketing
```

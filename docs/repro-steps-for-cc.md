# Repro steps for CC: opt-in not saved on the order when an account is created at checkout

Written Nov 13, 2026 from the plugin and WooCommerce code (findings.md 2, "Cause in the plugin code"). Not yet run on a
test store. Safe to send to CC: no customer data. Real example if wanted: #349018 / user 106859.

---

**Constant Contact + WooCommerce 2.4.3: opt-in not saved on the order when the customer creates an account at checkout**

**Setup**
- WooCommerce with the classic (shortcode) checkout, not the checkout block.
- Constant Contact + WooCommerce 2.4.3, connected.
- WooCommerce > Settings > Accounts & Privacy: allow guest checkout, and allow customers to create an account during checkout.
- Any test payment method, e.g. Cash on delivery.

**Steps**
1. Log out, or use a private window.
2. Add a product to the cart and go to checkout.
3. Enter a new email address, tick "Sign me up to receive marketing emails", tick "Create an account?" and place the order.
4. Check the order:
   `wp eval 'echo wc_get_order( <order id> )->get_meta( "cc_woo_customer_agrees_to_marketing" );'`
   or `GET /wp-json/wc/v3/orders/<order id>` and look in `meta_data`.
5. Check the new user:
   `wp user meta get <user id> cc_woo_customer_agrees_to_marketing`

**Expected:** `true` on both the order and the user.
**Actual:** the user has `true`; the order has nothing. Unticking the box gives the same result: `false` on the user, nothing on the order.

**Controls**
- Guest checkout (box ticked, no account): the order has `true`.
- Logged-in existing customer (box ticked): the order and the user both have `true`.

**Cause**
`get_submitted_customer_preference()` in `src/View/Checkout/NewsletterPreferenceCheckbox.php` saves the choice only if
`wp_verify_nonce()` passes. The nonce is made for the logged-out shopper. During checkout, WooCommerce creates the
account (`woocommerce_created_customer`, where the plugin saves the user meta) and then logs the customer in
(`wc_set_customer_auth_cookie()` -> `wp_set_current_user()`). Only after that does it create the order. By the time
`woocommerce_checkout_create_order` runs `save_user_preference_to_order()`, the current user has changed, the nonce
check fails, and nothing is written to the order.

**Effect on our store:** about 17% of checkout orders have no opt-in on the order, and every one of them created an
account at checkout. These customers end up "No Permissions Set" or on no list after the nightly sync.

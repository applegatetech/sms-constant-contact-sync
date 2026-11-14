# Handoff: test the CC opt-in bug and fix on the STAGING site

From: CC sync investigation session (repo applegatetech/sms-constant-contact-sync, branch
`claude/beautiful-archimedes-013req`). Written Nov 13, 2026. For a session with access to the strictlymedicinalseeds.com
**staging** site. Owner: Johnny.

## Rules
- **Staging only.** Do nothing on the live site.
- **Don't touch Constant Contact.** No connecting, disconnecting or reconnecting the plugin, and no changes in CC.
- **Don't edit the Constant Contact + WooCommerce plugin.** The fix is a separate mu-plugin file.
- **Use test data only.** Use a test address Johnny controls, with no real customer data. Results that include
  customer data go to Google Drive, not git.
- **Stop and ask Johnny if staging is connected to Constant Contact** (step 0). A test order or account there could
  reach the live CC account.

## Background
- The plugin is Constant Contact + WooCommerce v2.4.3 (slug `constant-contact-woocommerce`). It saves the checkout
  opt-in as `cc_woo_customer_agrees_to_marketing` = `"true"`/`"false"`.
- When a shopper creates an account at checkout, the plugin saves the opt-in on the user only, never on the order.
  Guest and logged-in checkouts save it on the order.
- The cause, traced in the plugin code but not yet seen happening:
  - `NewsletterPreferenceCheckbox::get_submitted_customer_preference()` saves only if `wp_verify_nonce()` passes.
  - The nonce is made for the logged-out shopper.
  - WooCommerce creates the account, saves the user opt-in (`woocommerce_created_customer`), then logs the customer
    in (`wc_set_customer_auth_cookie()`).
  - Only then does it create the order (`woocommerce_checkout_create_order`). The nonce now fails, so nothing is
    written to the order.
- The effect: CC's nightly sync seems to read the opt-in from the order only, so these customers end up
  "No Permissions Set" or on no list.
- On live, about 17% of checkout orders are missing the opt-in, and all of them created an account at checkout.

## Goal
1. Confirm the bug on staging (steps 1-3).
2. Install the fix snippet and confirm it works (steps 4-6).

Report results to Johnny. Don't install anything on live.

## Steps
0. **Checks.**
   - Classic (shortcode) checkout, not the checkout block.
   - Plugin version 2.4.3: `wp plugin get constant-contact-woocommerce --field=version`.
   - Not connected to CC: `wp option get cc_woo_import_connection_established` should be empty, and WooCommerce >
     Constant Contact should show not connected. **If it's connected, stop and ask Johnny.**
   - The checkbox works without a connection, so the test doesn't need CC.
   - Staging email is blocked or caught, so no real emails go out.
   - WooCommerce > Settings > Accounts & Privacy allows creating an account during checkout. Payment can be Cash on
     delivery or any test method.
1. **Bug run.** Logged out or in a private window, add a product and go to checkout. Use a new test email, tick
   "Sign me up to receive marketing emails", tick "Create an account?", and place the order.
2. **Check the result.** Note the order's internal id, which is not the sequential order number.
   - `wp eval 'echo wc_get_order( <id> )->get_meta( "cc_woo_customer_agrees_to_marketing" );'` should be empty.
   - `wp user meta get <new user id> cc_woo_customer_agrees_to_marketing` should be `true`.
3. **Controls.**
   - Guest order with the box ticked: the order has `true`.
   - Logged-in existing customer with the box ticked: the order and user both have `true`.
   - If step 2 doesn't show the bug, stop and report what you saw instead.
4. **Install the fix.** Copy the snippet below to `wp-content/mu-plugins/sms-cc-optin-to-order.php`. It's the same as
   `snippets/mu-plugins/sms-cc-optin-to-order.php` in the repo. Then run `php -l` on it.
5. **Fix runs.** Repeat step 1 with another new test email, once with the box ticked and once unticked.
   - Expect the order to have `true` (or `false`) and `_sms_cc_optin_copied_from_user` = `yes`.
   - The user should match the order.
6. **Regression.** Repeat the guest and logged-in controls. The order should carry the plugin's own value, with no
   `_sms_cc_optin_copied_from_user` marker.
   - Check the PHP error log for warnings.
   - Leave the snippet installed on staging unless Johnny says otherwise.
7. **Report.** For each run give: checkout type, box ticked or not, order id, user id, the order value, the user value
   and the marker. Johnny decides whether it goes live. That waits for CC to confirm their sync reads the opt-in from
   the order only.

## Snippet
```php
<?php
/**
 * Plugin Name: SMS - Copy CC opt-in to order for account-created checkouts
 * Description: Constant Contact + WooCommerce 2.4.3 saves the checkout opt-in only on the user when the customer
 *              creates an account at checkout (its nonce fails for the order save once WooCommerce logs the new
 *              account in). This copies that choice onto the order so the order carries it like a guest order.
 *              See docs/findings.md 2 in applegatetech/sms-constant-contact-sync.
 * Version:     1.0.0
 *
 * Install: copy to wp-content/mu-plugins/. Remove once the plugin itself is fixed.
 * Only affects new orders; it does not touch past orders, users or Constant Contact.
 */

defined( 'ABSPATH' ) || exit;

/**
 * The choice saved on the account created during this request ('true'/'false'), or null.
 *
 * @param string|null $set Value to remember.
 * @return string|null
 */
function sms_cc_optin_new_account_choice( $set = null ) {
	static $choice = null;
	if ( null !== $set ) {
		$choice = $set;
	}
	return $choice;
}

/**
 * After the plugin saves the opt-in on the new account (priority 10), remember it for this request.
 * The account is brand new, so any value on it was written by this checkout.
 */
add_action(
	'woocommerce_created_customer',
	function ( $customer_id ) {
		$value = get_user_meta( $customer_id, 'cc_woo_customer_agrees_to_marketing', true );
		if ( 'true' === $value || 'false' === $value ) {
			sms_cc_optin_new_account_choice( $value );
		}
	},
	20
);

/**
 * When the order is built, add the remembered choice if the plugin left the order without one.
 * Runs after the plugin's own save (priority 10); the order is saved by WooCommerce right after this hook.
 */
add_action(
	'woocommerce_checkout_create_order',
	function ( $order ) {
		$choice = sms_cc_optin_new_account_choice();
		if ( null === $choice || ! $order instanceof WC_Order ) {
			return;
		}
		if ( '' !== (string) $order->get_meta( 'cc_woo_customer_agrees_to_marketing', true ) ) {
			return; // The plugin saved it (e.g. a fixed plugin version); leave it alone.
		}
		$order->update_meta_data( 'cc_woo_customer_agrees_to_marketing', $choice );
		$order->update_meta_data( '_sms_cc_optin_copied_from_user', 'yes' ); // Marker for spot-checks.
	},
	20
);
```

## When done
Send Johnny the step 7 report so this repo's `docs/findings.md` (finding 2) and `docs/repro-steps-for-cc.md` can be
updated from "not yet run" to the real result.

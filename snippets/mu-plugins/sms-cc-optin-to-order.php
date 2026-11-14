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

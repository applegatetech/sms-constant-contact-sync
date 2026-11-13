<?php
/**
 * WooCommerce Webhook and API cleanup.
 *
 * @since   2.4.0
 * @author  WebDevStudios.
 * @package cc-woo
 */

namespace WebDevStudios\CCForWoo\Utility;

/**
 * Webhook and API cleanup class.
 *
 * @since 2.4.0
 */
class WebhookAPICleanup {

	/**
	 * WPDB class instance.
	 *
	 * @var \WPDB $wpdb
	 */
	protected $wpdb;

	/**
	 * Constructor.
	 *
	 * @param \WPDB $wpdb
	 */
	public function __construct( \WPDB $wpdb ) {
		$this->wpdb = $wpdb;
	}

	/**
	 * Clear out all of our webhooks by name.
	 *
	 * @since 2.4.0
	 */
	public function clear_webhooks() {
		$query = "DELETE FROM {$this->wpdb->prefix}wc_webhooks WHERE topic = '%s'";
		$result = $this->wpdb->query(
			$this->wpdb->prepare(
				$query,
				'action.wc_ctct_disconnect'
			)
		);
	}

	/**
	 * Clear out all of our API connections.
	 *
	 * @since 2.4.0
	 */
	public function clear_api_connections() {
		$query  = "DELETE FROM {$this->wpdb->prefix}woocommerce_api_keys WHERE description LIKE 'Constant Contact - API%'";
		$result = $this->wpdb->query(
			$query
		);
	}
}

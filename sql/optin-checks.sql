-- Check the CC opt-in straight in MySQL. Confirm the table prefix (wp_ assumed).

-- Opt-in saved on one order (HPOS order meta)
SELECT meta_key, meta_value FROM wp_wc_orders_meta
WHERE order_id = 1065216 AND meta_key LIKE 'cc_woo%';

-- Opt-in saved on one customer account (user meta)
SELECT meta_key, meta_value FROM wp_usermeta
WHERE user_id = 106859 AND meta_key LIKE 'cc_woo%';

-- Count of customer accounts by saved opt-in value
SELECT meta_value, COUNT(*) FROM wp_usermeta
WHERE meta_key = 'cc_woo_customer_agrees_to_marketing'
GROUP BY meta_value;

-- Abandoned checkouts held by the plugin (table name to confirm)
SELECT COUNT(*) FROM wp_cc_abandoned_checkouts;

# Constant Contact + WooCommerce plugin source (reference only)

`constant-contact-woocommerce-2.4.3/` is the unmodified v2.4.3 release from wordpress.org, the version running on
strictlymedicinalseeds.com. GPL-3.0+. Kept here to read while troubleshooting the sync; nothing in this repo deploys it.
Don't edit these files. If the live plugin is updated, add the new version alongside it.

- Source: https://downloads.wordpress.org/plugin/constant-contact-woocommerce.2.4.3.zip
- Zip sha256: `b557adf8d880ca1dfea33d0daf042cf228d936fa68f5114c19f6cf9d6e0e95c9` (downloaded Nov 13, 2026)

Places to start (see also docs/findings.md "HPOS"):
- Opt-in saved on the order: `src/View/Checkout/NewsletterPreferenceCheckbox.php` (classic checkout),
  `src/Utility/CheckoutBlockNewsletter.php` (block checkout). Meta key `cc_woo_customer_agrees_to_marketing`.
- HPOS compatibility declared in `plugin.php`.

To confirm the live copy matches (on the server, from the WordPress folder):

    wp plugin verify-checksums constant-contact-woocommerce

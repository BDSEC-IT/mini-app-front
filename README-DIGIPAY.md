# Fixing Digipay Payment Integration

This document explains how to fix the `ERR_CLEARTEXT_NOT_PERMITTED` error that occurs when trying to make payments through Digipay in the Android app.

## The Problem

When testing the payment process in the Digipay development app, you may encounter this error:

```
Error loading page, domain undefined error code: -1, description: net::ERR_CLEARTEXT_NOT_PERMITTED
```

This happens because Android 9+ (API level 28+) blocks cleartext (HTTP) traffic by default, requiring all network connections to use HTTPS.

## The Solution

We've implemented several fixes to address this issue:

1. **Force HTTPS for Payment URLs**: The app now automatically converts HTTP URLs to HTTPS when redirecting to payment pages.

2. **Updated Content Security Policy**: We've added a Content Security Policy in `next.config.mjs` that allows connections to Digipay domains.

3. **Network Security Configuration**: We've added a network security configuration file for Android apps.

## Implementation Details

### 1. HTTP to HTTPS Conversion

In the payment code, we now check and convert HTTP URLs to HTTPS:

```javascript
// Ensure the URL uses HTTPS instead of HTTP
let secureUrl = orderId;
if (secureUrl.startsWith('http:')) {
  secureUrl = secureUrl.replace('http:', 'https:');
}

// Redirect to the Digipay order URL
window.location.assign(secureUrl);
```

### 2. Content Security Policy

We've updated the Next.js configuration to include proper headers:

```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://*.bdsec.mn https://*.digipay.mn https://*.qpay.mn; img-src 'self' data: https://*; style-src 'self' 'unsafe-inline';"
        },
        // Other security headers...
      ]
    }
  ]
}
```

### 3. Android Network Security Configuration

For Android apps, you need to include the `network_security_config.xml` file in your Android project and reference it in your `AndroidManifest.xml`.

#### How to use the network security configuration:

1. Copy the `public/network_security_config.xml` file to your Android project's `res/xml/` directory.

2. Update your `AndroidManifest.xml` to reference this file:

```xml
<application
    ...
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
    <!-- rest of your manifest -->
</application>
```

## Testing

After implementing these changes:

1. Rebuild your app
2. Test the payment flow again
3. Verify that you can successfully connect to the Digipay payment gateway

## Troubleshooting

If you still encounter issues:

1. Make sure the Digipay server supports HTTPS connections
2. Check that all payment URLs are properly converted to HTTPS
3. Verify that your Android manifest correctly references the network security configuration
4. Consider adding logging to track the exact URL being used for redirection 
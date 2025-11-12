# App Icons

This directory contains app icons for the Progressive Web App (PWA).

## Generated Icons

All icons have been automatically generated from the Home Liberation logo with a gradient background (orange to blue).

### PWA Icons (SVG format):
- icon-72x72.svg (72x72px)
- icon-96x96.svg (96x96px)
- icon-128x128.svg (128x128px)
- icon-144x144.svg (144x144px)
- icon-152x152.svg (152x152px)
- icon-192x192.svg (192x192px)
- icon-384x384.svg (384x384px)
- icon-512x512.svg (512x512px)

### Shortcut Icons:
- sell-96x96.svg - For "Sell Property" shortcut
- buy-96x96.svg - For "Join Buyer List" shortcut
- admin-96x96.svg - For "Admin Login" shortcut
- badge-72x72.svg - For notification badge

## Converting to PNG

For better compatibility, you may want to convert these SVG files to PNG:

### Using ImageMagick:
```bash
magick icon-192x192.svg icon-192x192.png
```

### Using Online Tools:
- https://cloudconvert.com/svg-to-png
- https://www.aconvert.com/image/svg-to-png/

### Using Inkscape:
```bash
inkscape icon-192x192.svg --export-filename=icon-192x192.png --export-width=192 --export-height=192
```

## Notes

- SVG icons work in most modern browsers
- PNG icons provide better compatibility across all devices
- The manifest.json references these icons
- Icons use the Home Liberation brand colors (#f97316 orange, #3b82f6 blue)

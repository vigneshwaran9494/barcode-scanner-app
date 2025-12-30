# Barcode Scanner

A React Native barcode scanner app built with Expo and React Native Vision Camera.

## Demo

https://github.com/vigneshwaran9494/barcode-scanner-app/raw/refs/heads/main/demo/barcode_scanner_demo.mp4

## Features

- Real-time barcode scanning
- Scan history with search
- Copy barcode values to clipboard
- Delete individual or clear all history
- Dark mode support

## Supported Barcode Formats

### 1D Barcodes
- **UPC-A** / **UPC-E** - Universal Product Code
- **EAN-13** / **EAN-8** - European Article Number
- **Code 128** - High-density alphanumeric
- **Code 39** - Alphanumeric
- **Code 93** - Alphanumeric
- **ITF** / **ITF-14** - Interleaved 2 of 5
- **Codabar** - Numeric with start/stop characters

### 2D Barcodes
- **QR Code** - Quick Response code
- **Data Matrix** - High-density 2D
- **PDF417** - Portable Data File
- **Aztec** - High-density 2D

### Platform-Specific
- **GS1 DataBar** (Expanded/Limited) - iOS only

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npx expo start
   ```

3. Run on your device:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app

## Build

- **iOS**: `npm run ios`
- **Android**: `npm run android`
- **Web**: `npm run web`

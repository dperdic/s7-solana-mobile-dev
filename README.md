# S7 - Solana Mobile

Seventh assignment for the Solana Summer Fellowship 2024.

## Description

### Assignment

```
Build an app that captures an image through the camera, mints an NFT with that image, and adds the current location longitude, latitude in the metadata.
```

### Building the app

The app relies on Supabase storage to store the NFT's image and metadata. Create a project on supabase and make sure to set the storage bucket to be publicly accessible and make a `.env` file based on the template provided.

To build the app first install the dependencies.

```bash
yarn
```

The postinstall script that fixes metaplex packages should run after the dependencies have been installed.

If the script doesnt run, you can run it using the following command:

```bash
yarn fix
```

#### Development build

Run the following command to build the development environment .apk file.

```bash
yarn build:dev
```

After the .apk file has been built drag it into your emulator in android studio.

Then start a development server using the following command:

```bash
yarn android
```

#### Preview build

Run the following command to build the preview environment .apk file.

```bash
yarn build:preview
```

This .apk file does not require a development server and can be installed on your phone.

### Description

The user first needs to connect their wallet app.

After the wallet has been connected, a new screen called `NFT` will be avalable.

The user then has the option to take a photo with their camera or load an image from their gallery.

After an image has been selected the user can mint an NFT with the image and their current location.

### App demo

Video demo of the app can be found [here](https://jtrledmmznkgtipuxcja.supabase.co/storage/v1/object/public/solana-mobile/videos/e1828a73d2754254b3184e015c5c1d29.mp4).

The NFT minted in the video can be found [here](https://explorer.solana.com/address/CuS2bxaohJeg6b8YgtjD6kYY4HinCXx9pB4XQfQKxbZR/attributes?cluster=devnet).

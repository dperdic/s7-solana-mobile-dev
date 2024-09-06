import { createNft } from "@metaplex-foundation/mpl-token-metadata";
import {
  generateSigner,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";
import { useMobileWallet } from "./useMobileWallet";
import { WalletAdapter } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { useAuthorization } from "./useAuthorization";
import { useMemo } from "react";
import { alertAndLog, getLocation } from "./functions";
import { base58 } from "@metaplex-foundation/umi-serializers";
import { supabase } from "./supabase";
import { ImagePickerAsset } from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { useUmi } from "./UmiProvider";

export function useNftUtils() {
  const { selectedAccount } = useAuthorization();
  const { signMessage, signTransactionForUmi, signAllTransactionsForUmi } =
    useMobileWallet();
  const umi = useUmi();

  const createNFT = async (imagePickerAsset: ImagePickerAsset) => {
    if (!selectedAccount?.publicKey) {
      return;
    }

    //
    // ** Setting Up Umi **
    //

    const walletAdapter: WalletAdapter = {
      publicKey: selectedAccount.publicKey,
      signMessage: signMessage,
      signTransaction: signTransactionForUmi,
      signAllTransactions: signAllTransactionsForUmi,
    };

    // const umi = createUmi("https://api.devnet.solana.com")
    //   .use(walletAdapterIdentity(walletAdapter))
    //   .use(mplTokenMetadata());

    const locationData = await getLocation();

    if (!locationData) {
      alertAndLog("Minting failed", "Location coordinates not found");

      return;
    } else {
      console.log("latitude: ", locationData.latitude);
      console.log("longitude: ", locationData.longitude);
    }

    // Airdrop 1 SOL to the identity
    // if you end up with a 429 too many requests error, you may have to use
    // the filesystem wallet method or change rpcs.
    //   console.log("Airdropping 1 SOL to identity");
    //   await umi.rpc.airdrop(umi.identity.publicKey, sol(1));

    //
    // ** Upload an image to Supabase **
    //

    // use `fs` to read file via a string path.
    // You will need to understand the concept of pathing from a computing perspective.

    // const imageFile = fs.readFileSync(
    //   path.join(__dirname, "../assets/images/0.png")
    // );

    const base64ImageFile = await FileSystem.readAsStringAsync(
      imagePickerAsset.uri,
      {
        encoding: FileSystem.EncodingType.Base64,
      }
    );

    // alertAndLog("Log", JSON.stringify(imagePickerAsset));

    // that umi can understand. Make sure you set the mimi tag type correctly // Use `createGenericFile` to transform the file into a `GenericFile` type
    // otherwise Arweave will not know how to display your image.

    // const umiImageFile = createGenericFile(imageFile, imagePickerAsset.uri, {
    //   tags: [{ name: "Content-Type", value: "image/png" }],
    // });

    // Here we upload the image to Arweave via Irys and we get returned a uri
    // address where the file is located. You can log this out but as the
    // uploader can takes an array of files it also returns an array of uris.
    // To get the uri we want we can call index [0] in the array.

    console.log("Uploading image...");
    // const imageUri = await umi.uploader.upload([umiImageFile]).catch((err) => {
    //   throw new Error(err);
    // });

    const { data: imageResponse, error: imageError } = await supabase.storage
      .from("solana-mobile")
      .upload(
        `nfts/images/${imagePickerAsset.fileName}`,
        decode(base64ImageFile),
        { upsert: true }
      );

    if (imageError) {
      alertAndLog("Minting failed", "An error occured while uploading image");

      return;
    }

    const { data: storedFile } = supabase.storage
      .from("solana-mobile")
      .getPublicUrl(imageResponse.path);

    // alertAndLog("Log", storedFile.publicUrl);

    //
    // ** Upload Metadata to Arweave **
    //

    const metadata = {
      name: imagePickerAsset.fileName!,
      description: "This NFT was minted using solana mobile",
      image: storedFile.publicUrl,
      external_url: "https://github.com/dperdic/s7-solana-mobile-dev",
      attributes: [
        {
          trait_type: "Latitude",
          value: locationData.latitude,
        },
        {
          trait_type: "Longitude",
          value: locationData.longitude,
        },
      ],
      properties: {
        files: [
          {
            uri: storedFile.publicUrl,
            type: "image/jpeg",
          },
        ],
        category: "image",
      },
    };

    // Call upon umi's uploadJson function to upload our metadata to Arweave via Irys.
    console.log("Uploading metadata...");

    const { data: metadataResponse, error: metadataError } =
      await supabase.storage
        .from("solana-mobile")
        .upload(
          `nfts/metadata/${imagePickerAsset.fileName?.split(".")[0]}.json`,
          JSON.stringify(metadata),
          {
            contentType: "application/json",
            upsert: true,
          }
        );

    if (metadataError) {
      alertAndLog(
        "Minting failed",
        "An error occured while uploading metadata"
      );

      return;
    }

    const { data: metadataUri } = supabase.storage
      .from("solana-mobile")
      .getPublicUrl(metadataResponse.path);

    // alertAndLog("Log", metadataUri.publicUrl);

    // const metadataUri = await umi.uploader.uploadJson(metadata).catch((err) => {
    //   throw new Error(err);
    // });

    //
    // ** Creating the Nft **
    //

    umi.identity;

    // We generate a signer for the Nft
    const nftSigner = generateSigner(umi);

    // Decide on a ruleset for the Nft.
    // Metaplex ruleset - publicKey("eBJLFYPxJmMGKuFwpDWkzxZeUrad92kZRC5BJLpzyT9")
    // Compatability ruleset - publicKey("AdH2Utn6Fus15ZhtenW4hZBQnvtLgM1YCW2MfVp7pYS5")
    const ruleset = publicKey("eBJLFYPxJmMGKuFwpDWkzxZeUrad92kZRC5BJLpzyT9"); // or set a publicKey from above

    console.log("Creating Nft...");
    // const tx = await createNft(umi, {
    //   mint: nftSigner,
    //   sellerFeeBasisPoints: percentAmount(5.5),
    //   name: metadata.name,
    //   uri: metadataUri.publicUrl,
    // }).sendAndConfirm(umi);

    const ix = createNft(umi, {
      mint: nftSigner,
      sellerFeeBasisPoints: percentAmount(5.5),
      name: metadata.name,
      uri: metadataUri.publicUrl,
    });

    console.log(ix);

    let tx;

    try {
      tx = await ix.sendAndConfirm(umi, {
        send: { skipPreflight: true, commitment: "confirmed", maxRetries: 3 },
      });
    } catch (error) {
      console.log(error);
      return;
    }

    // const tx = await createNft(umi, {
    //   mint: nftSigner,
    //   sellerFeeBasisPoints: percentAmount(5.5),
    //   name: metadata.name,
    //   uri: metadataUri.publicUrl,
    // }).sendAndConfirm(umi);

    // Finally we can deserialize the signature that we can check on chain.
    const signature = base58.deserialize(tx.signature)[0];

    // Log out the signature and the links to the transaction and the NFT.
    console.log("\npNFT Created");
    console.log("View Transaction on Solana Explorer");
    console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    console.log("\n");
    console.log("View NFT on Metaplex Explorer");
    console.log(
      `https://explorer.solana.com/address/${umi.identity.publicKey}?cluster=devnet`
    );
  };

  return useMemo(() => ({ createNft: createNFT }), [createNFT]);
}

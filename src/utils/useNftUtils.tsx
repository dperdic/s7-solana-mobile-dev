import { createNft } from "@metaplex-foundation/mpl-token-metadata";
import { generateSigner, percentAmount } from "@metaplex-foundation/umi";
import { useAuthorization } from "./useAuthorization";
import { useMemo } from "react";
import { alertAndLog, getLocation } from "./functions";
import { base58 } from "@metaplex-foundation/umi-serializers";
import { supabase } from "./supabase";
import { ImagePickerAsset } from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { useUmi } from "./UmiProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useConnection } from "./ConnectionProvider";
import * as FileSystem from "expo-file-system";

export function useNftUtils() {
  const { selectedAccount } = useAuthorization();
  const { connection } = useConnection();
  const queryClient = useQueryClient();
  const umi = useUmi();

  const createNFT = async (imagePickerAsset: ImagePickerAsset) => {
    if (!selectedAccount?.publicKey) {
      return;
    }

    //
    // ** Setting Up Umi **
    //

    const locationData = await getLocation();

    if (!locationData) {
      alertAndLog("Minting failed", "Location coordinates not found");

      return;
    }

    const base64ImageFile = await FileSystem.readAsStringAsync(
      imagePickerAsset.uri,
      {
        encoding: FileSystem.EncodingType.Base64,
      }
    );

    console.log("Uploading image...");

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

    //
    // ** Upload Metadata to Supabase **
    //

    const metadata = {
      name: imagePickerAsset.fileName!,
      description: "This NFT was minted using solana mobile by dperdic",
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

    //
    // ** Create the Nft **
    //

    const mint = generateSigner(umi);

    console.log("Creating Nft...");

    let tx;

    try {
      tx = await createNft(umi, {
        mint: mint,
        sellerFeeBasisPoints: percentAmount(5.5),
        name: metadata.name,
        uri: metadataUri.publicUrl,
      }).sendAndConfirm(umi, {
        send: { skipPreflight: true, commitment: "confirmed", maxRetries: 3 },
      });
    } catch (error) {
      console.log(error);
      return;
    }

    const signature = base58.deserialize(tx.signature)[0];

    // refresh home page
    queryClient.invalidateQueries({
      queryKey: [
        "get-token-accounts",
        {
          endpoint: connection.rpcEndpoint,
          address: selectedAccount.publicKey,
        },
      ],
    });

    // Log out the signature and the links to the transaction and the NFT.
    console.log("\npNFT Created");
    console.log("View Transaction on Solana Explorer");
    console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    console.log("\n");
    console.log("View NFT on Metaplex Explorer");
    console.log(
      "https://solana.fm/address/DM9BAeAnAfgAZk7ggXF1QFWgk4QSAJGnFNj5yoRa3nPF/transactions?cluster=devnet-alpha",
      `https://explorer.solana.com/address/${umi.identity.publicKey}?cluster=devnet`
    );

    alertAndLog("Mint successful", "The NFT has been created successfuly!");
  };

  return useMemo(() => ({ createNFT }), [createNFT]);
}

import {
  transact,
  Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import { Account, useAuthorization } from "./useAuthorization";
import {
  Transaction,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js";
import { useCallback, useMemo } from "react";
import { SignInPayload } from "@solana-mobile/mobile-wallet-adapter-protocol";

export function useMobileWallet() {
  const { authorizeSessionWithSignIn, authorizeSession, deauthorizeSession } =
    useAuthorization();

  const connect = useCallback(async (): Promise<Account> => {
    return await transact(async (wallet: Web3MobileWallet) => {
      return await authorizeSession(wallet);
    });
  }, [authorizeSession]);

  const signIn = useCallback(
    async (signInPayload: SignInPayload): Promise<Account> => {
      return await transact(async (wallet: Web3MobileWallet) => {
        return await authorizeSessionWithSignIn(wallet, signInPayload);
      });
    },
    [authorizeSession]
  );

  const disconnect = useCallback(async (): Promise<void> => {
    await transact(async (wallet: Web3MobileWallet) => {
      await deauthorizeSession(wallet);
    });
  }, [deauthorizeSession]);

  const signAndSendTransaction = useCallback(
    async (
      transaction: Transaction | VersionedTransaction
    ): Promise<TransactionSignature> => {
      return await transact(async (wallet: Web3MobileWallet) => {
        await authorizeSession(wallet);
        const signatures = await wallet.signAndSendTransactions({
          transactions: [transaction],
        });
        return signatures[0];
      });
    },
    [authorizeSession]
  );

  const signTransactionForUmi = useCallback(
    async (transaction: any): Promise<any> => {
      return await transact(async (wallet: Web3MobileWallet) => {
        await authorizeSession(wallet);
        const signatures = await wallet.signTransactions({
          transactions: [transaction],
        });
        return signatures[0];
      });
    },
    [authorizeSession]
  );

  const signAllTransactionsForUmi = useCallback(
    async (transactions: any[]): Promise<any[]> => {
      return await transact(async (wallet: Web3MobileWallet) => {
        await authorizeSession(wallet);
        const signatures = await wallet.signTransactions({
          transactions: transactions,
        });
        return signatures;
      });
    },
    [authorizeSession]
  );

  const signMessage = useCallback(
    async (message: Uint8Array): Promise<Uint8Array> => {
      return await transact(async (wallet: Web3MobileWallet) => {
        const authResult = await authorizeSession(wallet);
        const signedMessages = await wallet.signMessages({
          addresses: [authResult.address],
          payloads: [message],
        });
        return signedMessages[0];
      });
    },
    [authorizeSession]
  );

  return useMemo(
    () => ({
      connect,
      signIn,
      disconnect,
      signAndSendTransaction,
      signTransactionForUmi,
      signAllTransactionsForUmi,
      signMessage,
    }),
    [
      signAndSendTransaction,
      signTransactionForUmi,
      signAllTransactionsForUmi,
      signMessage,
    ]
  );
}

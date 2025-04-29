import { createContext, useContext, useEffect, useState } from 'react';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';

const SolanaContext = createContext();

export const SolanaProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [balance, setBalance] = useState(0);
  const [connection] = useState(new Connection('https://api.mainnet-beta.solana.com'));
  const ownerWallet = new PublicKey('OWNER_WALLET_PUBKEY_HERE'); // Replace with your wallet

  const connectWallet = async () => {
    const phantom = new PhantomWalletAdapter();
    try {
      await phantom.connect();
      setWallet(phantom);
      setPublicKey(phantom.publicKey);
      await updateBalance(phantom.publicKey);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = async () => {
    if (wallet) {
      await wallet.disconnect();
      setWallet(null);
      setPublicKey(null);
      setBalance(0);
    }
  };

  const updateBalance = async (pubKey) => {
    if (pubKey) {
      const balance = await connection.getBalance(pubKey);
      setBalance(balance / 10 ** 9); // Convert lamports to SOL
    }
  };

  const sendTransaction = async (toPublicKey, amount) => {
    if (!wallet || !publicKey) return null;
    
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: toPublicKey,
        lamports: amount * 10 ** 9, // Convert SOL to lamports
      })
    );
    
    transaction.feePayer = publicKey;
    transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
    
    const signed = await wallet.signTransaction(transaction);
    const txid = await connection.sendRawTransaction(signed.serialize());
    
    await connection.confirmTransaction(txid);
    await updateBalance(publicKey);
    
    return txid;
  };

  useEffect(() => {
    if (window.solana?.isPhantom) {
      const phantom = new PhantomWalletAdapter();
      phantom.on('connect', (publicKey) => {
        setWallet(phantom);
        setPublicKey(publicKey);
        updateBalance(publicKey);
      });
      phantom.on('disconnect', () => {
        setWallet(null);
        setPublicKey(null);
        setBalance(0);
      });
      
      // Try to reconnect if previously connected
      phantom.connect().catch(() => {});
    }
  }, []);

  return (
    <SolanaContext.Provider value={{
      wallet,
      publicKey,
      balance,
      ownerWallet,
      connectWallet,
      disconnectWallet,
      sendTransaction,
      updateBalance,
      connection
    }}>
      {children}
    </SolanaContext.Provider>
  );
};

export const useSolana = () => useContext(SolanaContext);
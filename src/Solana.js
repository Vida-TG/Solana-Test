import "./App.css";
import { useEffect, useState } from "react";

import * as solanaWeb3 from "@solana/web3.js";

export default function Solana() {
  const [walletAddress, setWalletAddress] = useState(
    window.localStorage.getItem("solanaPublicKey")
  );
  const [balance, setBalance] = useState();

  function createWallet() {
    let payer = solanaWeb3.Keypair.generate();
    setWalletAddress(payer?.publicKey?.toBase58());
    window.localStorage.setItem("solanaPublicKey", payer?.secretKey);

    console.log(payer?.secretKey);
  }

  async function makePay() {
    // Airdrop SOL for paying transactions
    const localKey = window.localStorage.getItem("solanaPublicKey");

    const secretKey = localKey.split(",");

    const seed = Uint8Array.from(secretKey);

    let payer = solanaWeb3.Keypair.fromSecretKey(seed);

    let connection = new solanaWeb3.Connection(
      solanaWeb3.clusterApiUrl("devnet"),
      "confirmed"
    );

    let airdropSignature = await connection.requestAirdrop(
      payer.publicKey,
      solanaWeb3.LAMPORTS_PER_SOL
    );

    await connection.confirmTransaction(airdropSignature);

    let toAccount = solanaWeb3.Keypair.generate();

    // Create Simple Transaction
    let transaction = new solanaWeb3.Transaction();

    // Add an instruction to execute
    transaction.add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: toAccount.publicKey,
        lamports: 1000,
      })
    );

    // Send and confirm transaction
    // Note: feePayer is by default the first signer, or payer, if the parameter is not set
    const pay = await solanaWeb3.sendAndConfirmTransaction(
      connection,
      transaction,
      [payer]
    );

    console.log(pay);
  }

  useEffect(() => {
    async function connectToSolana() {
      const connection = new solanaWeb3.Connection(
        solanaWeb3.clusterApiUrl("testnet")
      );

      const localKey = window.localStorage.getItem("solanaPublicKey");

      const secretKey = localKey.split(",");

      const seed = Uint8Array.from(secretKey);

      let accountFromSeed = solanaWeb3.Keypair.fromSecretKey(seed);

      console.log(accountFromSeed);

      const balanceR = await connection.getBalance(accountFromSeed?.publicKey);

      setBalance(balanceR);
    }

    if (walletAddress) {
      connectToSolana();
    }
  }, [walletAddress]);

  return (
    <div className="App">
      <header className="App-header">
        {!walletAddress ? (
          <button type="button" className="App-link" onClick={createWallet}>
            Create Wallet
          </button>
        ) : (
          <div>
            Public Key: {walletAddress}
            <br />
            <br />
            Balance: {balance}
            <br />
            <br />
            <button type="button" className="App-link" onClick={makePay}>
              Make Transaction
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

/* eslint-disable no-undef */
import "./App.css";
import { useEffect, useState } from "react";

const ethers = require("ethers");

function App() {
  const [walletAddress, setWalletAddress] = useState(
    window.localStorage.getItem("wallet")
  );
  const [ethBal, setEthBal] = useState();
  const [usdcBal, setUsdcBal] = useState();
  const [loading, setLoading] = useState(false);
  const [fakeWallet, setFakeWallet] = useState(null);
  const [walletPhrase, setWalletPhrase] = useState(
    window.localStorage.getItem("walletPhrase")
  );

  function createWallet() {
    if (!walletAddress) {
      const wallet = ethers.Wallet.createRandom();
      setWalletPhrase(wallet.mnemonic.phrase);
      setFakeWallet(wallet.address);
    } else {
      return false;
    }
  }

  function setWallet() {
    window.localStorage.setItem("wallet", fakeWallet);
    window.localStorage.setItem("walletPhrase", walletPhrase);
    setWalletAddress(fakeWallet);
  }

  const provider = ethers.getDefaultProvider("ropsten", {
    // Replace the following with your own INFURA API key
    infura: "6ef6e5f6447f4778ba900247fd153805",
  });

  async function getFakeUSDC() {
    const account = ethers.Wallet.fromMnemonic(walletPhrase).connect(provider);

    const usdc = new ethers.Contract(
      "0x68ec573C119826db2eaEA1Efbfc2970cDaC869c4",
      ["function gimmeSome() external"],
      account
    );

    const tx = await usdc.gimmeSome({ gasPrice: 20e9 });
    alert(`Transaction hash: ${tx.hash}`);
    console.log(`Transaction hash: ${tx.hash}`);

    const receipt = await tx.wait();
    alert(
      `Transaction confirmed in block ${
        receipt.blockNumber
      }\\Gas used: ${receipt.gasUsed.toString()}`
    );

    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);
  }

  async function transferUSDC() {
    setLoading(true);
    const account = ethers.Wallet.fromMnemonic(walletPhrase).connect(provider);

    // Define balanceOf and transfer functions in the contract
    const usdc = new ethers.Contract(
      "0x68ec573C119826db2eaEA1Efbfc2970cDaC869c4",
      [
        "function balanceOf(address _owner) public view returns (uint256 balance)",
        "function transfer(address _to, uint256 _value) public returns (bool success)",
      ],
      account
    );

    let to = "0xDE4E7Df5094b8DB17579cB9f9fb61019ae3a7546",
      value = "10";

    // Parse the first argument - recipient address
    try {
      ethers.utils.getAddress(to);
    } catch {
      console.error(`Invalid address: ${to}`);
      alert(`Invalid address: ${to}`);
      return false;
    }

    // Parse the second argument - amount
    // try {
    //   ethers.utils.parseUnits(value, 6);
    //   if (value.isNegative()) {
    //     throw new Error();
    //   }
    // } catch {
    //   console.error(`Invalid amount: ${value}`);
    //   alert(`Invalid amount: ${value}`);
    //   return false;
    // }
    const valueFormatted = ethers.utils.formatUnits(value, 6);

    // Check that the account has sufficient balance
    const balance = await usdc.balanceOf(account.address);
    if (balance.lt(value)) {
      const balanceFormatted = ethers.utils.formatUnits(balance, 6);

      alert(
        `Insufficient balance to send ${valueFormatted} (You have ${balanceFormatted})`
      );
      console.error(
        `Insufficient balance to send ${valueFormatted} (You have ${balanceFormatted})`
      );
      return false;
    }

    console.log(`Transferring ${valueFormatted} USDC to ${to}...`);
    alert(`Transferring ${valueFormatted} USDC to ${to}...`);

    // Submit a transaction to call the transfer function
    const tx = await usdc.transfer(to, value, { gasPrice: 20e9 });

    alert(`Transaction hash: ${tx.hash}`);
    console.log(`Transaction hash: ${tx.hash}`);

    const receipt = await tx.wait();

    setLoading(false);

    alert(`Transaction confirmed in block ${receipt.blockNumber}`);
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
  }

  useEffect(() => {
    async function initiateBal() {
      if (walletPhrase) {
        const account =
          ethers.Wallet.fromMnemonic(walletPhrase).connect(provider);

        const balanceR = await account.getBalance();

        setEthBal(balanceR);

        const usdc = new ethers.Contract(
          "0x68ec573C119826db2eaEA1Efbfc2970cDaC869c4",
          [
            "function balanceOf(address _owner) public view returns (uint256 balance)",
          ],
          account
        );

        const usdcBalance = await usdc.balanceOf(account.address);

        setUsdcBal(usdcBalance);
      }
    }
    initiateBal();
  }, [walletPhrase, provider]);

  return (
    <div className="App">
      <header className="App-header">
        {!walletAddress ? (
          fakeWallet ? (
            <div>
              Wallet Address: {fakeWallet} <br />
              Wallet Phrase: {walletPhrase} <br />
              <br />
              <button type="button" className="App-link" onClick={setWallet}>
                Continue
              </button>
            </div>
          ) : (
            <button type="button" className="App-link" onClick={createWallet}>
              Create Wallet
            </button>
          )
        ) : (
          <div>
            Wallet Address: {walletAddress} <br />
            ETH Balance: {ethBal && ethers.utils.formatUnits(ethBal, 18)}
            <br />
            USDC Balance: {usdcBal && ethers.utils.formatUnits(usdcBal, 6)}{" "}
            <br /> <br />
            <button type="button" className="App-link" onClick={transferUSDC}>
              {loading ? "Loading" : "Send USDC to John"}
            </button>
            <br /> <br />
            <button type="button" className="App-link" onClick={getFakeUSDC}>
              Get Fake USDC
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;

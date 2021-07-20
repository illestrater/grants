import React from "react";
import { NextSeo } from "next-seo";

export default function WalletTutorial() {
  return (
    <div className="content-block">
      <NextSeo
        title="Wallet"
        description="MetaMask is the recommended wallet to interact with NFT platforms as well as other apps on Ethereum."
      />
      <div className="text-l text-b">Getting Started</div>
      <div className="text-s margin-top-s text-desc">Setting up a wallet</div>
      <div className="page-container margin-top">
        <div className="text-m">1) Get MetaMask</div>
        <div className="text-s margin-top-s">
          MetaMask is the recommended wallet to interact with NFT platforms as
          well as other apps on Ethereum.
          <br />
          <br />
          Get the{" "}
          <a
            className="pointer text-grey"
            hef={"https://metamask.io/download.html"}
          >
            Chrome Extension
          </a>{" "}
          (Recommended) and/or install the app on a mobile device.
        </div>
        <div className="text-m margin-top">
          2) Setup Your Wallet on MetaMask
        </div>
        <div className="text-s margin-top-s">
          Go through the setup process on MetaMask. It will ask you to write
          down 12 words and keep it in a safe place - it is HIGHLY recommended
          to do this as this is your password and access key. You can use these
          12 words to share the same wallet account on both browser and mobile
          app.
          <br />
          <br />
          The best way to ensure you won't lose your password is to write down
          these 12 words and give it to a family member or friend who you trust
          with your life as a backup in case you lose yours.
          <br />
          <br />
          If you would like the strongest security option, consider getting a{" "}
          <a
            target="_blank"
            className="pointer text-grey"
            href="https://medium.com/radartech/hardware-wallets-explained-da8bd93ce801"
          >
            hardware wallet
          </a>{" "}
          to connect via browser.
        </div>
        <div className="text-m margin-top">
          3) Connect your wallet to an app
        </div>
        <div className="text-s margin-top-s">
          When you use an Ethereum app (decentralized app / dApp), the site may
          prompt you verify an action that you do, such as logging in or sending
          a transaction. All of these prompts will ask you, through MetaMask, to
          sign the action which verifies that you are physical owner of the
          keys.
        </div>
        <div className="text-m margin-top">
          4) Fund Your MetaMask Wallet (Optional)
        </div>
        <div className="text-s margin-top-s">
          To mint, transfer, or exchange an NFT or currency (i.e. a
          transaction), it will cost a fee to use the network. This fee is
          called "gas" on Ethereum in which you pay using the crypto currency
          Ether (ETH). In your wallet, you will see a deposit address (e.g.
          0x777Bc2a...) in your MetaMask.
          <br />
          <br />
          Purchase ETH on a crypto currency exchange, such as Coinbase, Gemini
          or Binance, and withdraw to this deposit address.
          <br />
          <br />
          <i>
            Grant recipients will receive all ETH necessary directly from Sevens
            to participate
          </i>
        </div>
        <br />
      </div>
    </div>
  );
}

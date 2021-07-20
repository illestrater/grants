import React from "react";
export default function OpenSeaTutorial() {
  return (
    <div className="content-block">
      <div className="text-l text-b">Minting on OpenSea</div>
      <div className="page-container margin-top-l">
        <div className="text-m">1) Connect your wallet on OpenSea</div>
        <div className="text-s margin-top-s">
          Open your MetaMask extension and ensure your correct wallet is
          selected. A{" "}
          <span
            target="_blank"
            className="pointer text-grey"
            href="https://medium.com/radartech/hardware-wallets-explained-da8bd93ce801"
          >
            hardware wallet
          </span>{" "}
          is recommended to have full self sovereign control over your keys.
          Once you connect your wallet MetaMask will prompt you to sign the
          message to log in. You will notice no password is needed, securing
          your recovery phrase is all you need to do and your wallet is your
          access key!
        </div>
        <div className="text-m margin-top">2) Edit account settings</div>
        <div className="text-s margin-top-s">
          Edit your profile to your preference, express yourself if you'd like!
        </div>
        <div className="text-m margin-top">3) Create a collection</div>
        <div className="text-s margin-top-s">
          Click Create → My Collections in the top right of the website. To
          create an NFT on OpenSea, you must first create a collection in which
          all of your pieces will be grouped together. Give it a name and
          optionally give it a description and add a logo.{" "}
          <a target="_blank" href="/rarible" className="text-grey remove-a">
            Rarible
          </a>{" "}
          is an alternative option if you'd like to mint your NFT as a
          standalone without being in a specific collection.
        </div>
        <div className="text-m margin-top">4) Create your NFT</div>
        <div className="text-s margin-top-s">
          Click Add New Item in the collection and upload your art piece! An
          additional cover / thumbnail is recommended if it's in video format in
          order to display a specific frame or animation when people are
          browsing and haven't yet clicked into your listing. Give your artwork
          a name and optional URL and description.
        </div>
        <div className="text-m margin-top">5) List your piece for sale</div>
        <div className="text-s margin-top-s">
          On your NFT's page, click the blue button 'Sell' up top. There are a
          few different ways to sell your NFT, choose a selling method to list
          your piece on the market!
        </div>
        <br />
      </div>
    </div>
  );
}

import React from "react";

export default function RaribleTutorial() {
  return (
    <div className="content-block">
      <div className="text-l text-b">Minting on Rarible</div>
      <div className="page-container margin-top-l">
        <div className="text-m">1) Connect your wallet on Rarible</div>
        <div className="text-s margin-top-s">
          Open your MetaMask extension and ensure your correct wallet is
          selected. A{" "}
          <a
            target="_blank"
            className="pointer text-grey"
            href="https://medium.com/radartech/hardware-wallets-explained-da8bd93ce801"
          >
            hardware wallet
          </a>{" "}
          is recommended to have full self sovereign control over your keys. You
          will notice no password is needed, securing your recovery phrase is
          all you need to do and your wallet is your access key!
        </div>
        <div className="text-m margin-top">2) Confirm account</div>
        <div className="text-s margin-top-s">
          Confirm registration and edit your profile to your preference, express
          yourself if you'd like!
        </div>
        <div className="text-m margin-top">3) Create your first NFT</div>
        <div className="text-s margin-top-s">
          Click the blue button "Create" in the top right of the website. Choose
          between single or multiple editions of your artwork - selling a single
          (1/1) piece is a great route to take and is recommended for your first
          NFT.
        </div>
        <div className="text-m margin-top">4) Upload your artwork</div>
        <div className="text-s margin-top-s">
          Upload your art piece! An additional cover / preview is recommended if
          it's in video format in order to display a specific frame or animation
          when people are browsing and haven't yet clicked into your listing.
        </div>
        <div className="text-m margin-top">5) Market dynamics</div>
        <div className="text-s margin-top-s">
          You can set a listing price or leave it up for bidding. Setting too
          high of a price could possibly go wrong for your own expectations and
          perception. Most big crypto artists started off small even with a big
          following, but as always, your decisions are your choice!
        </div>
        <div className="text-m margin-top">5) Name & Royalties</div>
        <div className="text-s margin-top-s">
          As with any piece of art, give it a name and optional description.
          Also, set a royalty percentage! Whenever someone makes a secondary
          sale of your NFT, you will receive this percentage of the sale as a
          commission. This means you can continue to receive an income stream as
          it switches hands.
        </div>
        <div className="text-m margin-top">5) Optional customization</div>
        <div className="text-s margin-top-s">
          You have more options to pack into your NFT. You can add unlockable
          content and also add custom details if you'd like. If you'd like to
          put out a large collection of work with its own title and profile, you
          can choose to create one.
        </div>
        <div className="text-m margin-top">6) Confirm and mint</div>
        <div className="text-s margin-top-s">
          Make sure everything is just the way you want, and click Create Item!
          Follow the steps, and whenever it prompts you to sign and confirm, do
          so using your wallet. Do note when a contract method is called, such
          as minting or creating a collection, it will cost gas fees.{" "}
          <a target="_blank" href="/opensea" className="text-grey remove-a">
            OpenSea
          </a>{" "}
          is an alternative option if you'd like to list an NFT with different
          selling methods and less upfront costs for listing.
        </div>
        <br />
      </div>
    </div>
  );
}

import React, { useState } from "react";

export default function LearnPage() {
  return (
    <div className="content-block">
      <div className="text-l text-b">
        <strong>Learn</strong>
      </div>
      <div className="text-s margin-top-s">There's a new future for art?</div>
      <div className="page-container margin-top">
        <div className="text-l text-b">
          <strong>NFT FAQ</strong>
        </div>
        <Block
          title="What is an NFT?"
          text="An NFT, or a Non-Fungible Token, represents a single asset with ownership. This asset can represent many things ranging
                from concert tickets to video game items, but we believe art is the most important piece of the puzzle."
        />
        <Block
          title="Who owns it?"
          text="There is a single owner (usually) and it cannot be controlled by anyone else.
              It can be transferred or exchanged for currency, and its history of owners, known as provenance, is all recorded forever."
        />
        <Block
          title="What exactly does provenance mean?"
          text={`An NFT's ownership history and its unique properties are reliably tracked on a blockchain, namely Ethereum.
              This data is public which means that anyone can provably verify its origination, prior, and current owners.`}
        />
        <Block
          title="What makes an NFT so profound?"
          text={`Due to the nature of the blockchain, it can be globally exchanged with another without any middlemen or friction
              with its provenance available as absolute source of truth. There is now a global market for virtually any digital asset in which you can prove
              ownership over.`}
        />
        <Block
          title={`Can't someone just copy and paste artwork?`}
          text={`Yes, and in this context that's a good thing as it means that artwork is being shared with more visibility. But that person does not own the asset!
              Downloading and owning a file is vastly different than owning an NFT, for reasons mentioned above.`}
        />
        <div className="margin-top-l text-l text-b">
          <strong>About Sevens Foundation</strong>
        </div>
        <Block
          title="What makes Sevens unique to NFTs?"
          text="We provide a curation framework for curators to view art submissions with little emphasis on prior success
              through tools such as optional blind voting and single art submissions. Although the story of an artist is also important, we believe art should speak for itself and
              we are rooted in elevating emerging and undiscovered talent. We also built Sevens to present digital art in a way that closely mirrors the experience we are familiar with when viewing physical art.
              We strive to bridge the gap between the traditional and digital art realms."
        />
        <Block
          title="Can I mint freely here?"
          text={`Sevens is not an open minting platform. We believe in curation through a unified theme & experience similar to how traditional art galleries present
              artworks. We operate on a single art submission-per-exhibition basis and leave it up to the curators to decide what is minted. Each exhibition seeks different criteria and if you meet them you are
              free to submit your artwork to be potentially curated into the exhibition.`}
        />
        <Block
          title="How may I collect artwork on Sevens?"
          text={`You may do so completely within our website. We use OpenSea's API so the bidding, listing, and auction mechanics
              are the same as OpenSea's - but everything works in-house. We do not present historical sales data on Sevens because we believe that immediately presenting a valuation creates bias
              towards the art piece, but you may certainly find that info on OpenSea. We also operate as decentralized as possible, so you must use an Ethereum wallet to create transactions.`}
        />
        <Block
          title="Do artists receive royalties?"
          text={`We have 10% secondary sale royalties built within our contracts, but it currently will only be paid out if an artwork is resold on Rarible.
              As we are reliant on using OpenSea auction and listing mechanics, royalties unfortunately will not be paid out until they implement our contract's royalty standard
              and they have expressed their intent to do so in the future.`}
        />
        <Block
          title="Do you take profits?"
          text={`We take 0% on all sales. We are fortunate and grateful to be able to operate pro-bono and have gracious donors to help fund our programs.
              But, there is an automated 2.5% fee that OpenSea takes for using their integrations on any exchanges that happens in-house.`}
        />
        <div className="margin-top-l text-l text-b">
          <strong>Technical FAQ</strong>
        </div>
        <Block
          title="How decentralized is Sevens?"
          text={`Decentralization is a core ethos of ours because it is the paradigm that makes NFTs powerful. Curators create NFT collections (ERC721)
              with their own wallet and provide Sevens permission to mint on their behalf - they can revoke this permission after the exhibition is minted
              or at any time. We do not have custody and all NFTs are minted directly from the artist's verified wallet. That being said, centralization is important to the extent
              that it makes sense, and our curation tooling and website are parts of the platform that we control and update. It is currently too difficult to operate this all on decentralized 
              services but we will migrate when it is possible.`}
        />
        <Block
          title={`Where are the NFT's art assets stored?`}
          text={`We believe in asset permanence, and that all artworks should live forever. We are not confident IPFS provides this promise and
              have chosen to store all assets on Arweave which is an incentivized file storage blockchain which brings more confidence and guarantees that the artworks will exist permanently. Shout out to j1mmy.eth
              for pioneering the advocacy.`}
        />
        <Block
          title={`Which blockchain does Sevens use?`}
          text={`Our NFTs are on the Ethereum blockchain. We owe Ethereum immense thanks for making this all possible. We chose Ethereum because
              the amount of tooling and infrastructure is extremely robust and standardized in a way no other blockchain is.`}
        />
        <Block
          title={`Network usage fees are too high are they not?`}
          text={`This is absolutely correct - current gas costs are unacceptable. It is the reason Sevens Foundation was created, to allow a launchpad
              for people who hesitate or cannot afford to make such a large investment in themselves when they surely should, even with this given landscape. But scaling solutions on Ethereum are coming, and they are
              coming fast. This is a temporary problem that will be resolved in which we will migrate and upgrade when the time is right.`}
        />
        <Block
          title={`The environmental impacts are not acceptable?`}
          text={`No they are not, and we are committed to reducing carbon footprint as an organization. However, 
              traditional infrastructure and servers - for example the existing banking systems - are just as wasteful and more. This is definitely not to be an excuse for carbon emissions, 
              but fortunately Ethereum will eventually migrate to a different security mechanism that will reduce emissions by 99%. We believe the negative stigma towards NFTs is blown out of proportion 
              in a way that does not capture the larger picture of how our world is currently operating.`}
        />
      </div>
      <div className="text-l text-b margin-top">
        <strong>Resources</strong>
      </div>
      <div className="text-s margin-top-s">Learn more about NFTs</div>
      <div className="page-container text-m">
        <a
          target={"_blank"}
          href="https://www.youtube.com/watch?v=a8ww4aNlPQU"
          className="text-grey pointer margin-top"
        >
          Mankind's "What is an NFT?"
        </a>
        <br />
        <a
          target={"_blank"}
          href="https://www.loop-news.com/p/beginners-guide-crypto-art-and-nfts"
          className="text-grey pointer margin-top"
        >
          Loopify's Beginners Guide
        </a>
        <br />
        <a
          target="_blank"
          href="https://coopahtroopa.mirror.xyz/PF42Z9oE_r6yhZN9jZrrseXfHaZALj9JIfMplshlgQ0"
          className="text-grey pointer margin-top"
        >
          Coopahtroopa's NFT Landscape
        </a>
        <br />
        <a
          className="text-grey pointer margin-top"
          href="https://parishilton.com/why-im-excited-about-nfts/"
        >
          Paris Hilton's "I'm Excited About NFTs—You Should Be Too"
        </a>
        <br />
        <a
          target="_blank"
          href="/tutorial"
          className="text-grey remove-a margin-top"
        >
          Setting up a wallet
        </a>
        <br />
        <a
          target="_blank"
          href="/opensea"
          className="text-grey remove-a margin-top"
        >
          Minting on OpenSea
        </a>
        <br />
        <a
          target="_blank"
          href="/rarible"
          className="text-grey remove-a margin-top"
        >
          Minting on Rarible
        </a>
        <br />
        <a
          target="_blank"
          href="https://discord.gg/a9dDyUCZWY"
          className="text-grey pointer margin-top"
        >
          Maalavidaa's Artist Mental Health Community
        </a>
        <br />
        <a
          target="_blank"
          className="text-grey pointer margin-top"
          href="https://goldstandard.org"
        >
          Reducing Carbon Footprint
        </a>
        <br />
        <br />
      </div>
    </div>
  );
}

const Block = ({ title, text }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="margin-top">
      <div
        className="flex pointer faq-title-container"
        onClick={() => setOpen(!open)}
      >
        <div className="text-m flex-full faq-title">{title}</div>
        <img
          src={open ? `/assets/up.png` : `/assets/down.png`}
          className="faq-toggle"
        />
      </div>
      <div className="line-spacer" />
      {open && <div className="text-s margin-top-s">{text}</div>}
    </div>
  );
};

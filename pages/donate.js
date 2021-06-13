import React from "react";

export default function DonatePage() {
  return (
    <div className="content-block">
      <div className="text-l text-b">Donors</div>
      <div className="text-s margin-top-s">
        We are endlessly grateful for all of our donors
      </div>
      <div className="page-container">
        <div className="text-s margin-top text-desc">
          Sevens Foundation is a non-profit organization committed to helping
          artists. Our donation address is{" "}
          <a
            className="text-s text-rainbow pointer"
            href="https://etherscan.io/address/foundation.eth"
            target="_blank"
          >
            foundation.eth
          </a>{" "}
          and intend to transition this to a decentralized autonomous
          organization.
        </div>
        <div className="text-m margin-top">Grant Donors</div>
        <a
          className="text-s margin-top-s text-grey pointer"
          href="https://parishilton.com/"
          target="_blank"
        >
          Paris Hiton
        </a>
        <div className="text-s">Platinum Donor</div>
        <a
          className="text-s margin-top-s text-grey pointer"
          href="https://twitter.com/illestrater_"
          target="_blank"
        >
          Tim Kang
        </a>
        <div className="text-s">Gold Donor</div>
        <a
          className="text-s margin-top-s text-grey pointer"
          href="https://twitter.com/etyoung"
          target="_blank"
        >
          Eric Young
        </a>
        <div className="text-s">Silver Donor</div>
        <a
          className="text-s margin-top-s text-grey pointer"
          href="https://twitter.com/WhaleShark_Pro"
          target="_blank"
        >
          Whaleshark
        </a>
        <div className="text-s">Silver Donor</div>
        <a
          className="text-s margin-top-s text-grey pointer"
          href="https://twitter.com/Weel25067618"
          target="_blank"
        >
          Weel
        </a>
        <div className="text-s">Bronze Donor</div>
        <br />
      </div>
    </div>
  );
}

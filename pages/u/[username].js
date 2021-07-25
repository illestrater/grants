import _ from 'lodash';
import React, { useState } from "react";

import { useStoreState, useStoreActions } from "easy-peasy";
import ReactAutolinker from "react-autolinker";
import Link from "next/link";
import dbConnect from "../../utils/dbConnect";
import User from "../../models/userModel";
import Gallery from "../../models/galleryModel";

import Resizer from "../../src/client/Components/Tools/Resizer";
import Collection from "../../src/client/Components/MyGallery/Collection.js";

export async function getServerSideProps(context) {
  await dbConnect();

  const { username } = context.query;

  const profile = await User.findOne(
    {
      username: {
        $regex: new RegExp(`^${ username.toLowerCase().trim() }$`, "i"),
      },
    },
    (err, user) => {
      if (err) return res.json(err);
      if (!user) return res.json({ error: "User does not exist" });
      return user;
    }
  ).select(
    "username first last artistName city country website twitter twitterVerified instagram about"
  );

  const galleries = await Gallery.find({ user: profile.id }).sort("order");

  galleries.forEach((gallery) => {
    const nfts = gallery.nfts;
    const sorted = _.sortBy(nfts, ["order"]);
    gallery.nfts = sorted;
  });

  console.log('hrm', username);

  return {
    props: {
      profile: JSON.parse(JSON.stringify(profile)),
      galleries: JSON.parse(JSON.stringify(galleries)),
      username
    },
  };
}

export default function Profile(props) {
  const { username } = props;
  const auth = useStoreState((state) => state.user.auth);
  const setAuth = useStoreActions((dispatch) => dispatch.user.setAuth);
  const small = useStoreState((state) => state.app.small);
  const [galleries, setGalleries] = useState(props?.galleries);
  const [data] = useState(props?.profile);

  const addNewGallery = (gallery) => {
    setGalleries([...galleries, gallery]);
  };

  const [logout, setLogout] = useState(false);
  const logMeOut = (e) => {
    setAuth({});
    setLogout(true);
  };

  const [editCollection, setEditCollection] = useState(false);
  const [copied, setCopied] = useState(false);

  let user = {};
  if (data) user = data;

  return (
    <div className="content-block">
      <Resizer />
      {!editCollection && (
        <div>
          {!data && (
            <div className="flex center">
              <div className="margin-top center">
                <div className="loading">
                  <div></div>
                  <div></div>
                </div>
              </div>
            </div>
          )}
          {logout && <a href="/" />}
          <div className="flex">
            <div className="username-container">
              <div className="text-l word-wrap">
                <strong>
                  {user.username
                    ? `${user.artistName ? user.artistName : user.username}`
                    : username}
                </strong>
                {user.twitterVerified && (
                  <img
                    src={"/assets/verified.png"}
                    className="profile-verified"
                    title="Twitter Verified"
                  />
                )}
              </div>
              {(user.first || user.last) && (
                <div className="text-s">
                  {user.first ? `${user.first} ` : ""}
                  {user.last}
                </div>
              )}
              {(user.city || user.country) && (
                <div className="text-s margin-top-xs">
                  <img className="earth-icon" src="/assets/earth.png" />
                  {user.city}, {user.country}
                </div>
              )}
            </div>
            <div className="flex-full" />
            <div className="share-icon-container">
              {auth && auth.username === user.username && (
                <div className="flex text-s">
                  <div className="flex-full" />
                  <span className="text-grey pointer" onClick={logMeOut}>
                    Logout
                  </span>
                </div>
              )}
              <div
                className={`${
                  auth && auth.username === user.username && "margin-top-xs"
                }`}
              >
                <img
                  src="/assets/share.png"
                  className="share-icon pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `https://curation.art/u/${user.username}`
                    );
                    setCopied(true);
                  }}
                />
                {copied && <div className="text-xs">URL Copied</div>}
              </div>
            </div>
          </div>
          <div className={`flex margin-top ${small ? "center" : ""} `}>
            {user.website && (
              <Link href={user.website}>
                <img
                  src="/assets/website.png"
                  className="social-icon-web pointer"
                  alt="Website"
                />
              </Link>
            )}
            {user.twitter && (
              <Link href={`https://twitter.com/${user.twitter}`}>
                <img
                  src="/assets/twitter.png"
                  className="social-icon"
                  alt="Twitter"
                />
              </Link>
            )}
            {user.instagram && (
              <Link href={`https://instagram.com/${user.instagram}`}>
                <img
                  src="/assets/instagram.png"
                  className="social-icon"
                  alt="Instagram"
                />
              </Link>
            )}
            {user.email && (
              <a href={`mailto:${user.email}`}>
                <img src={Email} className="social-icon" alt="Email" />
              </a>
            )}
          </div>
          <div className="margin-top line-breaks">
            <div className="text-l">
              <strong>About</strong>
            </div>
            <div className="margin-top-s text-mid">
              {user.about ? (
                <ReactAutolinker text={user.about} />
              ) : (
                <div>
                  {user.username
                    ? `${user.artistName ? user.artistName : user.username}`
                    : username}{" "}
                  is a beautiful soul.
                </div>
              )}
            </div>
            <br />
          </div>
        </div>
      )}
      <Collection
        galleries={galleries}
        addNewGallery={addNewGallery}
        editing={editCollection}
        setEditCollection={setEditCollection}
        setGalleries={setGalleries}
        username={username}
      />
    </div>
  );
}

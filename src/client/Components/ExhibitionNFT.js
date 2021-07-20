import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpring, animated } from "react-spring";
import OpenMarket from "./Market/OpenMarket.js";
import { isMobile } from "react-device-detect";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";

function openLink(page) {
  page = page.replace("@", "");
  let win = window.open(page, "_blank");
  win.focus();
}

const ExhibitionNFT = ({
  small,
  nft,
  src,
  important,
  hidden,
  contract,
  setHeight = () => {},
  order,
  ethPrice,
  audio,
  setAudio,
  metadata,
  url,
}) => {
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef();
  const video = useRef();
  const nftRef = useRef();

  const resizeContainer = () => {
    if (!hidden && nftRef && nftRef.current)
      setHeight(nftRef.current.clientHeight);
  };

  useEffect(() => {
    resizeContainer();
  }, [hidden, nftRef]);

  useEffect(() => {
    if (src) setLoaded(true);
  }, [src]);

  const [isFullScreen, setFullScreen] = useState(false);
  function fullScreen() {
    if (video.current) {
      video.current.muted = false;
      if (video.current.requestFullScreen) {
        video.current.requestFullScreen();
      } else if (video.current.webkitRequestFullScreen) {
        video.current.webkitRequestFullScreen();
      } else if (video.current.mozRequestFullScreen) {
        video.current.mozRequestFullScreen();
      } else if (video.current.msRequestFullscreen) {
        video.current.msRequestFullscreen();
      } else if (video.current.webkitEnterFullscreen) {
        video.current.webkitEnterFullscreen(); //for iphone this code worked
      }

      setMuted(false);
    } else {
      if (document.documentElement.requestFullScreen) {
        if (isFullScreen) document.exitFullscreen();
        else document.documentElement.requestFullScreen();
      } else if (document.documentElement.webkitRequestFullScreen) {
        if (isFullScreen) document.webkitExitFullscreen();
        else document.documentElement.webkitRequestFullScreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        if (isFullScreen) document.mozExitFullscreen();
        else document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.msRequestFullscreen) {
        if (isFullScreen) document.msExitFullscreen();
        else document.documentElement.msRequestFullscreen();
      } else if (document.documentElement.webkitEnterFullscreen) {
        if (isFullScreen) document.webkitExitFullscreen();
        else document.documentElement.webkitEnterFullscreen();
      }

      setFullScreen(!isFullScreen);
    }
  }

  const [start, setStart] = useState(null);
  useEffect(() => {
    document.addEventListener("webkitfullscreenchange", (event) => {
      if (!document.webkitIsFullScreen) {
        setFullScreen(false);
        if (video.current) {
          setTimeout(() => {
            video.current.play();
          });
        }
      } else setFullScreen(true);
    });

    return () => {
      document.removeEventListener("fullscreenchange", () => {});
    };
  }, []);

  const [muted, setMuted] = useState(true);
  function toggleAudio() {
    video.current.muted = !video.current.muted;
    setAudio(!video.current.muted);
    if (video.current.muted) setMuted(true);
    else setMuted(false);
  }

  useEffect(() => {
    if (hidden && video.current) {
      video.current.muted = true;
      setMuted(true);
    }

    if (!hidden && video.current) {
      video.current.currentTime = 0;
      if (audio) {
        video.current.muted = false;
        setMuted(false);
      }
    }
  }, [hidden]);

  useEffect(() => {
    if (loaded && video.current) {
      video.current.addEventListener("pause", (e) => {
        video?.current?.play();
      });
    }
  }, [loaded]);

  const contentProps = useSpring({
    opacity: order !== 2 ? 0 : 1,
    marginLeft: order === 2 ? 0 : order < 2 ? -2000 : 2000,
    config: { duration: 500 },
  });

  if (nft && nft.art) nft.imageType = nft.art.split(".")[1];
  let website, twitter, instagram;
  if (nft && nft.user && nft.user.website) website = nft.user.website;
  if (nft && nft.user && nft.user.twitter) twitter = nft.user.twitter;
  if (nft && nft.user && nft.user.instagram) instagram = nft.user.instagram;

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      <div className={`margin-top flex full-width text-black`} ref={nftRef}>
        {nft ? (
          <div className="flex-row sm:flex sm:gap-10 full-width">
            {!isFullScreen && !small && (
              <div className={`gallery-description`}>
                <div className="text-s">
                  <div className="gallery-plate metal linear">
                    <div className="text-s">
                      <strong>{nft.user.artistName}</strong>
                      <br />
                      {nft.user.country}{" "}
                      {nft.user.birthYear && `(b. ${nft.user.birthYear})`}
                    </div>
                    <div className="margin-top-s text-s text-b">
                      <strong>
                        <i>{nft.title || "Untitled"}</i>
                      </strong>
                      , 2021
                      <br />
                      {nft.canvas ? (
                        <div className="text-xs">{nft.canvas}</div>
                      ) : (
                        <div>{nft.imageType.toUpperCase()} as NFT</div>
                      )}
                    </div>
                    <div className="text-xs margin-top-s">
                      {nft.description.trim()}
                    </div>
                  </div>
                </div>
                <div className="flex flex-row items-center justify-center mt-3 center">
                  {website && (
                    <div>
                      <img
                        src="/assets/website.png"
                        className="account-social-web pointer"
                        alt="Website"
                        onClick={() => openLink(website)}
                      />
                    </div>
                  )}
                  {twitter && (
                    <div>
                      <img
                        src="/assets/twitter.png"
                        className="account-social pointer"
                        alt="Twitter"
                        onClick={() =>
                          openLink(
                            twitter.substring(0, 4) === "http" ||
                              twitter.substring(0, 3) === "www"
                              ? twitter
                              : `https://twitter.com/${twitter}`
                          )
                        }
                      />
                    </div>
                  )}
                  {instagram && (
                    <div>
                      <img
                        src="/assets/instagram.png"
                        className="account-social pointer"
                        alt="Instagram"
                        onClick={() =>
                          openLink(
                            instagram.substring(0, 4) === "http" ||
                              instagram.substring(0, 3) === "www"
                              ? instagram
                              : `https://instagram.com/${instagram}`
                          )
                        }
                      />
                    </div>
                  )}
                </div>
                {!small && !hidden && (
                  <OpenMarket
                    tokenId={nft.order}
                    contract={contract}
                    resizeContainer={resizeContainer}
                    ethPrice={ethPrice}
                    artistWallet={nft.user.wallet}
                  />
                )}
              </div>
            )}
            <div className={`flex-full center w-full`}>
              <AnimatePresence initial={!isMobile}>
                <motion.div
                  initial={{ x: 200, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -200, opacity: 0 }}
                  key={`${nft?.artWeb}`}
                  className={`gallery-art`}
                  transition={{
                    default: {
                      duration: 1,
                      type: "spring",
                      bounce: 0,
                    },
                    opacity: { duration: 1.5 },
                  }}
                  className="shadow-2xl frame gallery-art-container"
                >
                  <div className="frame-shadow">
                    {(nft.imageType === "mp4" || nft.imageType === "mov") && (
                      <video
                        muted
                        loop
                        autoPlay
                        webkit-playsinline="true"
                        playsInline
                        ref={video}
                        key={`${src}-video`}
                        className={`gallery-art`}
                      >
                        <source
                          src={`https://cdn.grants.art/${nft.artWeb}`}
                          type={`video/${nft.imageType}`}
                        />
                      </video>
                    )}

                    {nft.imageType !== "mp4" && nft.imageType !== "mov" && (
                      <Image
                        quality="95"
                        layout="responsive"
                        src={`https://cdn.grants.art/${nft.artWeb}`}
                        width={metadata.width}
                        height={metadata.height}
                      />
                    )}

                    {isFullScreen && !video.current && (
                      <div className="fullscreen-container">
                        <img
                          src="/assets/minscreen.png"
                          className="frame-exit pointer"
                          onClick={() => fullScreen()}
                        />
                        <img
                          className="gallery-art-fullscreen"
                          src={`https://cdn.grants.art/${nft.art}`}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex flex-row items-center justify-center mt-3 transition-opacity duration-1000">
                <Link href={`/${url}/all`} className="pointer">
                  <img src="/assets/tile.png" className="frame-control" />
                </Link>
                <img
                  src="/assets/secure.png"
                  className="margin-left-s margin-top-xs frame-control pointer"
                  onClick={() => openLink(`https://arweave.net/${nft.arweave}`)}
                />
                <div className="flex-full" />
                {video && video.current && (
                  <div onClick={() => toggleAudio()} className="pointer">
                    {muted ? (
                      <img src="/assets/muted.png" className="frame-control" />
                    ) : (
                      <img
                        src="/assets/unmutted.png"
                        className="frame-control"
                      />
                    )}
                  </div>
                )}
                <div onClick={() => fullScreen()} className="pointer">
                  <img
                    src="/assets/fullscreen.png"
                    className="margin-left-s frame-control"
                  />
                </div>
              </div>

              <div className="margin-top-s" />
            </div>
            {!isFullScreen && small && (
              <div className={`gallery-description z-50`}>
                <div className="text-s">
                  <div className="gallery-plate metal linear">
                    <div className="text-s">
                      <strong>{nft.user.artistName}</strong>
                      <br />
                      {nft.user.country}{" "}
                      {nft.user.birthYear && `(b. ${nft.user.birthYear})`}
                    </div>
                    <div className="margin-top-s text-s text-b">
                      <strong>
                        <i>{nft.title || "Untitled"}</i>
                      </strong>
                      , 2021
                      <br />
                      {nft.canvas ? (
                        <div className="text-xs">{nft.canvas}</div>
                      ) : (
                        <div>{nft.imageType.toUpperCase()} as NFT</div>
                      )}
                    </div>
                    <div className="text-xs margin-top-s">
                      {nft.description.trim()}
                    </div>
                  </div>
                </div>
                <div className="flex flex-row items-center justify-center mt-3 center">
                  {website && (
                    <div>
                      <img
                        src="/assets/website.png"
                        className="account-social-web pointer"
                        alt="Website"
                        onClick={() => openLink(website)}
                      />
                    </div>
                  )}
                  {twitter && (
                    <div>
                      <img
                        src="/assets/twitter.png"
                        className="account-social pointer"
                        alt="Twitter"
                        onClick={() =>
                          openLink(
                            twitter.substring(0, 4) === "http" ||
                              twitter.substring(0, 3) === "www"
                              ? twitter
                              : `https://twitter.com/${twitter}`
                          )
                        }
                      />
                    </div>
                  )}
                  {instagram && (
                    <div>
                      <img
                        src="/assets/instagram.png"
                        className="account-social pointer"
                        alt="Instagram"
                        onClick={() =>
                          openLink(
                            instagram.substring(0, 4) === "http" ||
                              instagram.substring(0, 3) === "www"
                              ? instagram
                              : `https://instagram.com/${instagram}`
                          )
                        }
                      />
                    </div>
                  )}
                </div>
                {small && !hidden && (
                  <OpenMarket
                    tokenId={nft.order}
                    contract={contract}
                    resizeContainer={resizeContainer}
                    ethPrice={ethPrice}
                    artistWallet={nft.user.wallet}
                  />
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="margin-top">
            This NFT does not seem to exist...
            <div className="margin-top" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ExhibitionNFT;

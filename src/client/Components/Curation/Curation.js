import React, { useEffect, useState, useRef } from "react";
import ReactAutolinker from "react-autolinker";

import FullScreen from "../../assets/fullscreen.png";
import MinScreen from "../../assets/minscreen.png";
import Muted from "../../assets/muted.png";
import Unmuted from "../../assets/unmuted.png";
import Twitter from "../../assets/twitter.png";
import Instagram from "../../assets/instagram.png";
import Web from "../../assets/website.png";

function openLink(page) {
  page = page.replace("@", "");
  let win = window.open(page, "_blank");
  win.focus();
}

export default function Curation({ nft, small, blind }) {
  const [loaded, setLoaded] = useState(false);
  const video = useRef();

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

  useEffect(() => {
    document.addEventListener("webkitfullscreenchange", (event) => {
      if (!document.webkitIsFullScreen) {
        setFullScreen(false);
        if (video.current) video.current.play();
      } else setFullScreen(true);
    });

    return () => {
      document.removeEventListener("fullscreenchange", () => {});
    };
  }, []);

  const [muted, setMuted] = useState(false);
  function toggleAudio() {
    video.current.muted = !video.current.muted;
    if (video.current.muted) setMuted(true);
    else setMuted(false);
  }

  const imageType = nft.art.split(".")[1];

  return (
    <div className={`margin-top flex full-width`}>
      {nft ? (
        <div className="gallery-container full-width">
          {!isFullScreen && !small && (
            <div className={`gallery-description`}>
              <div className="text-s">
                <div className="gallery-plate metal linear">
                  {!blind ? (
                    <div className="text-s">
                      <strong>{nft.user.artistName}</strong>
                      <br />
                      {nft.user.country}{" "}
                      {nft.user.birthYear && `(b. ${nft.user.birthYear})`}
                    </div>
                  ) : (
                    <div className="text-s">
                      <strong>Artist Info Hidden</strong>
                      <br />
                    </div>
                  )}
                  <div className="margin-top-s text-s text-b">
                    <strong>
                      <i>{nft.title || "Untitled"}</i>
                    </strong>
                    , 2021
                    <br />
                    {nft.canvas ? (
                      <div className="text-xs">{nft.canvas}</div>
                    ) : (
                      <div>{imageType.toUpperCase()} as NFT</div>
                    )}
                  </div>
                  <div className="text-xs margin-top-s">{nft.description}</div>
                </div>
              </div>
              {!blind && (
                <div className="flex margin-top-s">
                  {nft.user.website && (
                    <div>
                      <img
                        src={Web}
                        className="account-social-web pointer"
                        alt="Website"
                        onClick={() => openLink(nft.user.website)}
                      />
                    </div>
                  )}
                  {nft.user.twitter && (
                    <div>
                      <img
                        src={Twitter}
                        className="account-social pointer"
                        alt="Twitter"
                        onClick={() =>
                          openLink(`https://twitter.com/${nft.user.twitter}`)
                        }
                      />
                    </div>
                  )}
                  {nft.user.instagram && (
                    <div>
                      <img
                        src={Instagram}
                        className="account-social pointer"
                        alt="Instagram"
                        onClick={() =>
                          openLink(
                            `https://instagram.com/${nft.user.instagram}`
                          )
                        }
                      />
                    </div>
                  )}
                </div>
              )}
              {nft.statement && (
                <div className="margin-top-s text-s">
                  <div className="text-m">Statement of Intent</div>
                  <ReactAutolinker text={nft.statement} />
                </div>
              )}
              {nft.additional && (
                <div className="margin-top-s text-s">
                  <div className="text-m">Additional Info</div>
                  <ReactAutolinker text={nft.additional} />
                </div>
              )}
            </div>
          )}
          <div
            className={`flex-full center ${
              small
                ? "gallery-frame-container-small"
                : "gallery-frame-container"
            }`}
          >
            <div className="frame gallery-art-container">
              <div className="frame-shadow">
                {imageType === "mp4" ? (
                  <div>
                    <video
                      loop
                      autoPlay
                      webkit-playsinline="true"
                      playsInline
                      className={`gallery-art ${!loaded && "hidden"}`}
                      onCanPlay={() => setLoaded(true)}
                      ref={video}
                    >
                      <source src={`https://cdn.grants.art/${nft.art}`} />
                      Sorry, your browser doesn't support embedded videos.
                    </video>
                    <video
                      muted
                      loop
                      autoPlay
                      webkit-playsinline="true"
                      playsInline
                      className={`gallery-art ${loaded && "hidden"}`}
                    >
                      <source src={`https://cdn.grants.art/${nft.artWeb}`} />
                      Sorry, your browser doesn't support embedded videos.
                    </video>
                  </div>
                ) : (
                  <div>
                    <img
                      className={`gallery-art ${!loaded && "hidden"}`}
                      src={`https://cdn.grants.art/${nft.art}`}
                      onLoad={() => setLoaded(true)}
                    />
                    <img
                      className={`gallery-art ${loaded && "hidden "}`}
                      src={`https://cdn.grants.art/${nft.artWeb}`}
                    />
                  </div>
                )}
              </div>
            </div>
            {isFullScreen && !video.current && (
              <div className="fullscreen-container">
                <img
                  src="../assets/minscreen.png"
                  className="frame-exit pointer"
                  onClick={() => fullScreen()}
                />
                <img
                  className="gallery-art-fullscreen"
                  src={`https://cdn.grants.art/${nft.art}`}
                />
              </div>
            )}
            {!loaded ? (
              <div className="loader margin-top-l">
                <div className="loaderBar"></div>
              </div>
            ) : (
              <div className="flex margin-top-s">
                <div className="flex-full" />
                {video && video.current && (
                  <div onClick={() => toggleAudio()} className="pointer">
                    {muted ? (
                      <img src={Muted} className="frame-control" />
                    ) : (
                      <img src={Unmuted} className="frame-control" />
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
            )}
            <div className="margin-top-s" />
          </div>
          {!isFullScreen && small && (
            <div className={`gallery-description`}>
              <div className="text-s">
                <div className="gallery-plate metal linear">
                  {!blind ? (
                    <div className="text-s">
                      <strong>{nft.user.artistName}</strong>
                      <br />
                      {nft.user.country}{" "}
                      {nft.user.birthYear && `(b. ${nft.user.birthYear})`}
                    </div>
                  ) : (
                    <div className="text-s">
                      <strong>Artist Info Hidden</strong>
                      <br />
                    </div>
                  )}
                  <div className="margin-top-s text-s text-b">
                    <strong>
                      <i>{nft.title || "Untitled"}</i>
                    </strong>
                    , 2021
                    <br />
                    {nft.canvas ? (
                      <div className="text-xs">{nft.canvas}</div>
                    ) : (
                      <div>{imageType.toUpperCase()} as NFT</div>
                    )}
                  </div>
                  <div className="text-xs margin-top-s">{nft.description}</div>
                </div>
              </div>
              <div className="flex margin-top-s">
                {nft.website && (
                  <div>
                    <img
                      src={Web}
                      className="account-social-web pointer"
                      alt="Website"
                      onClick={() => openLink(nft.website)}
                    />
                  </div>
                )}
                {nft.twitter && (
                  <div>
                    <img
                      src={Twitter}
                      className="account-social pointer"
                      alt="Twitter"
                      onClick={() =>
                        openLink(
                          nft.twitter.substring(0, 4) === "http" ||
                            nft.twitter.substring(0, 3) === "www"
                            ? nft.twitter
                            : `https://twitter.com/${nft.twitter}`
                        )
                      }
                    />
                  </div>
                )}
                {nft.instagram && (
                  <div>
                    <img
                      src={Instagram}
                      className="account-social pointer"
                      alt="Instagram"
                      onClick={() =>
                        openLink(
                          nft.instagram.substring(0, 4) === "http" ||
                            nft.instagram.substring(0, 3) === "www"
                            ? nft.instagram
                            : `https://instagram.com/${nft.instagram}`
                        )
                      }
                    />
                  </div>
                )}
              </div>
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
  );
}

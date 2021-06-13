import React, { useEffect, useReducer, useState } from "react";
import NFT from "../../../src/client/Components/ExhibitionNFT.js";

import { useSwipeable } from "react-swipeable";
import { useHistory } from "react-router-dom";
import { useStoreState } from "easy-peasy";
import ReactAutolinker from "react-autolinker";
import { apiUrl } from "../../../src/client/baseUrl";
import Link from "next/link";

import dbConnect from "../../../utils/dbConnect";
import Program from "../../../models/programModel";

export async function getStaticPaths() {
  await dbConnect();

  const programs = await Program.find({ exhibiting: true })
    .populate("organizers")
    .populate("curators", "artistName first last instagram twitter website");

  const paths = programs.map((program) => {
    return { params: { url: program.url } };
  });

  return {
    paths: paths,
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  const url = params.url;
  const res = await fetch(`${apiUrl()}/program/getGalleryInformation/${url}`);

  const data = await res.json();
  return { props: { data, url } };
}

export default function Exhibition({ data, url }) {
  const history = useHistory();
  const small = useStoreState((state) => state.app.small);

  const id = false;
  const order = Number(id);

  const [gallery] = useState(data?.gallery);
  const [exhibition] = useState({ ...data, gallery: undefined });

  const [preload] = useReducer((preload, { type, value }) => {}, []);

  useEffect(() => {}, [gallery]);

  // const [swipeDirection, setSwipeDirection] = useState(null);
  function switchPage(direction) {
    // setSwipeDirection(direction);
    if (gallery) {
      if (id === "1" && direction === "previous") return gallery.length;
      else if (gallery && direction === "next" && Number(id) === gallery.length)
        return 1;
      else if (direction === "next") return Number(id) + 1;
      else return Number(id) - 1;
    }
  }

  let foundSrc, src1, src2, src3;
  if (preload && preload.length) {
    foundSrc = preload.find((e) => {
      return e.isVideo && e.order === order - 1;
    });
    src1 = foundSrc ? foundSrc.image : null;

    foundSrc = preload.find((e) => {
      return e.isVideo && e.order === order;
    });
    src2 = foundSrc ? foundSrc.image : null;

    foundSrc = preload.find((e) => {
      return e.isVideo && e.order === order + 1;
    });
    src3 = foundSrc ? foundSrc.image : null;
  }

  const handlers = useSwipeable({
    onSwipedRight: (eventData) => {
      if (id) {
        history.push(`/${url}/${switchPage("previous")}`);
      }
    },
    onSwipedLeft: (eventData) => {
      if (id) {
        history.push(`/${url}/${switchPage("next")}`);
      }
    },
    preventDefaultTouchmoveEvent: true,
  });

  return (
    <div className="content-block" {...handlers}>
      <div className="flex">
        {id && (
          <Link
            href={`/exhibition/${url}/${switchPage("previous")}`}
            className="relative margin-top-s"
          >
            <div className="round">
              <div id="cta">
                <span className="arrow-left segunda previous"></span>
                <span className="arrow-left primera previous"></span>
              </div>
            </div>
          </Link>
        )}
        <div className="flex-full">
          <div className="center text-m text-b margin-top-minus">
            {exhibition.organizer && (
              <Link passHref href={`/curator/${exhibition.organizerUrl}`}>
                <a className="text-rainbow text-s margin-top-minus">
                  <strong>{exhibition.organizer}</strong>
                </a>
              </Link>
            )}
            {exhibition.name && (
              <div>
                <strong>{exhibition.name} Exhibition</strong>
              </div>
            )}
          </div>
        </div>
        {id && (
          <Link href={`/exhibition/${url}/${switchPage("next")}`}>
            <a className="relative margin-top-s">
              <div className="round arrow-right">
                <div id="cta">
                  <span className="arrow primera next"></span>
                  <span className="arrow segunda next"></span>
                </div>
              </div>
            </a>
          </Link>
        )}
      </div>
      {!id && (
        <div className="line-breaks">
          {gallery && gallery.length ? (
            <div className="margin-top-l center">
              <Link
                href={`/exhibition/${url}/${
                  Math.floor(
                    Math.random() * (gallery.length ? gallery.length : 1)
                  ) + 1
                }`}
              >
                <a className="button">
                  <span className="text-l">Enter Gallery</span>
                </a>
              </Link>
            </div>
          ) : (
            <div className="flex center">
              {gallery ? (
                <div className="margin-top-l">
                  <div>There are no art pieces in this exhibition yet</div>
                  <Link href={`/apply/${url}`}>
                    <a className="margin-top text-grey">
                      You may submit your artwork here!
                    </a>
                  </Link>
                </div>
              ) : (
                <div className="block-loading">
                  <div className="loading">
                    <div></div>
                    <div></div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="margin-top-l" />
          <ReactAutolinker text={exhibition.description} className="text-mid" />
          {exhibition && exhibition.curators && (
            <div className="margin-top-l center">Curated By</div>
          )}
          <div className="text-s margin-top-s center">
            {exhibition &&
              exhibition.curators &&
              exhibition.curators.map((curator, index) => {
                return (
                  <div className="margin-top" key={index}>
                    <div>
                      <strong>
                        {curator.artistName
                          ? `${curator.artistName}`
                          : `${curator.first} ${curator.last}`}
                      </strong>
                    </div>
                    <div className="flex items-center space-x-3 text-base center">
                      {curator.website && (
                        <div className="margin-top-xs font-base">
                          <a
                            target="_blank"
                            href={curator.website}
                            className="w-full"
                          >
                            <img
                              src="/assets/website.png"
                              className="w-5 h-5 cursor-pointer"
                            />
                          </a>
                        </div>
                      )}
                      {curator.twitter && (
                        <div className="margin-top-xs">
                          <a
                            target="_blank"
                            className="block"
                            href={`https://twitter.com/${curator.twitter}`}
                          >
                            <img
                              src="/assets/twitter.png"
                              className="w-6 h-6 cursor-pointer"
                            />
                          </a>
                        </div>
                      )}
                      {curator.instagram && (
                        <div className="margin-top-xs">
                          <a
                            target="_blank"
                            className="block"
                            href={`https://instagram.com/${curator.instagram}`}
                          >
                            <img
                              src="/assets/instagram.png"
                              className="w-6 h-6 cursor-pointer"
                              alt="Instagram"
                            />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
      {id && gallery && gallery.length && (
        <div className="gallery-min-height">
          <NFT
            key={order - 1}
            small={small}
            nft={gallery[order - 1]}
            src={src2}
            contract={exhibition.contract}
            important
          />
        </div>
      )}
      <div className="margin-top-l" />
    </div>
  );
}

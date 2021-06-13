import React, { useEffect, useState } from "react";
import NFT from "../../../src/client/Components/ExhibitionNFT.js";

import { useSwipeable } from "react-swipeable";
import { useHistory } from "react-router-dom";
import { useStoreState } from "easy-peasy";
import ReactAutolinker from "react-autolinker";
import { NextSeo } from "next-seo";
import Link from "next/link";

import dbConnect from "../../../utils/dbConnect";
import Program from "../../../models/programModel";
import ProgramApplicant from "../../../models/programApplicantModel";
import probe from "probe-image-size";
import set from "lodash/set";

export async function getStaticPaths() {
  await dbConnect();

  const programs = await Program.find({ exhibiting: true })
    .populate("organizers")
    .populate("curators", "artistName first last instagram twitter website");

  const galleries = programs.map(async (program) => {
    const gallery = await ProgramApplicant.find(
      { program: program._id, published: true },
      (err, gallery) => {
        return err
          ? res.status(500).json(err)
          : gallery.map((e) => {
              return { ...e, tokenId: e.order };
            });
      }
    )
      .select(
        "-approved -rejected -program -statement -additional -ineligible -flagged -approvalCount -rejectCount -emailed -accepted"
      )
      .populate(
        "user",
        "artistName birthYear country city website twitter instagram"
      )
      .sort("order");

    return { program, gallery };
  });

  const merged = await Promise.all(galleries);

  const paths = merged
    ?.map((row) => {
      return row.gallery.map((el) => {
        return { params: { url: row.program.url, id: el.order.toString() } };
      });
    })
    .flat();

  return {
    paths: paths,
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  await dbConnect();

  const program = await Program.findOne({ url: params.url })
    .populate("organizers")
    .populate("curators", "artistName first last instagram twitter website");

  const gallery = await ProgramApplicant.findOne({
    program: program._id,
    order: params.id.toString(),
    published: true,
  })
    .select(
      "-approved -rejected -program -statement -additional -ineligible -flagged -approvalCount -rejectCount -emailed -accepted"
    )
    .populate(
      "user",
      "artistName birthYear country city website twitter instagram"
    )
    .sort("order");

  set(gallery, "tokenId", gallery.order);

  let imageMetadata;

  try {
    const imageUrl = `https://cdn.grants.art/${gallery.art}`;
    imageMetadata = await probe(imageUrl);
  } catch (error) {
    imageMetadata = { width: 800, height: 800 };
  }

  const data = {
    gallery,
    imageMetadata,
    contract: program.contractAddress,
    curators: program.curators,
    name: program.name,
    description: program.description,
    organizer: program.organizers[0].name,
    organizerUrl: program.organizers[0].url,
  };

  return {
    props: {
      id: params.id,
      url: params.url,
      data: JSON.parse(JSON.stringify(data)),
    },
  };
}

export default function ExhibitionIndividual({ data, id, url }) {
  const history = useHistory();
  const small = useStoreState((state) => state.app.small);

  const [gallery, setGallery] = useState(data?.gallery);
  useEffect(() => {
    setGallery(data?.gallery);
  }, [data?.gallery?.id]);

  const [exhibition] = useState({ ...data, gallery: undefined });

  function switchPage(direction) {
    if (gallery) {
      if (id === "1" && direction === "previous") return gallery.length;
      else if (gallery && direction === "next" && Number(id) === gallery.length)
        return 1;
      else if (direction === "next") return Number(id) + 1;
      else return Number(id) - 1;
    }
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
      <NextSeo title={gallery?.title} description={gallery?.description} />
      <div className="flex items-center w-full">
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

        <div className="flex-full">
          <div className="center text-m text-b margin-top-minus">
            {exhibition.organizer && (
              <Link passHref href={`/curator/${exhibition.organizerUrl}`}>
                <a
                  className="text-rainbow text-s margin-top-minus"
                  href={`/curator/${exhibition.organizerUrl}`}
                >
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

        <Link href={`/exhibition/${url}/${switchPage("next")}`}>
          <a
            className="relative"
            href={`/exhibition/${url}/${switchPage("next")}`}
          >
            <div className="round arrow-right">
              <div id="cta">
                <span className="arrow primera next"></span>
                <span className="arrow segunda next"></span>
              </div>
            </div>
          </a>
        </Link>
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
                    <div className="flex center">
                      {curator.website && (
                        <div className="margin-top-xs">
                          <a href={curator.website}>
                            <img
                              src="/assets/website.png"
                              className="curator-icon-web pointer"
                            />
                          </a>
                        </div>
                      )}
                      {curator.twitter && (
                        <div className="margin-top-xs">
                          <a href={`https://twitter.com/${curator.twitter}`}>
                            <img
                              src="/assets/twitter.png"
                              className="curator-icon pointer"
                            />
                          </a>
                        </div>
                      )}
                      {curator.instagram && (
                        <div className="margin-top-xs">
                          <a
                            href={`https://instagram.com/${curator.instagram}`}
                          >
                            <img
                              src="/assets/instagram.png"
                              className="curator-icon pointer"
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
      {id && gallery && (
        <div className="gallery-min-height" id={gallery.id}>
          <NFT
            key={gallery.id}
            src={gallery.id}
            small={small}
            nft={gallery}
            contract={exhibition.contract}
            metadata={data.imageMetadata}
            important
          />
        </div>
      )}
      <div className="margin-top-l" />
    </div>
  );
}

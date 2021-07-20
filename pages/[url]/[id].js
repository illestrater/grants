import React, { useEffect, useState } from "react";
import NFT from "../../src/client/Components/ExhibitionNFT";

import { useSwipeable } from "react-swipeable";
import { useHistory } from "react-router-dom";
import { useStoreState } from "easy-peasy";
import ReactAutolinker from "react-autolinker";
import { NextSeo } from "next-seo";
import Link from "next/link";

import dbConnect from "../../utils/dbConnect";
import Program from "../../models/programModel";
import ProgramApplicant from "../../models/programApplicantModel";
import { useRouter } from "next/router";
import probe from "probe-image-size";
import set from "lodash/set";
import axios from "axios";

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
    // Params get re-used to find index position
    ...params,
    // Values for nested components
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

export default function ExhibitionIndividual(props) {
  const { id, url } = props;
  if (!id || !url) return <></>;

  const history = useHistory();
  const router = useRouter();

  const small = useStoreState((state) => state.app.small);
  const [gallery, setGallery] = useState(data?.gallery);
  const [ethPrice, setEthPrice] = useState();
  const [data, setData] = useState(props?.data);

  // Trigger image changes
  useEffect(() => {
    setGallery(data?.gallery);
  }, [data?.gallery?.id]);

  // Lows next artist without rendering new page
  const LoadNextArtist = (val = 1) => {
    const next = parseFloat(data.id) + val;

    axios
      .get(`/api/program/getGallery/${url}/${next}`)
      .then((res) => {
        router.push(`/${url}/${next}`, undefined, { shallow: true });
        setGallery(res.data?.gallery);
        setData(res.data);
      })
      .catch((err) => console.error(err));
  };

  // Alloe navigation with arrow keys
  useEffect(() => {
    function handleKeyUp(event) {
      switch (event.key) {
        case "ArrowRight":
          LoadNextArtist(1);
          break;

        case "ArrowLeft":
          LoadNextArtist(-1);
          break;
      }
    }

    window.addEventListener("keydown", handleKeyUp);
    return () => window.removeEventListener("keydown", handleKeyUp);
  }, [data.id]);

  useEffect(() => {
    axios
      .get(
        `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`
      )
      .then((res) => res.json())
      .then((json) => setEthPrice(json.ethereum.usd))
      .catch((error) => console.error(error));
  }, []);

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
        <a className="relative round" onClick={() => LoadNextArtist(-1)}>
          <div id="cta">
            <span className="arrow-left segunda previous"></span>
            <span className="arrow-left primera previous"></span>
          </div>
        </a>

        <div className="flex-full ">
          <div className="center text-m text-b margin-top-minus">
            {exhibition.organizer && (
              <a className="text-rainbow text-s margin-top-minus">
                <strong>{exhibition.organizer}</strong>
              </a>
            )}
            {exhibition.name && (
              <div>
                <strong>{exhibition.name} Exhibition</strong>
              </div>
            )}
          </div>
        </div>

        <a className="relative round" onClick={() => LoadNextArtist(1)}>
          <div className="-mt-1 arrow-right">
            <div id="cta">
              <span className="arrow primera next"></span>
              <span className="arrow segunda next"></span>
            </div>
          </div>
        </a>
      </div>
      {!id && (
        <div className="line-breaks">
          {gallery && gallery.length ? (
            <div className="margin-top-l center">
              <Link
                href={`/${url}/${
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
        <div className="h-full gallery-min-height" id={gallery.id}>
          <NFT
            params={{ id, url }}
            key={gallery.id}
            src={gallery.id}
            small={small}
            nft={gallery}
            ethPrice={ethPrice}
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

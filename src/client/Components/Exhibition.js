import React, { useEffect, useReducer, useState, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useParams, useHistory } from "react-router-dom";
import { useStoreState } from 'easy-peasy';
import { Link } from "react-router-dom";
import ReactAutolinker from "react-autolinker";
import GenesisNFT from "./ExhibitionNFT.js";
import Resizer from "./Tools/Resizer.js";
import { apiUrl } from "../baseUrl";

import Web from "../assets/website.png";
import Twitter from "../assets/twitter.png";
import Instagram from "../assets/instagram.png";

import "../styles.scss";

function openLink(page) {
  let win = window.open(page, "_blank");
  win.focus();
}

const NFT = React.memo(GenesisNFT);

export default function Exhibition({ updateScroll }) {
  const history = useHistory();
  const small = useStoreState(state => state.app.small);
  const nftRef = useRef();
  const { url, id } = useParams();
  const order = Number(id);

  const [gallery, setGallery] = useState(null);
  const [exhibition, setExhibition] = useState({});
  const [enterId, setEnterId] = useState(null);
  const [ethPrice, setEthPrice] = useState(null);
  useEffect(() => {
    updateScroll(false);
    fetch(`${ apiUrl() }/program/getGallery`, {
      method: 'POST',
      body: JSON.stringify({ program: url }),
      headers: { 'Content-Type': 'application/json' },
    }).then(res => res.json())
    .then(json => {
      if (json && json.gallery) {
        setGallery(json.gallery)
        if (id) setEnterId(id)
        else setEnterId(Math.floor(Math.random() * (json.gallery.length ? json.gallery.length : 1)) + 1);
      }
      if (json && json.name) setExhibition({ ...json, gallery: undefined });
    });

    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }).then(res => res.json())
    .then(json => {
      if (json && json.ethereum) {
        setEthPrice(json.ethereum.usd)
      }
    });
  }, [])

  const [preload, dispatch] = useReducer((preload, { type, value }) => {
    if (type === "add") {
      return [...preload, value];
    } else if (type === "update") {
      const index = preload.findIndex((e) => Number(e.order) === value.order);
      if (index >= 0) {
        const updated = preload[index];
        if (updated) {
          updated.image = value.image;
          return [
            ...preload.slice(0, index),
            updated,
            ...preload.slice(index + 1),
          ];
        }
      }
    } else if (type === "remove") {
      return preload.filter((e) => Number(e.order) !== value.order);
    }

    return preload;
  }, []);

  useEffect(() => {
    if (gallery && gallery.length && !preload.length) {
      const index = enterId;
      let before = index - 4;
      if (before <= 0) before = 1;
      let after = index + 4;
      if (after >= gallery.length) after = gallery.length;
      for (let i = before; i <= after; i++) {
        const imageType = gallery[i - 1].art.split(".")[1];
        if (imageType === "mp4" || imageType === "mov") {
          dispatch({
            type: "add",
            value: { order: i, image: null, isVideo: true },
          });
          fetch(`https://cdn.grants.art/${gallery[i - 1].art}`).then(
            async (res) => {
              const blob = await res.blob();
              const image = window.URL.createObjectURL(blob);
              dispatch({ type: "update", value: { order: i, image } });
            }
          );
        } else {
          let image;
          image = new Image();
          image.src = `https://cdn.grants.art/${gallery[i - 1].art}`;
          dispatch({ type: "add", value: { order: i, image } });
        }
      }
    }
  }, [enterId])

  function updatePreload(direction, currentToken) {
    let inc;
    if (direction === "next") {
      dispatch({ type: "remove", value: { order: currentToken - 4 } });
      inc = 5;
    } else if (direction === "previous") {
      dispatch({ type: "remove", value: { order: currentToken + 4 } });
      inc = -5;
    }

    const newLoad = gallery[currentToken - 1 + inc];
    let imageType;
    if (newLoad) imageType = newLoad.art.split(".")[1];

    if (newLoad && (imageType === "mp4" || imageType === "mov")) {
      dispatch({
        type: "add",
        value: { order: currentToken + inc, image: null, isVideo: true },
      });
      fetch(`https://cdn.grants.art/${newLoad.art}`).then(async (res) => {
        const blob = await res.blob();
        const image = window.URL.createObjectURL(blob);
        dispatch({
          type: "update",
          value: { order: currentToken + inc, image },
        });
      });
    } else if (newLoad) {
      const image = new Image();
      image.src = `https://cdn.grants.art/${newLoad.art}`;
      dispatch({ type: "add", value: { order: currentToken + inc, image } });
    }
  }

  function switchPage(direction) {
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
        updatePreload("previous", order);
        history.push(`/${url}/${switchPage("previous")}`);
      }
    },
    onSwipedLeft: (eventData) => {
      if (id) { updatePreload('next', order); history.push(`/${ url }/${ switchPage('next') }`) }
    },
    preventDefaultTouchmoveEvent: true,
  });

  const setHeight = (height) => {
    if (nftRef && nftRef.current) nftRef.current.style.marginTop = `${ height }px`;
  }

  return (
    <div className="content-block" {...handlers}>
      <Resizer />
      <div className="flex">
        {id && (
          <Link href={`/${url}/${switchPage("previous")}`}>
            <a
              className="relative margin-top-s"
              onClick={() => updatePreload("previous", order)}
            >
              <div className="round">
                <div id="cta">
                  <span className="arrow-left segunda previous"></span>
                  <span className="arrow-left primera previous"></span>
                </div>
              </div>
            </a>
          </Link>
        )}
        <div className="flex-full">
          <div className="center text-m text-b margin-top-minus">
            {exhibition.organizer && (
              <Link to={`/curator/${exhibition.organizerUrl}`}>
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
          <Link
            to={`/${url}/${switchPage("next")}`}
            className="relative margin-top-s"
            onClick={() => updatePreload("next", order)}
          >
            <div className="round arrow-right">
              <div id="cta">
                <span className="arrow primera next"></span>
                <span className="arrow segunda next"></span>
              </div>
            </div>
          </Link>
        )}
      </div>
      { !id &&
        <div className='line-breaks'>
          { (gallery && gallery.length) ?
            <div className='margin-top-l center'>
              <Link to={ `/${ url }/${ enterId  }` } className='button'>
                <span className='text-l'>Enter Gallery</span>
              </Link>
              <div className='margin-top'>{ gallery.length } Artworks</div>
            </div>
          :
            <div className="flex center">
              {gallery ? 
                <div className="margin-top-l">
                  <div>There are no art pieces in this exhibition yet</div>
                  <Link to={`/apply/${url} `} className="margin-top text-grey">
                    You may submit your artwork here!
                  </Link>
                </div>
              :
                <div className='block-loading'><div className='loading'><div></div><div></div></div></div>
              }
            </div>
          }
          <div className='margin-top-l' />
          <ReactAutolinker text={ exhibition.description } className='text-mid' />
          { (exhibition && exhibition.curators) &&
            <div className='margin-top-l center'>
              Curated By
            </div>
          }
          <div className='text-s margin-top-s center'>
            { exhibition && exhibition.curators && exhibition.curators.map((curator, index) => {
              return (
                <div className='margin-top' key={ index }>
                  <div><strong>{ curator.artistName ? `${ curator.artistName }` : (!curator.first || !curator.last) ? curator.username : `${ curator.first } ${ curator.last }` }</strong></div>
                  <div className='flex center'>
                    { curator.website && <div className='margin-top-xs'><img src={ Web } className='curator-icon-web pointer' alt='Website' onClick={ () => openLink(curator.website) } /></div> }
                    { curator.twitter && <div className='margin-top-xs'><img src={ Twitter } className='curator-icon pointer' alt='Twitter' onClick={ () => openLink(`https://twitter.com/${ curator.twitter }`) } /></div> }
                    { curator.instagram && <div className='margin-top-xs'><img src={ Instagram } className='curator-icon pointer' alt='Instagram' onClick={ () => openLink(`https://instagram.com/${ curator.instagram }`) } /></div> }
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
                          <img
                            src={Web}
                            className="curator-icon-web pointer"
                            alt="Website"
                            onClick={() => openLink(curator.website)}
                          />
                        </div>
                      )}
                      {curator.twitter && (
                        <div className="margin-top-xs">
                          <img
                            src={Twitter}
                            className="curator-icon pointer"
                            alt="Twitter"
                            onClick={() =>
                              openLink(`https://twitter.com/${curator.twitter}`)
                            }
                          />
                        </div>
                      )}
                      {curator.instagram && (
                        <div className="margin-top-xs">
                          <img
                            src={Instagram}
                            className="curator-icon pointer"
                            alt="Instagram"
                            onClick={() =>
                              openLink(
                                `https://instagram.com/${curator.instagram}`
                              )
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      }
      { (id && gallery && gallery.length) &&
        <div>
          <NFT key={ order - 3 } small={ small } nft={ gallery[order - 2] } src={ src1 } contract={ exhibition.contract } setHeight={ setHeight } order={ 0 } ethPrice={ ethPrice } important hidden />
          <NFT key={ order - 2 } small={ small } nft={ gallery[order - 2] } src={ src1 } contract={ exhibition.contract } setHeight={ setHeight } order={ 1 } ethPrice={ ethPrice } important hidden />
          <NFT key={ order - 1} small={ small } nft={ gallery[order - 1] } src={ src2 } contract={ exhibition.contract } setHeight={ setHeight } order={ 2 } ethPrice={ ethPrice } important />
          <NFT key={ order } small={ small } nft={ gallery[order] } src={ src3 } contract={ exhibition.contract } setHeight={ setHeight } order={ 3 } ethPrice={ ethPrice } important hidden />
          <NFT key={ order + 1 } small={ small } nft={ gallery[order] } src={ src3 } contract={ exhibition.contract } setHeight={ setHeight } order={ 4 } ethPrice={ ethPrice } important hidden />
        </div>
      }
      <div ref={ nftRef } className='exhibition-height' />
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useStoreState, useStoreActions } from "easy-peasy";
import ReactModal from "react-modal";
import { apiUrl } from "../../baseUrl";

import Create from "./Create";
import Gallery from "./Gallery";
import EditGallery from "./EditGallery";
import EditGalleries from "./EditGalleries";
import ManageGallery from "./ManageGallery";
import WalletConnect from "../Web3/WalletConnect";

export default function Collection({
  editing,
  setEditCollection,
  galleries,
  addNewGallery,
  setGalleries,
  username,
}) {
  const auth = useStoreState((state) => state.user.auth);
  const provider = useStoreState((state) => state.eth.provider);
  const setProvider = useStoreActions((dispatch) => dispatch.eth.setProvider);

  const [gallery, setGallery] = useState(null);
  const [myNFTs, setMyNFTs] = useState([]);
  const [add, setAdd] = useState(null);
  const pushToGallery = (nft, id) => {
    setAdd(null);
    fetch(`${apiUrl()}/gallery/add`, {
      method: "POST",
      body: JSON.stringify({ ...nft, gallery: id, addToGallery: undefined }),
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": auth.token,
      },
    })
      .then((res) => res.json())
      .then((json) => {});
  };

  const addToGallery = (nft) => {
    setAdd(nft);
  };

  const confirmAdd = (selected) => {
    const index = galleries.findIndex((e) => e.id === selected);
    if (index > -1) {
      galleries[index].nfts.push(add);
      setGalleries([...galleries]);
      pushToGallery(add, selected);
    }
  };

  const [showData, setShowData] = useState(null);
  async function getMyAssets(offset, items) {
    await fetch(
      `https://api.opensea.io/api/v1/assets?order_direction=desc&offset=${offset}&limit=50&owner=${provider.selectedAddress}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => res.json())
      .then(async (json) => {
        if (json.assets) {
          if (json.assets.length) {
            json.assets.forEach((asset) => {
              const image = asset.animation_url || asset.image_url;
              const split = image.split(".");
              items.push({
                id: Math.random().toString(36).substring(7),
                image,
                poster: asset.image_url,
                imageType: split[split.length - 1],
                name: asset.name,
                external: asset.external_link,
                opensea: asset.permalink,
                description: asset.description,
                traits: asset.traits,
                creatorAddress: asset.creator ? asset.creator.address : null,
                creatorName:
                  asset.creator && asset.creator.user
                    ? asset.creator.user.username
                    : null,
                addToGallery,
              });
            });
            setShowData(items);
            getMyAssets(offset + 50, items);
          } else {
            setShowData(items);
          }
        } else {
          getMyAssets(offset, items);
        }
      })
      .catch((err) => console.error(err));
  }

  const [manage, setManage] = useState(null);
  useEffect(() => {
    setShowData(showData);
    if (gallery && gallery.nfts) setMyNFTs(gallery.nfts);
  }, [gallery]);

  useEffect(() => {
    if (provider && provider.selectedAddress && editing) getMyAssets(0, []);
    if (!editing) setManage(false);
  }, [editing]);

  useEffect(() => {
    if (provider && provider.selectedAddress && editing) getMyAssets(0, []);
  }, [provider]);

  useEffect(() => {
    if (galleries && galleries.length) {
      setGallery(galleries[0]);
    }
  }, [galleries]);

  const [create, setCreate] = useState(null);
  const [editGallery, setEditGallery] = useState(null);
  const [del, setDel] = useState(null);
  const deleteGallery = () => {
    const index = galleries.findIndex((e) => e.id === del.id);
    if (index >= 0) {
      galleries.splice(index, 1);
    }
    if (galleries.length) setGallery(galleries[0]);
    setGalleries(galleries);
    setDel(null);
    fetch(`${apiUrl()}/gallery/delete`, {
      method: "POST",
      body: JSON.stringify({ gallery: del.id }),
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": auth.token,
      },
    })
      .then((res) => res.json())
      .then((json) => {});
  };

  const reorderNFTs = (galleryID, nfts) => {
    if (gallery.id === galleryID) {
      gallery.nfts = nfts;
      setGallery({ ...gallery });
    }

    const index = galleries.findIndex((e) => e.id === galleryID);
    if (index > -1) {
      galleries[index].nfts = nfts;
      setGalleries([...galleries]);
    }
  };

  const changeGallery = (item) => {
    setGallery({ ...item });
    setMyNFTs({ ...item.nfts });
  };

  const connectWallet = () => {
    if (window.ethereum) {
      window.ethereum.enable();
    } else {
      web3.eth.getAccounts((e, accounts) => {
        if (e) throw e;
        setProvider({ ...provider, selectedAddress: accounts[0] });
      });
    }
  };

  return (
    <div>
      <WalletConnect />
      <ReactModal
        isOpen={add !== null}
        style={{ content: { margin: "auto", width: "15rem", height: "23rem" } }}
        onRequestClose={() => setAdd(null)}
        shouldCloseOnOverlayClick={true}
        ariaHideApp={false}
      >
        <div className="text-s font">
          Add to which gallery?
          <div className="center">
            {galleries &&
              galleries.map((gallery, index) => {
                return (
                  <div className="margin-top-s">
                    <div
                      className="small-button"
                      style={{ display: "block" }}
                      onClick={() => confirmAdd(gallery.id)}
                    >
                      {gallery.name}
                    </div>
                  </div>
                );
              })}
            <div className="margin-top-s" />
            <div
              className="button-red small-button"
              onClick={() => setAdd(null)}
            >
              Cancel
            </div>
          </div>
        </div>
      </ReactModal>
      <ReactModal
        isOpen={del !== null}
        style={{ content: { margin: "auto", width: "15rem", height: "23rem" } }}
        onRequestClose={() => setDel(null)}
        shouldCloseOnOverlayClick={true}
        ariaHideApp={false}
      >
        <div className="text-s font">
          Are you sure you want to delete your gallery?
          <br />
          <br />
          <div className="center">
            <div className="small-button" onClick={() => setDel(null)}>
              Cancel
            </div>
            <br />
            <br />
            <div
              className="margin-top-s small-button"
              onClick={() => deleteGallery()}
            >
              Confirm
            </div>
          </div>
        </div>
      </ReactModal>
      {manage ? (
        <div className="flex">
          <div>
            <div className="text-l">
              <strong>{manage.name}</strong>
            </div>
            <div className="text-m">
              <strong>{manage.description}</strong>
            </div>
          </div>
          <div className="flex-full" />
          <span
            className="text-s text-grey pointer"
            onClick={() => setManage(null)}
          >
            Back
          </span>
        </div>
      ) : (
        <div className="flex">
          <div className="text-l">
            <strong>My Galleries</strong>
          </div>
          <div className="flex-full" />
          {username === auth.username && (
            <span
              className="text-s text-grey pointer"
              onClick={() => setEditCollection(!editing)}
            >
              {editing ? "Close Curation" : "Edit Galleries"}
            </span>
          )}
        </div>
      )}
      {!galleries && (
        <div className="flex center">
          <div className="margin-top center">
            <div className="loading">
              <div></div>
              <div></div>
            </div>
          </div>
        </div>
      )}
      <div className="margin-top-s">
        {editing ? (
          <div>
            {manage ? (
              <div
                className="small-button margin-left-s"
                onClick={() => setEditGallery(true)}
              >
                <div className="text-s">Edit Name / Description</div>
              </div>
            ) : (
              <div
                className="small-button margin-left-s"
                onClick={() => setCreate(true)}
              >
                <div className="text-s">Create New Gallery</div>
              </div>
            )}
          </div>
        ) : (
          <div>
            {galleries &&
              galleries.map((item, index) => {
                if (gallery && gallery.id !== item.id) {
                  return (
                    <div
                      key={index}
                      className="small-button margin-left-s"
                      onClick={() => changeGallery(item)}
                    >
                      <div className="text-s">{item.name}</div>
                    </div>
                  );
                }
              })}
          </div>
        )}
      </div>
      {editGallery && (
        <EditGallery
          manage={manage}
          galleries={galleries}
          setGalleries={setGalleries}
          setEditGallery={setEditGallery}
        />
      )}
      {create && <Create addNewGallery={addNewGallery} setCreate={setCreate} />}
      {gallery && !editing && (
        <div className="margin-top">
          <div className="flex">
            <div>
              <div className="text-m">
                <strong>{gallery.name}</strong>
              </div>
              <div className="text-s">{gallery.description}</div>
            </div>
            <div className="flex-full" />
          </div>
          <div className="margin-top-s">
            {gallery.nfts && gallery.nfts.length ? (
              <Gallery nfts={myNFTs} editing={editing} />
            ) : (
              <div className="margin-top-s">
                There are no NFTs in this gallery yet
              </div>
            )}
          </div>
        </div>
      )}
      {galleries && !galleries.length && (
        <div className="margin-top-s">No galleries have been created yet</div>
      )}
      {editing && !manage && (
        <div className="margin-top text-m">
          <EditGalleries
            galleries={galleries}
            setManage={setManage}
            setDel={setDel}
            setGalleries={setGalleries}
          />
          <div className="text-m">
            <strong>My NFTs</strong>
          </div>
          <div className="text-s">
            {provider && provider.selectedAddress ? (
              `Connected: ${provider.selectedAddress}`
            ) : (
              <div className="margin-top-s">
                <div className="small-button" onClick={() => connectWallet()}>
                  Connect your wallet
                </div>
              </div>
            )}
          </div>
          <div className="margin-top-s" />
          {!showData && provider && provider.selectedAddress && (
            <div className="flex center">
              <div className="margin-top center">
                <div className="loading">
                  <div></div>
                  <div></div>
                </div>
              </div>
            </div>
          )}
          {(!provider || !provider.selectedAddress) && (
            <div className="margin-top-s">
              Please connect your wallet to view your NFTs
            </div>
          )}
          {showData && <Gallery nfts={showData} add />}
        </div>
      )}
      {manage && (
        <ManageGallery
          gallery={manage}
          reorderNFTs={reorderNFTs}
          galleries={galleries}
          setGalleries={setGalleries}
        />
      )}
    </div>
  );
}

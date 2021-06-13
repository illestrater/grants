import React, { useState, useEffect } from "react";
import { useStoreState } from "easy-peasy";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { apiUrl } from "../../baseUrl";

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export default function ManageGallery({
  gallery,
  reorderNFTs,
  galleries,
  setGalleries,
}) {
  const auth = useStoreState((state) => state.user.auth);
  const [showData, setShowData] = useState(null);

  useEffect(() => {
    if (gallery && gallery.nfts) setShowData(gallery.nfts);
  }, [gallery]);

  const pushReorder = (nfts) => {
    let i = 0;
    nfts.forEach((nft) => {
      nft.order = i;
      i++;
    });
    fetch(`${apiUrl()}/gallery/reorderCollection`, {
      method: "POST",
      body: JSON.stringify({
        nfts,
        gallery: gallery.id,
        addToGallery: undefined,
      }),
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": auth.token,
      },
    })
      .then((res) => res.json())
      .then((json) => {});
  };

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const items = reorder(
      showData,
      result.source.index,
      result.destination.index
    );

    setShowData(items);
    pushReorder(items);
    reorderNFTs(gallery.id, items);
  };

  const remove = (id) => {
    const index = showData.findIndex((e) => e.id === id);
    if (index >= 0) {
      showData.splice(index, 1);
      setShowData([...showData]);
    }

    const galleryIndex = galleries.findIndex((e) => e.id === gallery.id);
    if (galleryIndex >= 0) {
      const nftIndex = galleries[galleryIndex].nfts.findIndex(
        (e) => e.id === id
      );
      if (nftIndex >= 0) {
        galleries[galleryIndex].nfts.splice(nftIndex, 1);
        setGalleries([...galleries]);
      }
    }
    fetch(`${apiUrl()}/gallery/remove`, {
      method: "POST",
      body: JSON.stringify({ id, gallery: gallery.id }),
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": auth.token,
      },
    })
      .then((res) => res.json())
      .then((json) => {});
  };

  return (
    <div className="rows margin-top">
      {showData ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {showData.map((nft, index) => {
                  return (
                    <Draggable key={nft.id} draggableId={nft.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div className="flex reorder-block">
                            <img
                              src="/assets/drag.png"
                              className="v-center drag-icon"
                            />
                            <img
                              src={nft.poster || nft.image}
                              className="reorder-image"
                            />
                            <div className="margin-left-s text-s v-center">
                              <strong>{nft.name}</strong>
                            </div>
                            <div className="flex-full" />
                            <div className="flex margin-top-s v-center">
                              <div
                                className="small-button"
                                onClick={() => remove(nft.id)}
                              >
                                <img
                                  src="/assets/close.png"
                                  className="close-icon"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="margin-top" />
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div>
          <em>No galleries created</em>
        </div>
      )}
    </div>
  );
}

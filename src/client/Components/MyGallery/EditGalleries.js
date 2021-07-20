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

export default function EditGalleries({
  galleries,
  setManage,
  setDel,
  setGalleries,
}) {
  const auth = useStoreState((state) => state.user.auth);
  const [showData, setShowData] = useState(null);

  useEffect(() => {
    if (galleries) setShowData(galleries);
  }, [galleries]);

  const pushReorder = (items) => {
    let i = 0;
    const update = [];
    items.forEach((item) => {
      update.push({
        id: item.id,
        order: i,
      });
      i++;
    });

    fetch(`${apiUrl()}/gallery/reorderGalleries`, {
      method: "POST",
      body: JSON.stringify({ galleries: update }),
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

    pushReorder(items);
    setShowData(items);
    setGalleries([...items]);
  };

  return (
    <div className="rows">
      {showData ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {showData.map((gallery, index) => {
                  return (
                    <Draggable
                      key={gallery.id}
                      draggableId={gallery.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div className="flex reorder-block">
                            <img
                              src="/assets/drag.png"
                              className="drag-icon v-center"
                            />
                            <div className="flex-full">
                              <div className="text-m">
                                <strong>{gallery.name}</strong>
                              </div>
                              <div className="text-s">
                                {gallery.description}
                              </div>
                              <div className="flex margin-top-s">
                                <div
                                  className="small-button"
                                  onClick={() => setManage(gallery)}
                                >
                                  <div className="text-s">Manage</div>
                                </div>
                                <div
                                  className="small-button margin-left-s"
                                  onClick={() => setDel(gallery)}
                                >
                                  <div className="text-s">Delete</div>
                                </div>
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

const login = (data) => {};

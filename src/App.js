import React, { useState, useCallback } from "react";
import ReactDOM from "react-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./App.css";

const initialColumns = {
  ["column-1"]: {
    id: "column-1",
    title: "Column 1",
    items: Array.from({ length: 10 }, (v, k) => ({
      id: `item-1-${k}`,
      content: `Item 1-${k}`,
    })),
  },
  ["column-2"]: {
    id: "column-2",
    title: "Column 2",
    items: Array.from({ length: 5 }, (v, k) => ({
      id: `item-2-${k}`,
      content: `Item 2-${k}`,
    })),
  },
  ["column-3"]: {
    id: "column-3",
    title: "Column 3",
    items: Array.from({ length: 8 }, (v, k) => ({
      id: `item-3-${k}`,
      content: `Item 3-${k}`,
    })),
  },
  ["column-4"]: {
    id: "column-4",
    title: "Column 4",
    items: Array.from({ length: 7 }, (v, k) => ({
      id: `item-4-${k}`,
      content: `Item 4-${k}`,
    })),
  },
};

function App() {
  const [columns, setColumns] = useState(initialColumns);
  const [selectedItems, setSelectedItems] = useState([]);
  const [draggingItemId, setDraggingItemId] = useState(null);
  const [source, setSource] = useState(null);

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragStart = (start) => {
    setSource(start.source);
    setDraggingItemId(start.draggableId);
  };

  const onDragEnd = useCallback(
    (result) => {
      const { source, destination } = result;

      setSource(null);
      setDraggingItemId(null);
      setSelectedItems([]);

      if (!destination) {
        return;
      }

      if (
        source.droppableId === "column-1" &&
        destination.droppableId === "column-3"
      ) {
        return;
      }

      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];

      if (
        sourceColumn === destColumn &&
        destination.index % 2 === 1 &&
        destColumn.items[destination.index - 1]?.id.startsWith("item-1-")
      ) {
        return;
      }

      if (sourceColumn === destColumn) {
        const newItems = reorder(
          sourceColumn.items,
          source.index,
          destination.index
        );
        const newColumn = { ...sourceColumn, items: newItems };
        setColumns((prev) => ({ ...prev, [newColumn.id]: newColumn }));
      } else {
        const sourceItems = Array.from(sourceColumn.items);
        const destItems = Array.from(destColumn.items);
        const movedItems = selectedItems.includes(result.draggableId)
          ? selectedItems.map((id) =>
              sourceItems.find((item) => item.id === id)
            )
          : [sourceItems[source.index]];

        movedItems.forEach((item) => {
          const index = sourceItems.findIndex((i) => i.id === item.id);
          if (index > -1) {
            sourceItems.splice(index, 1);
          }
        });

        destItems.splice(destination.index, 0, ...movedItems);

        setColumns((prev) => ({
          ...prev,
          [sourceColumn.id]: { ...sourceColumn, items: sourceItems },
          [destColumn.id]: { ...destColumn, items: destItems },
        }));
      }
    },
    [columns, selectedItems]
  );

  const handleSelect = (itemId) => {
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.includes(itemId)
        ? prevSelectedItems.filter((id) => id !== itemId)
        : [...prevSelectedItems, itemId]
    );
  };

  const getItemStyle = (
    isDragging,
    draggableStyle,
    isSelected,
    sourceDroppableId,
    destinationDroppableId
  ) => {
    const isRestrictedArea =
      isDragging &&
      destinationDroppableId === "column-3" &&
      sourceDroppableId === "column-1";

    const baseStyle = {
      backgroundColor: isRestrictedArea
        ? "red"
        : isDragging || isSelected
        ? "lightgreen"
        : "grey",
      opacity: isDragging && isSelected ? 0.5 : 1,
    };

    return {
      ...draggableStyle,
      ...baseStyle,
    };
  };

  return (
    <div className="app">
      <header className="header">
        <h1>MementoAI - Front Assignment (송경용)</h1>
      </header>
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="columns">
          {Object.values(columns).map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`column ${
                    snapshot.isDraggingOver ? "dragging-over" : ""
                  } ${
                    snapshot.isDraggingOver &&
                    source &&
                    source.droppableId === "column-1" &&
                    column.id === "column-3"
                      ? "restricted"
                      : ""
                  }`}
                >
                  <h2>{column.title}</h2>
                  {column.items.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided, snapshot) => {
                        const isDraggingItem = snapshot.isDragging;
                        const isSelected = selectedItems.includes(item.id);
                        const draggingOverId = snapshot.draggingOver;

                        return (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`item ${
                              isDraggingItem ? "dragging" : ""
                            } ${isSelected ? "selected" : ""}`}
                            style={getItemStyle(
                              isDraggingItem,
                              provided.draggableProps.style,
                              isSelected,
                              source?.droppableId,
                              draggingOverId
                            )}
                            onClick={(e) => {
                              if (e.shiftKey) {
                                handleSelect(item.id);
                              }
                            }}
                          >
                            {item.content}
                            {isDraggingItem && isSelected && (
                              <div className="dragging-clone">
                                {selectedItems.map((id) => {
                                  const selectedItem = column.items.find(
                                    (item) => item.id === id
                                  );
                                  return (
                                    <div
                                      key={selectedItem.id}
                                      className="item dragging-clone-item"
                                      style={{
                                        width:
                                          provided.draggableProps.style.width,
                                        backgroundColor:
                                          draggingOverId === "column-3" &&
                                          source?.droppableId === "column-1"
                                            ? "red"
                                            : "lightgreen",
                                        opacity: 0.5,
                                      }}
                                    >
                                      {selectedItem.content}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      }}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
      <div className="shift-message">
        <p>( Shift키를 눌러 다중 선택 가능 )</p>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));

export default App;

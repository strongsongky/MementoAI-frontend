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
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragStart = (start) => {
    setSource(start.source);
  };

  const onDragUpdate = (update) => {
    setDestination(update.destination);
  };

  const onDragEnd = useCallback(
    (result) => {
      setSource(null);
      setDestination(null);

      const { source, destination } = result;

      if (!destination) {
        return;
      }

      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];

      if (
        source.droppableId === "column-1" &&
        destination.droppableId === "column-3"
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
        const [removed] = sourceItems.splice(source.index, 1);
        const destItems = Array.from(destColumn.items);
        destItems.splice(destination.index, 0, removed);
        setColumns((prev) => ({
          ...prev,
          [sourceColumn.id]: { ...sourceColumn, items: sourceItems },
          [destColumn.id]: { ...destColumn, items: destItems },
        }));
      }
    },
    [columns]
  );

  const getItemStyle = (isDragging, draggableStyle) => {
    if (
      isDragging &&
      destination &&
      destination.droppableId === "column-3" &&
      source &&
      source.droppableId === "column-1"
    ) {
      return {
        ...draggableStyle,
        backgroundColor: "red",
      };
    }

    return {
      ...draggableStyle,
      backgroundColor: isDragging ? "lightgreen" : "grey",
    };
  };

  return (
    <div className="app">
      <header className="header">
        <h1>MementoAI - Front Assignment (송경용)</h1>
      </header>
      <DragDropContext
        onDragStart={onDragStart}
        onDragUpdate={onDragUpdate}
        onDragEnd={onDragEnd}
      >
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
                    destination &&
                    destination.droppableId === "column-3" &&
                    source &&
                    source.droppableId === "column-1"
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
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`item ${
                            snapshot.isDragging ? "dragging" : ""
                          }`}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                        >
                          {item.content}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));

export default App;

import logo from "./logo.svg";
import "./App.css";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import { joinRoom } from "trystero";

const initialState = { peers: {} };

function reducer(state, action) {
  switch (action.type) {
    case "addPeer":
      return { peers: { ...state.peers, [action.id]: [0, 0] } };
    case "setPeerCoords":
      return { peers: { ...state.peers, [action.id]: action.coords } };
    default:
      throw new Error();
  }
}

function App() {
  const room = useRef(null);
  const [peersList, setPeersList] = useState([]);
  const [state, dispatch] = useReducer(reducer, initialState);

  const updatePeers = useCallback(() => {
    setPeersList(room.current.getPeers());
  }, []);

  useEffect(() => {
    // Join the room
    const config = { appId: "cra-testing-app" };
    room.current = joinRoom(config, "test-room");

    window.tystero = room.current;
    room.current.onPeerJoin((id) => {
      console.log("joined " + id);
      updatePeers();
    });
    room.current.onPeerLeave((id) => {
      console.log("left " + id);
      updatePeers();
    });
    const [sendMove, getMove] = room.current.makeAction("mouseMove");
    getMove((coords, id) => dispatch({ type: "setPeerCoords", coords, id }));

    window.addEventListener("mousemove", ({ clientX, clientY, buttons }) => {
      const mouseX = clientX / window.innerWidth;
      const mouseY = clientY / window.innerHeight;

      if (room) {
        sendMove([mouseX, mouseY]);
      }
    });
  }, [dispatch, updatePeers]);

  return (
    <div className="App">
      {Object.keys(state.peers).map((p) => {
        const coords = state.peers[p];
        return (
          <div
            className="coordinate"
            key={p + "-mouse"}
            style={{ left: Math.round(window.innerWidth * coords[0]), top: Math.round(window.innerHeight * coords[1]) }}
          >
            {p}
          </div>
        );
      })}
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        <div>
          {peersList.map((p) => (
            <div key={p + "-peer-list"}>{p}</div>
          ))}
        </div>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;

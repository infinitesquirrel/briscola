import React, { Component } from "react";
import { Link } from "react-router-dom";
import { SocketIO } from "boardgame.io/multiplayer";
import { Client } from "boardgame.io/react";
import "./styles/lobby.css";
import { LobbyAPI } from "./api.js";
import { Briscola } from "./GameLogic.js";
import Board from "./Board.js";
import TemplatePage from "./templatePage.js";
import { GAME_SERVER_URL, APP_PRODUCTION } from "./config.js";

// TODO
// Switch player IDs every rematch to move the "dealer" position every game.

const api = new LobbyAPI();
const server = APP_PRODUCTION
  ? `https://${window.location.hostname}`
  : GAME_SERVER_URL;
const GameClient = Client({
  game: Briscola,
  board: Board,
  debug: false,
  multiplayer: SocketIO({
    server: server,
  }),
});
class RematchLobby extends Component {
  state = {};
  constructor(props) {
    super(props);
    console.log("Constructing rematch lobby");
    this.state.id = null;
    this.state.joined = [];
    this.state.myID = null;
    this.state.userAuthToken = null;
  }
  componentDidMount() {
    this.playAgain();
    this.interval = setInterval(this.checkRoomState, 1000);
    window.addEventListener("beforeunload", this.cleanup.bind(this));
  }
  cleanup() {
    console.log("Cleaning up");
    api.leaveRoom(this.state.id, this.state.myID, this.state.userAuthToken);
    clearInterval(this.interval);
  }
  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.cleanup.bind(this));
  }
  playAgain = () => {
    api.playAgain(...this.props.nextRoomID).then((value) => {
      this.setState({ id: value }, () => {
        this.checkRoomStateAndJoin();
      });
      console.log(
        "Promise returned value which will become the new room ID: " + value
      );
    });
  };
  joinRoom = (player_no) => {
    const username = "Player " + player_no;
    if (this.state.id) {
      api.joinRoom(this.state.id, username, player_no).then(
        (authToken) => {
          console.log("Joined room as player ", player_no);
          this.setState({ myID: player_no, userAuthToken: authToken });
        },
        (error) => {
          console.log(error);
        }
      );
    }
  };
  checkRoomStateAndJoin = () => {
    console.log("Pinging room endpoint to see who's there.");
    if (this.state.id) {
      api.whosInRoom(this.state.id).then(
        (players) => {
          const joinedPlayers = players.filter((p) => p.name);
          this.setState({
            joined: joinedPlayers,
          });
          console.log(joinedPlayers);
          const myPlayerNum = joinedPlayers.length;
          this.joinRoom(myPlayerNum);
        },
        (error) => {
          console.log("Room does not exist!");
          this.setState({
            id: null,
          });
        }
      );
    }
  };
  checkRoomState = () => {
    if (this.state.id) {
      api.whosInRoom(this.state.id).then(
        (players) => {
          const joinedPlayers = players.filter((p) => p.name);
          this.setState({
            joined: joinedPlayers,
          });
        },
        (error) => {
          console.log("Room does not exist!");
          this.setState({
            id: null,
          });
        }
      );
    }
  };
  gameExistsView = () => {
    return (
      <>
        <div>Waiting for oponent to accept the rematch.</div>
        <div id="bars1">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </>
    );
  };
  gameNotFoundView = () => {
    return (
      <>
        <div>
          Something went wrong while setting-up a rematch.
          <br />
          <Link to="/">Go back and create a new lobby.</Link>
        </div>
      </>
    );
  };
  getGameClient = () => {
    return (
      <GameClient
        gameID={this.state.id}
        players={this.state.joined}
        playerID={String(this.state.myID)}
        credentials={this.state.userAuthToken}
      ></GameClient>
    );
  };
  render() {
    if (this.state.joined.length === 2) {
      return this.getGameClient();
    }
    return (
      <TemplatePage
        content={
          this.state.id ? this.gameExistsView() : this.gameNotFoundView()
        }
      />
    );
  }
}
export default RematchLobby;

import React, { useState, useEffect } from "react";
import { Trans } from "react-i18next";
import { Link } from "react-router-dom";

export default function LiveButtons(props) {
  const [isHidden, setIsHidden] = useState(true);
  const hero = props.handID;
  const villainID = !parseFloat(hero) ? 1 : 0;
  const playAgainPayload = [
    props.gameData.matchID,
    props.gameData.playerID,
    props.gameData.credentials,
  ];

  useEffect(() => {
      setTimeout(() => {
          setIsHidden(false)
      }, props.delay)
  });
// 22 blo villain-hand-button
  return isHidden ? '' : (
    <div className="hero-hand ease-in">
      <div id="menu-button-wrapper">
        <Link
          to={{
            pathname: "/rematch/",
            playAgainPayload: playAgainPayload,
            newPlayerID: villainID,
            key: props.gameData.matchID,
          }}
        >
          <div className="menu-button game-over">
            <Trans>Rematch</Trans>
          </div>
        </Link>
        <Link to="/">
          <div className="menu-button game-over">
            <span>
              <Trans>Leave</Trans>
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}

import React, { useCallback, useRef, useState } from "react";
import * as MainV2 from "../../common/game/MainV2";
import AnteButton from "../Buttons/AnteButton";
import PassCommunityModal from "../Dialogs/PassCommunityModal";
import PassDealPopUp from "../Dialogs/PassDealPopup";
import { shuffleDeck, getRandomInt } from "../../common/game/CommonGame";
import LogRocket from "../../util/LogRocketUtil";

const DealerPanel = ({ gameHash, Sno, SaveGameHash }) => {
  const [cardDealType, setCardDealType] = useState(-1);
  const [passCommunityModalOpen, setPassCommunityModalOpen] = useState(false);
  const [passDealPopUpOpen, setPassDealPopUpOpen] = useState(false);

  const txtAnteRef = useRef(null);
  const DealValueRef = useRef(null);

  /*
   *  1. Add PlayerCard
   *  2. Remove that card from GameHash.Deck.
   */
  const addPlayerCardAndUpdateGameHashDeck = useCallback(
    (currentPlayerNo, GameHash) => {
      // Generate random index of card to add to the PlayerCard.
      const rand1 = getRandomInt(0, GameHash.Deck.length - 1);
      const currentPlayer = MainV2.GetActivePlayerBySno(
        currentPlayerNo,
        GameHash
      );

      // Add PlayerCard, first of shuffeld deck.
      currentPlayer.PlayerCards.push({
        Value: GameHash.Deck[rand1],
        Presentation: cardDealType,
      });

      // Remove card from the Deck already added to players and Update GameHash's Deck property.
      MainV2.RemoveCardInGameHashDeck(rand1, GameHash);
    },
    [cardDealType]
  );

  //when you click deal button
  const Deal = useCallback(
    (Sno1) => {
      try {
        let tempGameHash = { ...gameHash };
        // shuffle current deck.
        tempGameHash.Deck = shuffleDeck(tempGameHash.Deck);

        // Get Number of card to pass
        const NumOfCard = parseInt(DealValueRef.current.value);

        // By default, Deck has only 50. so NumOfCard shoule be less than 50.
        if (tempGameHash.Deck.length < NumOfCard) {
          alert("Deck only contains " + tempGameHash.Deck.length);
          return;
        }

        if (isNaN(NumOfCard)) {
          alert("Input correct number");
          return;
        }

        if (NumOfCard <= 0) {
          alert("Cannot deal zero or less cards");
          return;
        }

        if (cardDealType === -1) {
          alert("Select deal type");
          return;
        }

        // select which you clicked.
        const PlayerId = Sno1;

        // Deal Type is "All"
        if (PlayerId === -1) {
          let NumberOfPlayer = tempGameHash.ActivePlayers.length;
          for (let i = 0; i < NumOfCard; i++) {
            for (let j = 0; j < NumberOfPlayer; j++) {
              const currentPlayerNo = j + 1;

              // If j + 1 player is not foleded
              if (
                MainV2.GetActivePlayerBySno(currentPlayerNo, tempGameHash)
                  .IsFolded === "N"
              ) {
                addPlayerCardAndUpdateGameHashDeck(
                  currentPlayerNo,
                  tempGameHash
                );
              }
            }
          }

          SaveGameHash(tempGameHash);
        } else if (
          /*
              Deal Type is specific player
              Check if that specific player is not folded.
          */
          PlayerId > 0 &&
          MainV2.FilterActivePlayer(
            (x) => x.IsFolded === "N" && x.Sno === PlayerId,
            tempGameHash
          ).length === 1
        ) {
          for (let i = 0; i < NumOfCard; i++) {
            addPlayerCardAndUpdateGameHashDeck(PlayerId, tempGameHash);
          }
          SaveGameHash(tempGameHash);
        } else if (PlayerId === "X") {
          setPassCommunityModalOpen(true);
        }
      } catch (err) {}
    },
    [SaveGameHash, addPlayerCardAndUpdateGameHashDeck, cardDealType, gameHash]
  );

  const PassCardToCommunity = useCallback(
    (num) => {
      if (num !== -2) {
        let tempGameHash = { ...gameHash };
        const communityposition =
          num === -1 ? tempGameHash.NumberOfCommunities : num - 1;

        let cnt = 0;
        while (cnt < DealValueRef.current.value) {
          const rand1 = getRandomInt(0, tempGameHash.Deck.length - 1);

          tempGameHash.CommunityCards.push({
            Value: tempGameHash.Deck[rand1],
            Presentation: cardDealType,
            CommunityIndex: communityposition,
          });

          MainV2.RemoveCardInGameHashDeck(rand1, tempGameHash);

          cnt++;
        }

        if (num === -1) {
          tempGameHash.NumberOfCommunities += 1;
        }

        LogRocket.log(
          "Deal " +
            DealValueRef.current.value +
            " Cards To Community " +
            communityposition,
          {
            GameHash: tempGameHash,
          }
        );

        SaveGameHash(tempGameHash);
      }
      setPassCommunityModalOpen(false);
    },
    [SaveGameHash, cardDealType, gameHash]
  );

  const PassDealEventHandler = useCallback((ev) => {
    setPassDealPopUpOpen(true);
  }, []);

  const PassDealPlayer = useCallback(
    (Sno1) => {
      setPassDealPopUpOpen(false);
      let tempGameHash = { ...gameHash };
      // if newdelaer is not set
      if (Sno1 === -1) {
        return;
      }

      // Set newdealerSno as Dealer
      MainV2.SetDealer(Sno1, tempGameHash);

      // set current
      if (
        MainV2.FilterActivePlayer((x) => x.Sno > Sno1, tempGameHash).length ===
        0
      ) {
        MainV2.SetFirstUnfoldedPlayerAsCurrent(-1, tempGameHash);
      } else {
        MainV2.SetFirstUnfoldedPlayerAsCurrent(Sno1, tempGameHash);
      }

      LogRocket.log(
        "Pass Deal To " +
          MainV2.FilterActivePlayer((x) => x.Sno === Sno1, tempGameHash)[0]
            .PlayerId,
        {
          GameHash: tempGameHash,
        }
      );

      SaveGameHash(tempGameHash);
    },
    [SaveGameHash, gameHash]
  );

  return (
    <>
      <div className="PlayerDealer m-1 pt-2">
        <div className="row align-items-center border-primary border-bottom mb-1 justify-content-between h-75">
          <div className="col-auto text-center p-0 mr-3 h-100">
            <input id="txtAnte" className="mt-0" ref={txtAnteRef} />
            <AnteButton
              gameHash={gameHash}
              txtAnteRef={txtAnteRef}
              Sno={Sno}
              SaveGameHash={SaveGameHash}
            />
          </div>
          <div className="col-auto p-0 text-left h-100">
            <span>Deal</span>
            <input id="DealValue" className="p-0" ref={DealValueRef} />
            <span>Cards</span>
          </div>
          <div className="col-2 p-0 m-3 text-left h-100">
            <div>
              <input
                type="radio"
                className="w-25 d-inline"
                id="faceup"
                value="public"
                name="CardDealType"
                onClick={() => setCardDealType("public")}
              />
              <label htmlFor="faceup" className="w-50 btn btn-sm btn-primary">
                up
              </label>
            </div>
            <div className="d-inline-block; mt-3">
              <input
                type="radio"
                className="w-25 d-inline"
                id="facedown"
                value="private"
                name="CardDealType"
                onClick={() => setCardDealType("private")}
              />
              <label htmlFor="facedown" className="w-50 btn btn-sm btn-primary">
                down
              </label>
            </div>
          </div>
          <div className="col-auto p-2 h-100">to</div>
          <div className="col-auto pr-0 text-left h-100">
            <div
              className="CardDealPlayer"
              style={{
                display: "inline-grid",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              <label
                style={{
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                onClick={() => Deal(-1)}
              >
                All
              </label>
              <label
                style={{
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                onClick={() => Deal("X")}
              >
                Community
              </label>
              {MainV2.FilterActivePlayer(
                (x) => x.IsFolded === "N",
                gameHash
              ).map((obj, index) => {
                return (
                  <label
                    key={index}
                    style={{
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                    onClick={() => Deal(obj.Sno)}
                  >
                    {obj.PlayerId.split("pk2")[0]}
                  </label>
                );
              })}
            </div>
          </div>
        </div>
        <div className="row m1-1">
          <div className="col-12 text-center">
            <button
              className="btn btn-sm btn-primary PassDeal m2"
              data-toggle="tooltip"
              data-html="true"
              title="click to view options"
              onClick={PassDealEventHandler}
            >
              Pass Deal
            </button>
          </div>
        </div>
      </div>
      <PassCommunityModal
        open={passCommunityModalOpen}
        setOpen={setPassCommunityModalOpen}
        number={gameHash.NumberOfCommunities}
        PassCardToCommunity={PassCardToCommunity}
      />
      <PassDealPopUp
        open={passDealPopUpOpen}
        setOpen={setPassDealPopUpOpen}
        players={MainV2.FilterActivePlayer(
          (x) => x.IsFolded === "N" && x.Sno !== Sno,
          gameHash
        )}
        PassDealPlayer={PassDealPlayer}
      />
    </>
  );
};

export default DealerPanel;

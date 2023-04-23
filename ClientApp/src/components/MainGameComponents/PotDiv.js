import React, { useCallback, useState } from "react";
import * as MainV2 from "../../common/game/MainV2";
import $ from "jquery";
import ChooseCommunityModal from "../Dialogs/ChooseCommunityModal";
import LogRocket from "logrocket";

const PotDiv = ({
  gameHash,
  Sno,
  DragSrc,
  SaveGameHash,
  isDealer,
  setDragSrc,
}) => {
  const [chooseCommunityModalOpen, setChooseCommunityModalOpen] =
    useState(false);
  const [cardImageCommunityModal, setCardImageCommunityModal] = useState("");
  const [CardSelectedValue, setCardsSelectedValue] = useState("");

  const CommunityCardEventHandler = useCallback((ev, cardImage, cardValue) => {
    setCardsSelectedValue(cardValue);
    setCardImageCommunityModal(cardImage);
    setChooseCommunityModalOpen(true);
  }, []);

  const TakeCommunityCard = useCallback(
    (val) => {
      let tempGameHash = { ...gameHash };
      if (val === "1") {
        const comindex = tempGameHash.CommunityCards.filter(
          (y) => y.Value === CardSelectedValue
        )[0].CommunityIndex;
        MainV2.FilterActivePlayer(
          (x) => x.Sno === Sno,
          tempGameHash
        )[0].PlayerCards.push(
          tempGameHash.CommunityCards.filter(
            (y) => y.Value === CardSelectedValue
          )[0]
        );
        tempGameHash.CommunityCards = tempGameHash.CommunityCards.filter(
          (x) => x.Value !== CardSelectedValue
        );

        if (
          tempGameHash.CommunityCards.filter(
            (x) => x.CommunityIndex === comindex
          ).length === 0
        ) {
          tempGameHash.CommunityCards.filter(
            (x) => x.CommunityIndex > comindex
          ).forEach((obj) => {
            obj.CommunityIndex = obj.CommunityIndex - 1;
          });
        }
        if (tempGameHash.CommunityCards) {
          LogRocket.log("Take Community Card: " + CardSelectedValue, {
            GameHash: tempGameHash,
            CommunityIndex: comindex,
          });

          SaveGameHash(tempGameHash);
        }

        /* MainV2.SendNotification(
          connection,
          GameCode,
          "",
          user.UserName + " has taken community card"
        ); */
      } else if (val === "2") {
        tempGameHash.CommunityCards.filter(
          (x) => x.Value === CardSelectedValue
        )[0].Presentation = "public"; // $('.CommunityCard[data-cardvalue="' + CardSelectedValue + '"]').length

        LogRocket.log("Take Community Card: " + CardSelectedValue, {
          GameHash: tempGameHash,
        });

        SaveGameHash(tempGameHash);

        /* MainV2.SendNotification(
          connection,
          GameCode,
          "",
          user.UserName + " Community Card shown"
        ); */
      } else if (val === "-1") {
        $(".CommunityCard").removeClass("Selected");
        //$("#CommunityCardClickPopUp").hide();
      } else if (val === "-2") {
        const comindex = tempGameHash.CommunityCards.filter(
          (y) => y.Value === CardSelectedValue
        )[0].CommunityIndex;
        tempGameHash.Deck.push(CardSelectedValue);
        tempGameHash.CommunityCards = tempGameHash.CommunityCards.filter(
          (y) => y.Value !== CardSelectedValue
        );
        tempGameHash.CommunityCards = tempGameHash.CommunityCards.filter(
          (x) => x.Value !== CardSelectedValue
        );
        if (
          tempGameHash.CommunityCards.filter(
            (x) => x.CommunityIndex === comindex
          ).length === 0
        ) {
          tempGameHash.CommunityCards.filter(
            (x) => x.CommunityIndex > comindex
          ).forEach((obj) => {
            obj.CommunityIndex = obj.CommunityIndex - 1;
          });
        }

        LogRocket.log("Take Community Card: " + CardSelectedValue, {
          GameHash: tempGameHash,
          CommunityIndex: comindex,
        });

        SaveGameHash(tempGameHash);

        /* MainV2.SendNotification(
          connection,
          GameCode,
          "",
          user.UserName + " moved the card to Deck"
        ); */
      }

      setChooseCommunityModalOpen(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [SaveGameHash, CardSelectedValue, Sno, gameHash]
  );

  const DropToCommunity = useCallback(
    (ev, communityIndex) => {
      let tempGameHash = { ...gameHash };
      try {
        //alert($(DragSrc).data('cardvalue'));
        ev.preventDefault();
        // for now opening modal for community
      } catch (ex) {
        alert("drop at the right place!");
      }
      if (
        DragSrc &&
        (DragSrc.Sno !== undefined || DragSrc.CommunityIndex !== undefined)
      ) {
        MainV2.PassCardToCommunityDrop(communityIndex, DragSrc, tempGameHash);
      }

      LogRocket.log(
        "Passed Card " + DragSrc.Value + " To Community " + communityIndex,
        {
          GameHash: tempGameHash,
        }
      );

      SaveGameHash(tempGameHash);
      //setDragSrc(undefined);
    },
    [gameHash, DragSrc, SaveGameHash]
  );

  const AllowDropCommunity = useCallback((ev) => {
    ev.preventDefault();
  }, []);

  const DragEndCommunity = useCallback((ev) => {
    ev.preventDefault();
  }, []);

  const Drag = useCallback(
    (CommunityIndex, cardvalue) => {
      setDragSrc({ CommunityIndex: CommunityIndex, Value: cardvalue });
    },
    [setDragSrc]
  );

  return (
    <>
      <div className="bg-white text-center">
        <div
          className="bg-secondary text-primary text-center mb-0 p-0"
          id="status"
        >
          {gameHash.BetStatus !== undefined && gameHash.BetStatus !== "" && (
            <>{gameHash.BetStatus}</>
          )}
        </div>
      </div>
      <div className="text-center mx-auto p-3">
        <div className="PlayerNameX badge badge-warning mt-1">Pot</div>
        <span className="PlayerStatus badge badge-warning mx-auto">
          {gameHash.PotSize}
        </span>
        {gameHash.Deck.length !== 52 && gameHash.CommunityCards.length > 0 && (
          <div className="PlayerX mt-3 row">
            {Array.apply(null, Array(gameHash.NumberOfCommunities)).map(
              (obj, index) => (
                <div
                  style={{
                    paddingLeft: "0px",
                    paddingRight: "0px",
                    padding: "0px important!",
                    width: "20%",
                    color: "white",
                  }}
                  id={"CommunityIndex" + index}
                  key={index}
                >
                  {index + 1} <br />
                  {gameHash.CommunityCards.filter(
                    (x) => x.CommunityIndex === index
                  ).map((obj, index) => {
                    let cardimage = "";
                    if (obj.Value.length === 3) {
                      cardimage = obj.Value[2] + obj.Value[0] + obj.Value[1];
                    } else {
                      cardimage = obj.Value[1] + obj.Value[0];
                    }
                    cardimage =
                      obj.Presentation === "public" ? cardimage : "backside";
                    return (
                      <img
                        key={index}
                        alt=""
                        src={"/assets/Cards/" + cardimage + ".png"}
                        className="CommunityCard"
                        data-cardvalue={obj.Value}
                        data-presentation={obj.Presentation}
                        data-communityindex={index}
                        onDragStart={() => Drag(index, obj.Value)}
                        onClick={(ev) =>
                          CommunityCardEventHandler(ev, cardimage, obj.Value)
                        }
                      />
                    );
                  })}
                  <div
                    className="CommunityCardDrop"
                    data-cardvalue="-1"
                    data-presentation="public"
                    data-communityindex={index}
                    onDrop={(ev) => DropToCommunity(ev, index)}
                    draggable="false"
                    onDragOver={AllowDropCommunity}
                    onDragEnd={DragEndCommunity}
                    onDragLeave={DragEndCommunity}
                  >
                    +
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      <ChooseCommunityModal
        open={chooseCommunityModalOpen}
        setOpen={setChooseCommunityModalOpen}
        cardImage={cardImageCommunityModal}
        isDealer={isDealer}
        TakeCommunityCard={TakeCommunityCard}
      />
    </>
  );
};

export default PotDiv;

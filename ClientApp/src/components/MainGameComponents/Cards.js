import React, { useCallback } from "react";

const Cards = ({ obj, Sno, setDragSrc, handleClick, isCurrent = false }) => {
  const getCardImage = (obj) => {
    return obj.Value.length === 3
      ? obj.Value[2] + obj.Value[0] + obj.Value[1]
      : obj.Value[1] + obj.Value[0];
  };

  const Drag = useCallback(
    (Sno1, cardvalue) => {
      setDragSrc({ Sno: Sno1, Value: cardvalue });
    },
    [setDragSrc]
  );

  return (
    <img
      alt=""
      src={
        isCurrent || obj.Presentation === "public"
          ? "/assets/Cards/" + getCardImage(obj) + ".png"
          : "/assets/Cards/backside.png"
      }
      className="PlayerCard"
      data-cardvalue={obj.Value}
      data-presentation={obj.Presentation}
      title={obj.Presentation}
      draggable={isCurrent}
      onDragStart={() => Drag(Sno, obj.Value)}
      onClick={handleClick}
    />
  );
};

export default Cards;

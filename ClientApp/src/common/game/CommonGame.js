export const suits = ["C", "D", "H", "S"];
export const ranks = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

export const PokerHandRanks = [
  { Rank: 1, Title: "Royal Flush" }, ///A, K, Q, J, 10, all the same suit.

  { Rank: 2, Title: "Straight Flush" }, ///Five cards in a sequence, all in the same suit.

  { Rank: 3, Title: "Four of a Kind" }, /// All four cards of the same rank.

  { Rank: 4, Title: "Full House" }, ///Three of a kind with a pair.

  { Rank: 5, Title: "Flush" }, /// Any five cards of the same suit, but not in a sequence.

  { Rank: 6, Title: "Straight" }, /// Five cards in a sequence, but not of the same suit.

  { Rank: 7, Title: "Three of a Kind" }, // Three cards of the same rank.

  { Rank: 8, Title: "Two Pair" }, //Two different pairs.

  { Rank: 9, Title: "Pair" }, /// Two cards of the same rank.

  { Rank: 10, Title: "High Card" }, // When you haven't made any of the hands above, the highest card plays.In the example below, the jack plays as the highest card.
];
//make new deck
export const GetNewDeck = () => {
  let Deck = [];
  for (var i = 0; i < suits.length; i++) {
    for (var j = 0; j < ranks.length; j++) {
      Deck.push(ranks[j] + suits[i]);
    }
  }

  return Deck;
};

//shuffle the deck(common card game shuffling)
export const shuffleDeck = (deck) => {
  for (var i = 0; i < deck.length; i++) {
    var rndNo = getRandomInt(0, deck.length - 1);
    var random1 = getRandomInt(0, deck.length - 1);
    if (deck[random1] !== null && deck[rndNo] !== null) {
      var card = deck[random1];
      deck[random1] = deck[rndNo];
      deck[rndNo] = card;
    }
  }

  return deck.filter((x) => x !== null && x !== undefined);
};

export const PokerHand = (hand) => {
  //get ranks of hands
  const handOne = hand; // "AC 4S 5S 8C AH";

  let rankArray = [];
  let suitArray = [];
  let arrayHandOne = handOne.split(" ");

  function sorted() {
    let sortedHand = [];
    for (let i = 0; i < ranks.length; i++) {
      for (let j = 0; j < arrayHandOne.length; j++) {
        if (ranks[i] === arrayHandOne[j].charAt(0)) {
          sortedHand.push(arrayHandOne[j]);
        }
      }
    }
    return sortedHand;
  }

  let sortedHandOne = sorted(arrayHandOne);
  function suitAndRank(sortedHandOne) {
    for (let i = 0; i < sortedHandOne.length; i++) {
      let sted = sortedHandOne;
      rankArray.push(sted[i].charAt(0));
      suitArray.push(sted[i].charAt(1));
    }
  }

  suitAndRank(sortedHandOne);

  function countSuites(suitArray) {
    let suitCount = {};
    suitArray.forEach(function (x) {
      suitCount[x] = (suitCount[x] || 0) + 1;
    });
    return suitCount;
  }

  function countRanks(rankArray) {
    let rankCount = {};
    rankArray.forEach(function (x) {
      rankCount[x] = (rankCount[x] || 0) + 1;
    });
    return rankCount;
  }

  function isFlush() {
    let cS = countSuites(suitArray);
    if (Object.keys(cS).find((key) => cS[key] === 5)) {
      return true;
    } else {
      return false;
    }
  }

  function isStraight() {
    let index = ranks.indexOf(rankArray[0]);
    let ref = ranks.slice(index, index + 5).join("");
    let section = rankArray.slice(0).join("");
    if (section === "10JQKA" && section === ref) {
      return "ROYALSTRAIGHT";
    } else if (section === "A2345" || section === ref) {
      return "STRAIGHT";
    } else {
      return "FALSE";
    }
  }

  function pairs() {
    let rS = countRanks(rankArray);
    return Object.keys(rS).filter((key) => rS[key] === 2).length;
  }

  function whichHand() {
    let rS = countRanks(rankArray);
    if (isFlush() === true && isStraight() === "ROYALSTRAIGHT") {
      console.log("Royal Flush");
    } else if (isFlush() === true && isStraight() === "STRAIGHT") {
      console.log("Straight Flush");
    } else if (Object.keys(rS).find((key) => rS[key] === 4)) {
      console.log("Four of a Kind");
    } else if (Object.keys(rS).find((key) => rS[key] === 3) && pairs() === 1) {
      console.log("Full House");
    } else if (isFlush() === true) {
      console.log("Flush");
    } else if (isStraight() === "STRAIGHT") {
      console.log("Straight");
    } else if (Object.keys(rS).find((key) => rS[key] === 3)) {
      console.log("Three of a Kind");
    } else if (pairs() === 2) {
      console.log("Two Pair");
    } else if (pairs() === 1) {
      console.log("Pair");
    } else {
      console.log("High Card", rankArray[rankArray.length - 1]);
    }
  }

  return whichHand();
};

/*
 * Get Random value between min and max
 */
export const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1));
};

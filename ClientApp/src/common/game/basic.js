import { GetNewDeck } from "./CommonGame";
export const getInitGameHash = () => ({
  /**
   * [{PlayerSno:2, Action: 'Bet 2' }]
   * PlayerSno: Sno of the player
   * Action: Last Action message of the specific player
   */
  LastActionPerformed: [], // [{PlayerSno:2, Action: 'Bet 2' }]
  MeetingId: null,
  GameHand: 1,
  /*
   * transaction list for end game summary table
   */
  Transaction: [],
  FinalTransaction: [],
  /**
   * Player's final status of betting amount.
   * PlayerId: player's unique id.
   * Status: betting amount.
   */
  PlayerNetStatus: [], // [{PlayerId:s1pk213i29031, Status:-12},{PlayerId:s2pk213i29031, Status:12}]
  BetStatus: "New hand. No bet yet.",
  BetStatusSno: 0,
  IsRoundSettlement: "N",
  CurrentBet: 0, // for new req of call
  GameId: "1",
  Deck: GetNewDeck(), /// brandnew deck from common
  // Active Player List
  ActivePlayers: [
    {
      PlayerId: "1", // combined username+ConnectionId
      PlayerName: "P1",
      PlayerCards: [
        {
          Value: "AD",
          Presentation: "private",
        },
        {
          Value: "AD",
          Presentation: "private",
        },
      ],
      IsRealTimeChat: "N",
      PlayerAmount: 0, // taken - bet = amount
      ConnectionId: "111",
      CurrentRoundStatus: 0,
    },
    {
      PlayerId: "2",
      PlayerName: "P2",
      IsRealTimeChat: "N",
      PlayerCards: [
        {
          Value: "AD",
          Presentation: "private",
        },
        {
          Value: "AH",
          Presentation: "private",
        },
      ],
      PlayerAmount: 0, // taken - bet = amount
      ConnectionId: "222",
      CurrentRoundStatus: 0,
    },
    {
      PlayerId: "3",
      PlayerName: "P3",
      IsRealTimeChat: "N",
      PlayerCards: [
        {
          Value: "2C",
          Presentation: "private",
        },
        {
          Value: "5S",
          Presentation: "private",
        },
      ],
      PlayerAmount: 0, // taken - bet = amount
      ConnectionId: "333",
      CurrentRoundStatus: 0,
    },
    {
      PlayerId: "4",
      PlayerName: "P4",
      IsRealTimeChat: "N",
      PlayerCards: [
        {
          Value: "10S",
          Presentation: "private",
        },
        {
          Value: "10H",
          Presentation: "private",
        },
      ],
      PlayerAmount: 0, // taken - bet = amount
      ConnectionId: "444",
      CurrentRoundStatus: 0,
    },
    {
      PlayerId: "5",
      PlayerName: "P5",
      IsRealTimeChat: "N",
      PlayerCards: [
        {
          Value: "4H",
          Presentation: "private",
        },
        {
          Value: "6D",
          Presentation: "private",
        },
      ],
      PlayerAmount: 0, // taken - bet = amount
      ConnectionId: "555",
      CurrentRoundStatus: 0,
    },
  ],
  // Steps of game.
  Steps: [],
  PreviousStep: 3,
  NextStep: 4,
  CurrentUser: 1, // one who will play step 4
  PrevSno: 2,
  PotSize: 0,
  ModifiedDate: new Date(),
  // Current Round Number.
  Round: 1,
  // Cards of community
  CommunityCards: [],
  PlayerHandsAfterEachRound: [],
  DiscardedCards: [], // { PlayerSno: 1, CardDiscarded: [{Value:"AH",Presentation: "private"}]}
  ContinuityPlayers: [], // players that were folded intentionally or due to server
  NumberOfCommunities: 5,
  CompleteHand: [],
  Settlement: [],
  AccountDetail: [], // [{PlayerId:1,Amount:-50}];
});

export const GenerateCode = () => {
  let invitation_code = "";
  const characters = "1386540";
  const charactersLength = characters.length;
  for (let i = 0; i < charactersLength; i++) {
    invitation_code += characters.charAt(
      Math.floor(Math.random() * charactersLength)
    );
  }
  return invitation_code;
};

/*
 * Generate Player Id from userName and userId.
 * return {userName}pk2{userId}
 */
export const GeneratePlayerId = (userName, userId) => {
  return userName + "pk2" + userId;
};

/**
 * Get UserId
 * */
/*function UniqueId {
  return accessCookie('UserIdentity')
}
*/
/*
 * Get UserName from UserName + pk2 + ConnectionId formatted string.
 */
export const GetUserNameFromPlayerId = (playerId) => {
  return playerId.split("pk2")[0];
};

/*
 * Get ConnectionId from UserName + pk2 + ConnectionId formatted string.
 */
export const GetConnectionIdFromPlayerId = (playerId) => {
  return playerId.split("pk2")[1];
};

/**
 * Returns parameter string with its first letter capitalized
 *
 * @param {string} str - The string to capitalize
 */
export const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/*
  Initialize Cookie
*/
export const ClearCookieFunction = () => {
  createCookie("UserIdentity", "", 2000);
  //location.reload()
};

/*
  set coookie's cookieName = cookieValue with expiration of daysToExpire
  @params
  cookieName: cookie propery name
  cookieValue: cookie propery value
  daysToExpire: cookie expiration time
*/
export const createCookie = (cookieName, cookieValue, daysToExpire) => {
  const date = new Date();
  date.setTime(date.getTime() + daysToExpire * 24 * 60 * 60 * 1000);
  document.cookie =
    cookieName + "=" + cookieValue + "; expires=" + date.toGMTString();
};

/*
  get cookieValue of cookieName
  @params
  cookieName: cookie propery name that you want to get
*/
export const accessCookie = (cookieName) => {
  const name = cookieName + "=";
  const allCookieArray = document.cookie.split(";");
  for (let i = 0; i < allCookieArray.length; i++) {
    const temp = allCookieArray[i].trim();
    if (temp.indexOf(name) === 0) {
      return temp.substring(name.length, temp.length);
    }
  }
  return "";
};

/*
 * Clear Local Storage
 */
export const clearLocalStorage = () => {
  localStorage.removeItem("LastGameCode");
  localStorage.removeItem("UserId");
};

/*
  Set New UserIdentity
  @params
  UniqueId: new user's unique id get from server.
*/
export const setNewUserIdentityCookie = (UniqueId) => {
  // set New UserIdentity Cookie as UniqueId and IsIdentityRenewed flag as 2
  createCookie("UserIdentity", UniqueId, 2000);
  createCookie("IsIdentityRenewed", "2", 2000);

  // clear LocalStorage
  clearLocalStorage();
};

/*
 * Set Local Storage LastGameCode and UserId propery
 * @params
 * CurrentGameCode: LastGameCode propery value in Localstorage
 * PlayerId: UserId propery value in Localstorage
 */
export const setLocalStorage = (CurrentGameCode, PlayerId) => {
  localStorage.setItem("LastGameCode", CurrentGameCode);
  localStorage.setItem("UserId", PlayerId);
};

/*
 * Parse UserId from LocalStorage
 */
/*function () {
  const UserId = localStorage.getItem('UserId')
  if (UserId === undefined) { return '' }

  return GetUserNameFromPlayerId(UserId)
}
*/

/*
 * Parse ConnectionId from LocalStorage
 */
export const GetConnectionIdFromLocalStorage = () => {
  const UserId = localStorage.getItem("UserId");
  if (UserId === undefined) {
    return "";
  }

  return GetConnectionIdFromPlayerId(UserId);
};

/*
 * Parse LastGameCode from LocalStorage
 */
export const GetLastGameCode = () => {
  return localStorage.getItem("LastGameCode");
};

/*
 * Get Random value between min and max
 */
export const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1));
};

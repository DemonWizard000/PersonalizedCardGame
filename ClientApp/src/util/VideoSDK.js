import LogRocket from "./LogRocketUtil";
export const authToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiI0ZmJhMjA0Ni1iYTg0LTRjNTgtYThkNS03NTkyOGFlY2JhZGIiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTY4MTg5ODg0MiwiZXhwIjoxODM5Njg2ODQyfQ.poa2gHpNWZqzlKcXbKm8bLeeMiba25bGn-fTJimQBlA";

export const createMeeting = async () => {
  try {
    const res = await fetch(`https://api.videosdk.live/v2/rooms`, {
      method: "POST",
      headers: {
        authorization: `${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    //Destructuring the roomId from the response
    const data = await res.json();
    LogRocket.log("Created Meeting", data);
    return data.roomId;
  } catch (e) {
    console.log(e);
    return null;
  }
};

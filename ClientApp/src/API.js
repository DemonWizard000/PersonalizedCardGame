export const authToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiI0ZmJhMjA0Ni1iYTg0LTRjNTgtYThkNS03NTkyOGFlY2JhZGIiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTY4MTg5ODg0MiwiZXhwIjoxODM5Njg2ODQyfQ.poa2gHpNWZqzlKcXbKm8bLeeMiba25bGn-fTJimQBlA";

// API call to create meeting
export const createMeeting = async ({ token }) => {
  const res = await fetch(`https://api.videosdk.live/v2/rooms`, {
    method: "POST",
    headers: {
      authorization: `${authToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  const { roomId } = await res.json();
  return roomId;
};

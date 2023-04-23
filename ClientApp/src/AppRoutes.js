import SignIn from "./Pages/Auth/SignIn";
import SignUp from "./Pages/Auth/SignUp";
import Games from "./Pages/Game/Games";
import MainGame from "./Pages/Game/Main";
import JoinGame from "./Pages/Game/JoinGame";
import Features from "./Pages/LadningPages/Features";
import FreeTrial from "./Pages/LadningPages/FreeTrial";
import Home from "./Pages/Game/Home";

const AppRoutes = [
  {
    path: "/auth/sign-in",
    element: <SignIn />,
  },
  {
    path: "/auth/sign-up",
    element: <SignUp />,
  },
  {
    path: "/game/games",
    element: <Games />,
  },
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/game/main-game",
    element: <MainGame />,
  },
  {
    path: "/landing/features",
    element: <Features />,
  },
  {
    path: "/landing/free-trial",
    element: <FreeTrial />,
  },
];

export default AppRoutes;

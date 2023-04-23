import React, { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import "./custom.css";
import { SendRequest } from "./util/AxiosUtil";
import SignIn from "./Pages/Auth/SignIn";
import SignUp from "./Pages/Auth/SignUp";
import Games from "./Pages/Game/Games";
import Home from "./Pages/Game/Home";
import MainGame from "./Pages/Game/Main";
import Features from "./Pages/LadningPages/Features";
import FreeTrial from "./Pages/LadningPages/FreeTrial";
import LogRocket from "./util/LogRocketUtil";

const App = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    SendRequest({
      method: "post",
      url: "auth/get-user",
    })
      .then((response) => {
        localStorage.setItem("user", JSON.stringify(response.data));
        //LogRocket add session
        LogRocket.identify(response.data.Id, {
          name: response.data.UserName,
        });
        setIsAuthorized(true);
      })
      .catch(() => {
        localStorage.removeItem("jwt_token");
      });
  }, []);

  return (
    <Layout isAuthorized={isAuthorized}>
      <Routes>
        <Route element={<Home isAuthorized={isAuthorized} />} path="/" />
        <Route element={<SignIn />} path="/auth/sign-in" />
        <Route element={<SignUp />} path="/auth/sign-up" />
        <Route
          element={<Games isAuthorized={isAuthorized} />}
          path="/game/games"
        />
        <Route
          element={<MainGame isAuthorized={isAuthorized} />}
          path="/game/main-game"
        />
        <Route element={<Features />} path="/landing/features" />
        <Route element={<FreeTrial />} path="/landing/free-trial" />
      </Routes>
    </Layout>
  );
};

export default App;

import axios from "axios";

export const GetFullURL = (url) => process.env.REACT_APP_API_HOST + url;

export const SendRequest = (config) => {
  const token = localStorage.getItem("jwt_token");

  if (token !== null) {
    config.headers = {
      Authorization: `Bearer ${token}`,
    };
  }

  return axios({
    method: "post",
    data: {},
    ...config,
    url: GetFullURL(config.url),
  });
};

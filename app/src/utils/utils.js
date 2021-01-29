import React from "react";

export function rgba2hex(orig) {
  var a, // eslint-disable-next-line
    isPercent,
    rgb = orig
      .replace(/\s/g, "")
      .match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
    alpha = ((rgb && rgb[4]) || "").trim(),
    hex = rgb
      ? (rgb[1] | (1 << 8)).toString(16).slice(1) +
        (rgb[2] | (1 << 8)).toString(16).slice(1) +
        (rgb[3] | (1 << 8)).toString(16).slice(1)
      : orig;

  if (alpha !== "") {
    a = alpha;
  } else {
    a = parseInt("01", 8);
  }

  a = ((a * 255) | (1 << 8)).toString(16).slice(1);
  hex = hex + a;

  return hex;
}

export function updateTextArea(target) {
  target.style.height = "auto";
  target.style.height = target.scrollHeight + "px";
}

export function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0)
      return c.substring(nameEQ.length, c.length) === "null"
        ? null
        : c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function logout() {
  document.cookie = "token=null;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
}

export function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

export function ReactIsInDevelomentMode() {
  return "_self" in React.createElement("div");
}

export function getAPIUrl() {
  const API_ENDPOINT =
    process.env.REACT_APP_API_ENDPOINT ||
    (ReactIsInDevelomentMode() ? "http://localhost:2000/api" : "/api/");

  // let { host, protocol } = {
  //   host: window.location.hostname,
  //   protocol: window.location.protocol,
  // };

  // let apiUrl =
  //   protocol +
  //   "//" +
  //   host +
  //   (ReactIsInDevelomentMode() ? `:2000` : `:${window.location.port}`) +
  //   "/api";
  // return apiUrl;

  return API_ENDPOINT;
}

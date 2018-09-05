import React from "react";
import ReactDOM from "react-dom";
import { Catalog, pageLoader } from "catalog";

const pages = [
  {
    path: "/",
    title: "Intro",
    content: pageLoader(() => import("./intro.md")),
  },
  {
    path: "/getting-started",
    title: "Getting started",
    content: pageLoader(() => import("./getting-started.md")),
  },
  {
    title: "API",
    pages: [
      {
        path: "/api/rj",
        title: "rj",
        content: pageLoader(() => import("./api-rj.md")),
      },
    ]
  },
  {
    title: "Plugins",
    pages: [
      {
        path: "/plugins",
        title: "Plugins",
        content: pageLoader(() => import("./plugins.md")),
      },
      {
        path: "/plugins/list",
        title: "List",
        content: pageLoader(() => import("./plugins-list.md")),
      },
    ]
  },


];

ReactDOM.render(
  <Catalog title="redux-rocketjump" pages={pages} />,
  document.getElementById("catalog")
);

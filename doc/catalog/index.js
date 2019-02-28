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
        path: "/api/rocketpartial",
        title: "RocketPartial",
        content: pageLoader(() => import("./api-rocketpartial.md")),
      },
      {
        path: "/api/rocketjump",
        title: "RocketJump",
        content: pageLoader(() => import("./api-rocketjump.md")),
      },
      {
        path: "/api/composition",
        title: "Composition",
        content: pageLoader(() => import("./api-composition.md")),
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
        path: "/plugins/cache",
        title: "Cache Plugin",
        content: pageLoader(() => import("./plugins/cache.md")),
      },
      {
        path: "/plugins/delete",
        title: "Delete Plugin",
        content: pageLoader(() => import("./plugins/delete.md")),
      },
      {
        path: "/plugins/map",
        title: "Map Plugin",
        content: pageLoader(() => import("./plugins/map.md")),
      },
      {
        path: "/plugins/list",
        title: "List",
        content: pageLoader(() => import("./plugins/list.md")),
      },
      {
        path: "/plugins/promise",
        title: "Promise Plugin",
        content: pageLoader(() => import("./plugins/promise.md")),
      },
      {
        path: "/plugins/positionalArgs",
        title: "Positional Args Plugin",
        content: pageLoader(() => import("./plugins/positionalArgs.md")),
      },
      {
        path: "/plugins/update",
        title: "Update Plugin",
        content: pageLoader(() => import("./plugins/update.md")),
      },
    ]
  },


];

const theme = {
  codeStyles: {
    comment: { color: '#61E288' },
    keyword: { color: '#0000FF' },
    function: { color: '#FF0000' }
  },
};

ReactDOM.render(
  <Catalog title="Redux-RocketJump" pages={pages} theme={theme}  />,
  document.getElementById("catalog")
);

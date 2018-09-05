import React from "react";
import ReactDOM from "react-dom";
import { Catalog, pageLoader } from "catalog";

const pages = [
  {
    path: "/",
    title: "Intro",
    content: pageLoader(() => import("./WELCOME.md")),
    theme: {
      background: '#ddd',
      textColor: 'red'
    }
  }
];

ReactDOM.render(
  <Catalog title="redux-rocketjump" pages={pages} />,
  document.getElementById("catalog")
);

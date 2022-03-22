import React from "react";
import ReactDOM from "react-dom";
import "core-js/stable";
import "regenerator-runtime/runtime"; 
import App from "./App";
import "./styles.less";

var mountNode = document.getElementById("app");
ReactDOM.render(<App />, mountNode);
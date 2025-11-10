import React from 'react';
import ReactDOM from 'react-dom';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import App from './App';

const mountNode = document.getElementById('app');

if (mountNode) {
  ReactDOM.render(<App />, mountNode);
}

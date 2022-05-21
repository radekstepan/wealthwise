
import React from 'react';
import {hot} from 'react-hot-loader/root';
import {init} from '@rematch/core';
import {Provider} from 'react-redux';
import Page from './components/page/Page';
import reducers from './reducers';
import './app.less';

const store = init({
  models: reducers
});

const App = () => (
  <Provider store={store}>
    <Page />
  </Provider>
);

export default hot(App);

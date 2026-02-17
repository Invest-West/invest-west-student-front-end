import './suppressConsole'; // Must be first - suppresses console in production
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { applyMiddleware, createStore, Store } from 'redux';
import rootReducer, { AppState } from './redux-store/reducers';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

const store: Store<AppState> = createStore(rootReducer, applyMiddleware(thunk));

const root = createRoot(document.getElementById('root')!);
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

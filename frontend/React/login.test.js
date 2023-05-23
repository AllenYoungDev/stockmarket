/**
 * @jest-environment jsdom
 */

//import React from "react";
//import ReactDOM from 'react-dom/client';

import renderer from 'react-test-renderer';
import {LoginPage, LoginControls} from './login.js';

jest.mock('./utilities/fetchAccessTokenValidity');

import {fetchAccessTokenValidity} from './utilities/fetchAccessTokenValidity';

(async () => {
  if (typeof React === 'undefined') {
    globalThis.React = await import("react");
  }
  if (typeof ReactDOM === 'undefined') {
    globalThis.ReactDOM = await import("react-dom/client");
  }
})();

var loginState = '';

async function loginPageJestSnapshotTest(loginStateArg) {
  let testRenderer;
  let testInstance;
  let tree;

  loginState = loginStateArg;

  //renderer.create() is wrapped in renderer.act() for executing useEffect() calls in <HomePage />.
  //https://github.com/facebook/react/issues/15321
  await renderer.act(async () => {
    testRenderer = renderer.create(
      <LoginPage />,
    );
  });

  testInstance = testRenderer.root;
  expect(testInstance.findByType(LoginControls).props.loginState).toBe(loginStateArg);

  tree = testRenderer.toJSON();
  expect(tree).toMatchSnapshot();
}

it('React app Jest snapshot testing for Allen Young\'s Stockmarket Demo login page', async () => {

  fetchAccessTokenValidity.mockImplementation((setLoginState, ignore) => {
    console.log('fetchAccessTokenValidity() mock called!');
    setLoginState(loginState);
  });

  /*************************************************************************************************
  No-login mock Jest snapshot test
  **************************************************************************************************/
  await loginPageJestSnapshotTest('no-login');

  /*************************************************************************************************
  Non-admin-user-login mock Jest snapshot test
  **************************************************************************************************/
  await loginPageJestSnapshotTest('non-admin-login');

  /*************************************************************************************************
  Admin-user-login mock Jest snapshot test
  **************************************************************************************************/
  await loginPageJestSnapshotTest('admin-login');

  /*************************************************************************************************
  Fetch-error mock Jest snapshot test
  **************************************************************************************************/
  await loginPageJestSnapshotTest('fetch-error');
});
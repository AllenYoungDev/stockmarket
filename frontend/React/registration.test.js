/**
 * @jest-environment jsdom
 */

//import React from "react";
//import ReactDOM from 'react-dom/client';

import renderer from 'react-test-renderer';
import {UserRegistrationPage, AccountRegistrationForm} from './registration.js';

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

async function registrationPageJestSnapshotTest(loginStateArg) {
  let testRenderer;
  let testInstance;
  let tree;

  loginState = loginStateArg;

  //renderer.create() is wrapped in renderer.act() for executing useEffect() calls in <HomePage />.
  //https://github.com/facebook/react/issues/15321
  await renderer.act(async () => {
    testRenderer = renderer.create(
      <UserRegistrationPage />,
    );
  });

  testInstance = testRenderer.root;
  expect(testInstance.findByType(AccountRegistrationForm).props.loginState).toBe(loginStateArg);

  tree = testRenderer.toJSON();
  expect(tree).toMatchSnapshot();
}

it('React app Jest snapshot testing for Allen Young\'s Stockmarket Demo registration page', async () => {

  fetchAccessTokenValidity.mockImplementation((setLoginState, ignore) => {
    console.log('fetchAccessTokenValidity() mock called!');
    setLoginState(loginState);
  });

  /*************************************************************************************************
  No-login mock Jest snapshot test
  **************************************************************************************************/
  await registrationPageJestSnapshotTest('no-login');

  /*************************************************************************************************
  Non-admin-user-login mock Jest snapshot test
  **************************************************************************************************/
  await registrationPageJestSnapshotTest('non-admin-login');

  /*************************************************************************************************
  Admin-user-login mock Jest snapshot test
  **************************************************************************************************/
  await registrationPageJestSnapshotTest('admin-login');

  /*************************************************************************************************
  Fetch-error mock Jest snapshot test
  **************************************************************************************************/
  await registrationPageJestSnapshotTest('fetch-error');
});
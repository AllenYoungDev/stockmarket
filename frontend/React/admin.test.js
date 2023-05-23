/**
 * @jest-environment jsdom
 */

//import React from "react";
//import ReactDOM from 'react-dom/client';

import renderer from 'react-test-renderer';
import {AdminAccountPage, MyAccountLogout, UserList, TransactionList} from './admin.js';

jest.mock('./utilities/fetchAccessTokenValidity');
jest.mock('./utilities/fetchTotalNumberOfUsers');
jest.mock('./utilities/fetchUserList');
jest.mock('./utilities/fetchTotalNumberOfTransactions');
jest.mock('./utilities/fetchTransactionHistory');

import {fetchAccessTokenValidity} from './utilities/fetchAccessTokenValidity.js';
import {fetchTotalNumberOfUsers} from './utilities/fetchTotalNumberOfUsers.js';
import {fetchUserList} from './utilities/fetchUserList.js';
import {fetchTotalNumberOfTransactions} from './utilities/fetchTotalNumberOfTransactions.js';
import {fetchTransactionHistory} from './utilities/fetchTransactionHistory.js';

(async () => {
  if (typeof React === 'undefined') {
    globalThis.React = await import("react");
  }
  if (typeof ReactDOM === 'undefined') {
    globalThis.ReactDOM = await import("react-dom/client");
  }
})();

var loginState = '';

async function adminAccountPageJestSnapshotTest(loginStateArg) {
  let testRenderer;
  let testInstance;
  let tree;

  loginState = loginStateArg;

  //renderer.create() is wrapped in renderer.act() for executing useEffect() calls in <HomePage />.
  //https://github.com/facebook/react/issues/15321
  await renderer.act(async () => {
    testRenderer = renderer.create(
      <AdminAccountPage />,
    );
  });

  testInstance = testRenderer.root;
  expect(testInstance.findByType(MyAccountLogout).props.loginState).toBe(loginStateArg);
  expect(testInstance.findByType(UserList).props.loginState).toBe(loginStateArg);
  expect(testInstance.findByType(TransactionList).props.loginState).toBe(loginStateArg);

  tree = testRenderer.toJSON();
  expect(tree).toMatchSnapshot();
}

it('React app Jest snapshot testing for Allen Young\'s Stockmarket Demo admin account page', async () => {

  fetchAccessTokenValidity.mockImplementation((setLoginState, ignore) => {
    console.log('fetchAccessTokenValidity() mock called!');
    setLoginState(loginState);
  });
  fetchTotalNumberOfUsers.mockImplementation((setNumberOfUsers, ignore) => {
    console.log('fetchTotalNumberOfUsers() mock called!');
    setNumberOfUsers(0);
  });
  fetchTotalNumberOfTransactions.mockImplementation((setNumberOfTransactions, ignore) => {
    console.log('fetchTotalNumberOfTransactions() mock called!');
    setNumberOfTransactions(0);
  });
  fetchUserList.mockImplementation((pageNumber, setUserListPageData, ignore) => {
    console.log('fetchUserList() mock called!');
    setUserListPageData([]);
  });
  fetchTransactionHistory.mockImplementation((pageNumber, setTransactionListPageData, ignore) => {
    console.log('fetchTransactionHistory() mock called!');
    setTransactionListPageData([]);
  });

  /*************************************************************************************************
  No-login mock Jest snapshot test
  **************************************************************************************************/
  await adminAccountPageJestSnapshotTest('no-login');

  /*************************************************************************************************
  Non-admin-user-login mock Jest snapshot test
  **************************************************************************************************/
  await adminAccountPageJestSnapshotTest('non-admin-login');

  /*************************************************************************************************
  Admin-user-login mock Jest snapshot test
  **************************************************************************************************/
  await adminAccountPageJestSnapshotTest('admin-login');

  /*************************************************************************************************
  Fetch-error mock Jest snapshot test
  **************************************************************************************************/
  await adminAccountPageJestSnapshotTest('fetch-error');
});
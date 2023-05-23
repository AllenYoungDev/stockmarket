/**
 * @jest-environment jsdom
 */

//import React from "react";
//import ReactDOM from 'react-dom/client';

import renderer from 'react-test-renderer';
import {UserAccountPage, AdminLogout, AccountSettingsUpdateForm, CompanyStockTransactionHistory} from './account.js';

jest.mock('./utilities/fetchAccessTokenValidity');
jest.mock('./utilities/fetchNumberOfCompanySharesOwnedByUser');
jest.mock('./utilities/fetchNumberOfUserStockTransactions');
jest.mock('./utilities/fetchUserStockTransactionHistory');
jest.mock('./utilities/fetchUserAccountSettings');

import {fetchAccessTokenValidity} from './utilities/fetchAccessTokenValidity.js';
import {fetchNumberOfCompanySharesOwnedByUser} from './utilities/fetchNumberOfCompanySharesOwnedByUser.js';
import {fetchNumberOfUserStockTransactions} from './utilities/fetchNumberOfUserStockTransactions.js';
import {fetchUserStockTransactionHistory} from './utilities/fetchUserStockTransactionHistory.js';
import {fetchUserAccountSettings} from './utilities/fetchUserAccountSettings.js';

(async () => {
  if (typeof React === 'undefined') {
    globalThis.React = await import("react");
  }
  if (typeof ReactDOM === 'undefined') {
    globalThis.ReactDOM = await import("react-dom/client");
  }
})();

var loginState = '';

async function userAccountPageJestSnapshotTest(loginStateArg) {
  let testRenderer;
  let testInstance;
  let tree;

  loginState = loginStateArg;

  //renderer.create() is wrapped in renderer.act() for executing useEffect() calls in <HomePage />.
  //https://github.com/facebook/react/issues/15321
  await renderer.act(async () => {
    testRenderer = renderer.create(
      <UserAccountPage />,
    );
  });

  testInstance = testRenderer.root;
  expect(testInstance.findByType(AdminLogout).props.loginState).toBe(loginStateArg);
  expect(testInstance.findByType(AccountSettingsUpdateForm).props.loginState).toBe(loginStateArg);
  expect(testInstance.findByType(CompanyStockTransactionHistory).props.loginState).toBe(loginStateArg);

  tree = testRenderer.toJSON();
  expect(tree).toMatchSnapshot();
}

it('React app Jest snapshot testing for Allen Young\'s Stockmarket Demo user account page', async () => {
  const numberOfCompanySharesOwnedByUserSuccessResponse = {responseStatus: 200, responseBody: '1121'};
  const numberOfCompanySharesOwnedByUserFetchError = {responseStatus: -1, responseBody: ''};

  fetchAccessTokenValidity.mockImplementation((setLoginState, ignore) => {
    console.log('fetchAccessTokenValidity() mock called!');
    setLoginState(loginState);
  });
  fetchNumberOfCompanySharesOwnedByUser.mockImplementation((setResponseStatusBody, ignore) => {
    console.log('fetchNumberOfCompanySharesOwnedByUser() mock called!');
    setResponseStatusBody(numberOfCompanySharesOwnedByUserSuccessResponse);
  });
  fetchNumberOfUserStockTransactions.mockImplementation((setNumberOfUserStockTransactions, ignore) => {
    console.log('fetchNumberOfUserStockTransactions() mock called!');
    setNumberOfUserStockTransactions(0);
  });
  fetchUserStockTransactionHistory.mockImplementation((pageNumber, setUserStockTransactionHistory, ignore) => {
    console.log('fetchUserStockTransactionHistory() mock called!');
    setUserStockTransactionHistory([]);
  });
  fetchUserAccountSettings.mockImplementation((setUserAccountSettings, ignore) => {
    console.log('fetchUserAccountSettings() mock called!');
    setUserAccountSettings(null);
  });

  /*************************************************************************************************
  No-login mock Jest snapshot test
  **************************************************************************************************/
  await userAccountPageJestSnapshotTest('no-login');

  /*************************************************************************************************
  Non-admin-user-login mock Jest snapshot test
  **************************************************************************************************/
  await userAccountPageJestSnapshotTest('non-admin-login');

  /*************************************************************************************************
  Admin-user-login mock Jest snapshot test
  **************************************************************************************************/
  await userAccountPageJestSnapshotTest('admin-login');

  /*************************************************************************************************
  Fetch-error mock Jest snapshot test
  **************************************************************************************************/
  fetchNumberOfCompanySharesOwnedByUser.mockImplementation((setResponseStatusBody, ignore) => {
    console.log('fetchNumberOfCompanySharesOwnedByUser() mock called!');
    setResponseStatusBody(numberOfCompanySharesOwnedByUserFetchError);
  });

  await userAccountPageJestSnapshotTest('fetch-error');
});
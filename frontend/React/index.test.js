/**
 * @jest-environment jsdom
 */

//import React from "react";
//import ReactDOM from 'react-dom/client';

import renderer from 'react-test-renderer';
import {HomePage, RegisterLoginOrMyAccountAdminLogout, CompanyStockStats, LoginOrRegister, 
  NumberOfCompanySharesOwnedByUser, SharePurchaseForm} from './index.js';

jest.mock('./utilities/fetchAccessTokenValidity');
jest.mock('./utilities/fetchCompanyStockData');
jest.mock('./utilities/fetchNumberOfCompanySharesOwnedByUser');
jest.mock('./utilities/fetchLogout');

import {fetchAccessTokenValidity} from './utilities/fetchAccessTokenValidity.js';
import {fetchCompanyStockData} from './utilities/fetchCompanyStockData.js';
import {fetchNumberOfCompanySharesOwnedByUser} from './utilities/fetchNumberOfCompanySharesOwnedByUser.js';
import {fetchLogout} from './utilities/fetchLogout.js';

import {setTimeout} from "timers/promises";
const waitTimeoutInMilliseconds = 750;

(async () => {
  if (typeof React === 'undefined') {
    globalThis.React = await import("react");
  }
  if (typeof ReactDOM === 'undefined') {
    globalThis.ReactDOM = await import("react-dom/client");
  }
})();

var loginState = '';

async function homePageJestSnapshotTest(waitForCompanyStockStatsFetch, loginStateArg, stockDataServerResponseArg) {
  let testRenderer;
  let testInstance;
  let tree;

  loginState = loginStateArg;

  //renderer.create() is wrapped in renderer.act() for executing useEffect() calls in <HomePage />.
  //https://github.com/facebook/react/issues/15321
  await renderer.act(async () => {
    testRenderer = renderer.create(
      <HomePage />,
    );

    //Wait until the onTimeout() function gets executed in function HomePage() React element, 
    //So that fetchCompanyStockData() gets executed before proceeding with the test.
    if (waitForCompanyStockStatsFetch) {
      await setTimeout(waitTimeoutInMilliseconds);
    }
  });

  testInstance = testRenderer.root;
  expect(testInstance.findByType(RegisterLoginOrMyAccountAdminLogout).props.loginState).toBe(loginStateArg);
  expect(testInstance.findByType(CompanyStockStats).props.stockDataServerResponse).toStrictEqual(stockDataServerResponseArg);
  expect(testInstance.findByType(LoginOrRegister).props.loginState).toBe(loginStateArg);
  expect(testInstance.findByType(NumberOfCompanySharesOwnedByUser).props.stockDataServerResponse).toStrictEqual(stockDataServerResponseArg);
  expect(testInstance.findByType(SharePurchaseForm).props.loginState).toBe(loginStateArg);
  expect(testInstance.findByType(SharePurchaseForm).props.stockDataServerResponse).toStrictEqual(stockDataServerResponseArg);

  tree = testRenderer.toJSON();
  expect(tree).toMatchSnapshot();
}

it('React app Jest snapshot testing for Allen Young\'s Stockmarket Demo homepage', async () => {
  const emptyStockDataServerResponse = {responseType: '', stockData: {}};
  const fetchErrorStockDataServerResponse = {responseType: 'fetch-error', stockData: {}};
  const stockDataServerResponse = {responseType: 'success', stockData: [7000000.0,70000,24501,24501,3499,100.0,349900.0]};
  const responseStatusBody = {responseStatus: 200, responseBody: '1121'};

  fetchAccessTokenValidity.mockImplementation((setLoginState, ignore) => {
    console.log('fetchAccessTokenValidity() mock called!');
    setLoginState(loginState);
  });
  fetchCompanyStockData.mockImplementation((setStockDataServerResponse, ignore) => {
    console.log('fetchCompanyStockData() mock called!');
    setStockDataServerResponse(stockDataServerResponse);
  });
  fetchNumberOfCompanySharesOwnedByUser.mockImplementation((setResponseStatusBody, ignore) => {
    console.log('fetchNumberOfCompanySharesOwnedByUser() mock called!');
    setResponseStatusBody(responseStatusBody);
  });


  /*************************************************************************************************
  No-login mock Jest snapshot test, no waiting until fetchCompanyStockData() gets executed
  **************************************************************************************************/
  await homePageJestSnapshotTest(false, 'no-login', emptyStockDataServerResponse);

  /*************************************************************************************************
  No-login mock Jest snapshot test, waiting until fetchCompanyStockData() gets executed
  **************************************************************************************************/
  await homePageJestSnapshotTest(true, 'no-login', stockDataServerResponse);

  /*************************************************************************************************
  Non-admin-user-login mock Jest snapshot test
  **************************************************************************************************/
  await homePageJestSnapshotTest(true, 'non-admin-login', stockDataServerResponse);

  /*************************************************************************************************
  Admin-user-login mock Jest snapshot test
  **************************************************************************************************/
  await homePageJestSnapshotTest(true, 'admin-login', stockDataServerResponse);

  /*************************************************************************************************
  Fetch-error mock Jest snapshot test
  **************************************************************************************************/
  fetchCompanyStockData.mockImplementation((setStockDataServerResponse, ignore) => {
    console.log('fetchCompanyStockData() mock called!');
    setStockDataServerResponse(fetchErrorStockDataServerResponse);
  });

  await homePageJestSnapshotTest(true, 'fetch-error', fetchErrorStockDataServerResponse);
});
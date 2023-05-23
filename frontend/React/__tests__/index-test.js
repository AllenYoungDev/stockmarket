/**
 * @jest-environment jsdom
 */

/*
References
----------
https://jestjs.io/docs/tutorial-react#dom-testing
https://testing-library.com/docs/react-testing-library/intro/
https://testing-library.com/docs/react-testing-library/example-intro
https://testing-library.com/docs/user-event/intro#writing-tests-with-userevent
https://testing-library.com/docs/user-event/utility#type
https://testing-library.com/docs/user-event/convenience
https://testing-library.com/docs/user-event/convenience#clicks

How to get DOM element attributes and values for making assertions
------------------------------------------------------------------
let attributeValue = element.getAttribute(attributeName);
let inputValue = (document.getElementById(elementId)).value; //i.e. element.value

console.log(`htmlElement value:  ${htmlElement.value}.`);
console.log(`htmlElement.getAttribute('value'):  ${htmlElement.getAttribute('value')}.`);
console.log(`htmlElement.getAttribute('disabled'):  ${htmlElement.getAttribute('disabled')}.`);
console.log(`htmlElement.disabled:  ${htmlElement.disabled}.`);

htmlElement = screen.getByRole("error-notice");
console.log(`error-notice <p> element value:  ${htmlElement.value}`);
console.log(`error-notice <p> element getAttribute('innerText'):  ${htmlElement.getAttribute('innerText')}`); //returns null
console.log(`error-notice <p> element getAttribute('innerHTML'):  ${htmlElement.getAttribute('innerHTML')}`); //returns null
console.log(`error-notice <p> element htmlElement.innerText:  ${htmlElement.innerText}`);
console.log(`error-notice <p> element htmlElement.innerHTML:  ${htmlElement.innerHTML}`);  

//htmlElement = screen.getByRole('button', {value: {text: "Proceed to checkout"}})
  //Error.  "aria-valuetext" is not supported on role "button".
htmlElement = screen.getByText("Proceed to checkout");
*/

/*
FUTURE UPDATE
-------------
Use Mock Service Worker library to declaratively mock API communication in the Jest DOM unit and 
integration tests instead of stubbing fetch() wrapper functions, so that the fetch code gets tested.
*/

import {cleanup, fireEvent, render, screen, act, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import {HomePage} from '../index.js';

jest.mock('../utilities/fetchAccessTokenValidity');
jest.mock('../utilities/fetchCompanyStockData');
jest.mock('../utilities/fetchNumberOfCompanySharesOwnedByUser');
jest.mock('../utilities/fetchLogout');
jest.mock('../utilities/navigateToCheckout');

import {fetchAccessTokenValidity} from '../utilities/fetchAccessTokenValidity.js';
import {fetchCompanyStockData} from '../utilities/fetchCompanyStockData.js';
import {fetchNumberOfCompanySharesOwnedByUser} from '../utilities/fetchNumberOfCompanySharesOwnedByUser.js';
import {fetchLogout} from '../utilities/fetchLogout.js';
import {navigateToCheckout} from '../utilities/navigateToCheckout.js';

(async () => {
  if (typeof React === 'undefined') {
    globalThis.React = await import("react");
  }
  if (typeof ReactDOM === 'undefined') {
    globalThis.ReactDOM = await import("react-dom/client");
  }
})();

var loginState = '';

// Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
// unmount and cleanup DOM after the test is finished.
afterEach(cleanup);


it('React app Jest DOM unit and integration testing for Allen Young\'s Stockmarket Demo homepage', async () => {
  /*************************************************************************************************
  fetch() wrapper function mocking
  **************************************************************************************************/

  const emptyStockDataServerResponse = {responseType: '', stockData: {}};
  const fetchErrorStockDataServerResponse = {responseType: 'fetch-error', stockData: {}};
  const stockDataServerResponse = {responseType: 'success', stockData: [7000000.0,70000,24501,24501,3499,100.0,349900.0]};
  const responseStatusBody = {responseStatus: 200, responseBody: '1121'};

  loginState = 'non-admin-login';

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
  navigateToCheckout.mockImplementation((numberOfSharesToBuy) => {
    console.log('navigateToCheckout() mock called!');
  });  
  fetchLogout.mockImplementation((numberOfSharesToBuy) => {
    console.log('fetchLogout() mock called!');
  });


  /*************************************************************************************************
  Tests prep
  **************************************************************************************************/
  let htmlElement;

  const user = userEvent.setup();

  /*************************************************************************************************
  Number-of-Company-shares-to-buy input entering Jest DOM tests

  Proceed-to-checkout button click Jest DOM tests with button-click event handler function mocking 
  (mock only the fetch() call portion that should reside in a separate module for mocking)
  **************************************************************************************************/

  //
  //Test entering '-' in the number-of-Company-shares-to-buy input field
  //and clicking the proceed-to-checkout button
  //

  //Refer to https://github.com/testing-library/user-event/issues/565 to see why jest.useFakeTimers() and
  //jest.useRealTimers() are called below, instead of in beforeEach() and afterEach().  
  //userEvent.type() hangs when jest.useFakeTimers() is in effect.
  await act(async () => {
    await jest.useFakeTimers();
      // Fake timers using Jest
      //This is for calling onTimeout() immediately in the HomePage React element, without the wait.
    render(<HomePage />);
    //Running all pending timers and switching to real timers using Jest
    await jest.runOnlyPendingTimers();
    await jest.useRealTimers();
  });

  await waitFor(() => expect(screen.queryAllByText("Login")).toHaveLength(0));

  await waitFor(() => expect(screen.queryByLabelText('Number of Company shares to buy:')).not.toBeNull());

  htmlElement = screen.getByLabelText('Number of Company shares to buy:'); //getByLabelText() for finding form inputs
  await waitFor(() => expect(htmlElement.disabled).toBeFalsy());

  await user.type(htmlElement, '-'); //UI typing event simulation
  expect(htmlElement.value).toEqual('');


  //htmlElement = screen.getByRole("proceed-to-checkout-button");
  htmlElement = screen.getByRole("button", {name: "Proceed to checkout"});
  console.log(`"Proceed to checkout" htmlElement.value:  ${htmlElement.value}.`);
  await user.click(htmlElement);

  await waitFor(() => expect(screen.getByRole("error-notice").innerHTML).toBe(
    "Unable to proceed to checkout.  You need to enter a number of shares to buy.  Please correct and try again."));
  

  //
  //Test entering '1' in the number-of-Company-shares-to-buy input field
  //and clicking the proceed-to-checkout button
  //

  //the following cleanup and re-rendering is done, because React Testing Library keeps the
  //'-' typed into the input instead of discarding it.  (I.e. it doesn't do what it should.)
  cleanup();
  await act(async () => {
    await jest.useFakeTimers();
      // Fake timers using Jest
      //This is for calling onTimeout() immediately in the HomePage React element, without the wait.
    render(<HomePage />);
    //Running all pending timers and switching to real timers using Jest
    await jest.runOnlyPendingTimers();
    await jest.useRealTimers();
  });

  await waitFor(() => expect(screen.queryAllByText("Login")).toHaveLength(0));
  
  await waitFor(() => expect(screen.queryByLabelText('Number of Company shares to buy:')).not.toBeNull());

  htmlElement = screen.getByLabelText('Number of Company shares to buy:'); //getByLabelText() for finding form inputs
  await waitFor(() => expect(htmlElement.disabled).toBeFalsy());

  await user.type(htmlElement, '1'); //UI typing event simulation
  expect(htmlElement.value).toEqual('1');


  //htmlElement = screen.getByRole("proceed-to-checkout-button");
  htmlElement = screen.getByRole("button", {name: "Proceed to checkout"});
  await user.click(htmlElement);

  await waitFor(() => expect(screen.getByRole("error-notice").innerHTML).toBe(""));
  

  /*************************************************************************************************
  No-login Jest DOM test
  **************************************************************************************************/
  loginState = 'no-login';

  cleanup();
  await act(async () => {
    await jest.useFakeTimers();
      // Fake timers using Jest
      //This is for calling onTimeout() immediately in the HomePage React element, without the wait.
    render(<HomePage />);
    //Running all pending timers and switching to real timers using Jest
    await jest.runOnlyPendingTimers();
    await jest.useRealTimers();
  });

  await waitFor(() => expect(screen.queryAllByText("Login")).toHaveLength(2));
});
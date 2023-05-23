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

import {AdminAccountPage} from '../admin.js';

jest.mock('../utilities/fetchAccessTokenValidity');
jest.mock('../utilities/fetchTotalNumberOfUsers');
jest.mock('../utilities/fetchUserList');
jest.mock('../utilities/fetchTotalNumberOfTransactions');
jest.mock('../utilities/fetchTransactionHistory');

import {fetchAccessTokenValidity} from '../utilities/fetchAccessTokenValidity.js';
import {fetchTotalNumberOfUsers} from '../utilities/fetchTotalNumberOfUsers.js';
import {fetchUserList} from '../utilities/fetchUserList.js';
import {fetchTotalNumberOfTransactions} from '../utilities/fetchTotalNumberOfTransactions.js';
import {fetchTransactionHistory} from '../utilities/fetchTransactionHistory.js';

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


it('React app Jest DOM unit and integration testing for Allen Young\'s Stockmarket Demo AdminAccountPage', async () => {
  /*************************************************************************************************
  fetch() wrapper function mocking
  **************************************************************************************************/
  const userAccountSettings = { userFirstName: "Allen", userLastName: "Young", userEmailAddress: "AllenYoung@AllenYoung.dev", userPhoneNumber: "111-111-1111" };

  fetchAccessTokenValidity.mockImplementation((setLoginState, ignore) => {
    console.log('fetchAccessTokenValidity() mock called!');
    setLoginState(loginState);
  });
  fetchTotalNumberOfUsers.mockImplementation((setNumberOfUsers, ignore) => {
    console.log('fetchTotalNumberOfUsers() mock called!');
    setNumberOfUsers(100);
  });
  fetchUserList.mockImplementation((pageNumber, setUserListPageData, ignore) => {
    console.log('fetchUserList() mock called!');
    setUserListPageData([]);
  });
  fetchTotalNumberOfTransactions.mockImplementation((setNumberOfTransactions, ignore) => {
    console.log('fetchTotalNumberOfTransactions() mock called!');
    setNumberOfTransactions(100);
  });
  fetchTransactionHistory.mockImplementation((pageNumber, setTransactionListPageData, ignore) => {
    console.log('fetchTransactionHistory() mock called!');
    setTransactionListPageData([]);
  });



  /*************************************************************************************************
  Tests prep
  **************************************************************************************************/
  let htmlElementUserListPageNumberInput;
  let htmlElementUserListGoToButton;

  let htmlElementTransactionListPageNumberInput;
  let htmlElementTransactionListGoToButton;

  const user = userEvent.setup();


  /*************************************************************************************************
  No-login mock Jest DOM test (for input-control disablement check)
  **************************************************************************************************/
  loginState = 'no-login';

  await act(async () => {
    render(<AdminAccountPage />);
  });

  await waitFor(() => expect(screen.queryAllByLabelText('Page')).toHaveLength(2));
  await waitFor(() => expect(screen.getAllByRole("button", {name: "Go to"})).toHaveLength(2));
  

  htmlElementUserListPageNumberInput = screen.getAllByLabelText('Page')[0];
  htmlElementUserListGoToButton = screen.getAllByRole("button", {name: "Go to"})[0];

  expect(htmlElementUserListPageNumberInput.disabled).toBeTruthy();
  expect(htmlElementUserListGoToButton.disabled).toBeTruthy();

  expect(htmlElementUserListPageNumberInput.value).toBe('');


  htmlElementTransactionListPageNumberInput = screen.getAllByLabelText('Page')[1];
  htmlElementTransactionListGoToButton = screen.getAllByRole("button", {name: "Go to"})[1];

  expect(htmlElementTransactionListPageNumberInput.disabled).toBeTruthy();
  expect(htmlElementTransactionListGoToButton.disabled).toBeTruthy();

  expect(htmlElementTransactionListPageNumberInput.value).toBe('');


  /*************************************************************************************************
  Non-admin-user-login mock Jest DOM test (for input-control disablement check)
  **************************************************************************************************/
  loginState = 'non-admin-login';

  cleanup();
  await act(async () => {
    render(<AdminAccountPage />);
  });

  await waitFor(() => expect(screen.queryAllByLabelText('Page')).toHaveLength(2));
  await waitFor(() => expect(screen.getAllByRole("button", {name: "Go to"})).toHaveLength(2));
  

  htmlElementUserListPageNumberInput = screen.getAllByLabelText('Page')[0];
  htmlElementUserListGoToButton = screen.getAllByRole("button", {name: "Go to"})[0];

  expect(htmlElementUserListPageNumberInput.disabled).toBeTruthy();
  expect(htmlElementUserListGoToButton.disabled).toBeTruthy();

  expect(htmlElementUserListPageNumberInput.value).toBe('');


  htmlElementTransactionListPageNumberInput = screen.getAllByLabelText('Page')[1];
  htmlElementTransactionListGoToButton = screen.getAllByRole("button", {name: "Go to"})[1];

  expect(htmlElementTransactionListPageNumberInput.disabled).toBeTruthy();
  expect(htmlElementTransactionListGoToButton.disabled).toBeTruthy();

  expect(htmlElementTransactionListPageNumberInput.value).toBe('');


  /*************************************************************************************************
  Admin-user-login mock Jest DOM test (for input-control enablement check)
  **************************************************************************************************/
  loginState = 'admin-login';

  cleanup();
  await act(async () => {
    render(<AdminAccountPage />);
  });

  await waitFor(() => expect(screen.queryAllByLabelText('Page')).toHaveLength(2));
  await waitFor(() => expect(screen.getAllByRole("button", {name: "Go to"})).toHaveLength(2));
  

  htmlElementUserListPageNumberInput = screen.getAllByLabelText('Page')[0];
  htmlElementUserListGoToButton = screen.getAllByRole("button", {name: "Go to"})[0];

  expect(htmlElementUserListPageNumberInput.disabled).toBeFalsy();
  expect(htmlElementUserListGoToButton.disabled).toBeFalsy();

  expect(htmlElementUserListPageNumberInput.value).toBe('');


  htmlElementTransactionListPageNumberInput = screen.getAllByLabelText('Page')[1];
  htmlElementTransactionListGoToButton = screen.getAllByRole("button", {name: "Go to"})[1];

  expect(htmlElementTransactionListPageNumberInput.disabled).toBeFalsy();
  expect(htmlElementTransactionListGoToButton.disabled).toBeFalsy();

  expect(htmlElementTransactionListPageNumberInput.value).toBe('');

  
  /*************************************************************************************************
  User-list-section page number entering Jest DOM test
  **************************************************************************************************/
  await user.type(htmlElementUserListPageNumberInput, '-'); //UI typing event simulation
  expect(htmlElementUserListPageNumberInput.value).toEqual('');

  await act(async () => {
    htmlElementUserListPageNumberInput.value = "";  //Set the email address input field to blank
  });

  await user.type(htmlElementUserListPageNumberInput, '2'); //UI typing event simulation
  expect(htmlElementUserListPageNumberInput.value).toEqual('2');

  /*************************************************************************************************
  User-list-section page go-to button click Jest DOM test 
  (with fetch() wrapper function mock for returning mock data, and mock data display validation)
  **************************************************************************************************/
  cleanup();
  await act(async () => {
    render(<AdminAccountPage />);
  });

  await waitFor(() => expect(screen.queryAllByLabelText('Page')).toHaveLength(2));
  await waitFor(() => expect(screen.getAllByRole("button", {name: "Go to"})).toHaveLength(2));

  htmlElementUserListPageNumberInput = screen.getAllByLabelText('Page')[0];
  htmlElementUserListGoToButton = screen.getAllByRole("button", {name: "Go to"})[0];

  await user.type(htmlElementUserListPageNumberInput, '2'); //UI typing event simulation
  expect(htmlElementUserListPageNumberInput.value).toEqual('2');

  await user.click(htmlElementUserListGoToButton);


  /*************************************************************************************************
  User-list-section page navigation-link click Jest DOM test 
  (with fetch() wrapper function mock for returning mock data, and mock data display validation)
  **************************************************************************************************/
  //I'm not doing this now.  Maybe I'll do it in the future with the backend mocking.
  //It doesn't make sense to do this without the backend mocking.


  /*************************************************************************************************
  Transactions-list-section page number entering Jest DOM test
  **************************************************************************************************/
  cleanup();
  await act(async () => {
    render(<AdminAccountPage />);
  });

  await waitFor(() => expect(screen.queryAllByLabelText('Page')).toHaveLength(2));
  await waitFor(() => expect(screen.getAllByRole("button", {name: "Go to"})).toHaveLength(2));

  htmlElementTransactionListPageNumberInput = screen.getAllByLabelText('Page')[1];
  htmlElementTransactionListGoToButton = screen.getAllByRole("button", {name: "Go to"})[1];

  await user.type(htmlElementTransactionListPageNumberInput, '-'); //UI typing event simulation
  expect(htmlElementTransactionListPageNumberInput.value).toEqual('');

  await act(async () => {
    htmlElementTransactionListPageNumberInput.value = "";  //Set the email address input field to blank
  });

  await user.type(htmlElementTransactionListPageNumberInput, '2'); //UI typing event simulation
  expect(htmlElementTransactionListPageNumberInput.value).toEqual('2');

  /*************************************************************************************************
  Transactions-list-section page go-to button click Jest DOM test 
  (with fetch() wrapper function mock for returning mock data, and mock data display validation)
  **************************************************************************************************/
  cleanup();
  await act(async () => {
    render(<AdminAccountPage />);
  });

  await waitFor(() => expect(screen.queryAllByLabelText('Page')).toHaveLength(2));
  await waitFor(() => expect(screen.getAllByRole("button", {name: "Go to"})).toHaveLength(2));

  htmlElementTransactionListPageNumberInput = screen.getAllByLabelText('Page')[1];
  htmlElementTransactionListGoToButton = screen.getAllByRole("button", {name: "Go to"})[1];

  await user.type(htmlElementTransactionListPageNumberInput, '2'); //UI typing event simulation
  expect(htmlElementTransactionListPageNumberInput.value).toEqual('2');

  await user.click(htmlElementTransactionListGoToButton);


  /*************************************************************************************************
  Transactions-list-section page navigation-link click Jest DOM test 
  (with fetch() wrapper function mock for returning mock data, and mock data display validation)
  **************************************************************************************************/
  //I'm not doing this now.  Maybe I'll do it in the future with the backend mocking.
  //It doesn't make sense to do this without the backend mocking.

});
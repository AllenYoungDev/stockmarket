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

import {UserAccountPage} from '../account.js';

jest.mock('../utilities/fetchAccessTokenValidity');
jest.mock('../utilities/fetchNumberOfCompanySharesOwnedByUser');
jest.mock('../utilities/fetchUpdateUserAccountSettings');
jest.mock('../utilities/fetchNumberOfUserStockTransactions');
jest.mock('../utilities/fetchUserStockTransactionHistory');
jest.mock('../utilities/useUserAccountSettings');

import {fetchAccessTokenValidity} from '../utilities/fetchAccessTokenValidity.js';
import {fetchNumberOfCompanySharesOwnedByUser} from '../utilities/fetchNumberOfCompanySharesOwnedByUser.js';
import {fetchUpdateUserAccountSettings} from '../utilities/fetchUpdateUserAccountSettings.js';
import {fetchNumberOfUserStockTransactions} from '../utilities/fetchNumberOfUserStockTransactions.js';
import {fetchUserStockTransactionHistory} from '../utilities/fetchUserStockTransactionHistory.js';
import {useUserAccountSettings} from '../utilities/useUserAccountSettings.js';

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


it('React app Jest DOM unit and integration testing for Allen Young\'s Stockmarket Demo UserAccountPage', async () => {
  /*************************************************************************************************
  fetch() wrapper function mocking
  **************************************************************************************************/
  const userAccountSettings = { userFirstName: "Allen", userLastName: "Young", userEmailAddress: "AllenYoung@AllenYoung.dev", userPhoneNumber: "111-111-1111" };

  fetchAccessTokenValidity.mockImplementation((setLoginState, ignore) => {
    console.log('fetchAccessTokenValidity() mock called!');
    setLoginState(loginState);
  });
  fetchNumberOfCompanySharesOwnedByUser.mockImplementation((setResponseStatusBody, ignore) => {
    console.log('fetchNumberOfCompanySharesOwnedByUser() mock called!');
    setResponseStatusBody({responseStatus: 200, responseBody: "1"});
  });
  fetchUpdateUserAccountSettings.mockImplementation((firstName, lastName, emailAddress, phoneNumber, password, errorNoticeRef) => {
    console.log('fetchUpdateUserAccountSettings() mock called!');
    errorNoticeRef.current.innerHTML = `Update success!`;
  });
  fetchNumberOfUserStockTransactions.mockImplementation((setNumberOfUserStockTransactions, ignore) => {
    console.log('fetchNumberOfUserStockTransactions() mock called!');
    setNumberOfUserStockTransactions(0);
  });
  fetchUserStockTransactionHistory.mockImplementation((pageNumber, setUserStockTransactionHistory, ignore) => {
    console.log('fetchUserStockTransactionHistory() mock called!');
    setUserStockTransactionHistory([]);
  });
  useUserAccountSettings.mockImplementation(() => {
    console.log('useUserAccountSettings() mock called!');
    return null;
  });


  /*************************************************************************************************
  Tests prep
  **************************************************************************************************/
  let htmlElementFirstNameInput;
  let htmlElementLastNameInput;
  let htmlElementEmailAddressInput;
  let htmlElementPhoneNumberInput;
  let htmlElementPasswordInput;
  let htmlElementPasswordRetypeInput;
  let htmlElementPasswordShowHide;

  let htmlElementUpdateButton;

  let htmlElementTransactionHistoryPageNumberInput;
  let htmlElementGoToButton;

  let htmlElementErrorNotice;

  const user = userEvent.setup();

  /*************************************************************************************************
  No-login mock Jest DOM test (for input-control disablement check)
  **************************************************************************************************/
  loginState = 'no-login';

  await act(async () => {
    render(<UserAccountPage />);
  });

  await waitFor(() => expect(screen.queryByLabelText('First name')).not.toBeNull());

  htmlElementFirstNameInput = screen.getByLabelText('First name');
  htmlElementLastNameInput = screen.getByLabelText('Last name');
  htmlElementEmailAddressInput = screen.getByLabelText('Email address');
  htmlElementPhoneNumberInput = screen.getByLabelText('Phone number');
  htmlElementPasswordInput = screen.getByLabelText('Password');
  htmlElementPasswordRetypeInput = screen.getByLabelText('Password (Retype)');

  htmlElementUpdateButton = screen.getByRole("button", {name: "Update"});

  htmlElementTransactionHistoryPageNumberInput = screen.getByLabelText('Page');
  htmlElementGoToButton = screen.getByRole("button", {name: "Go to"});

  htmlElementErrorNotice = screen.getByRole("error-notice");

  expect(htmlElementFirstNameInput.disabled).toBeTruthy();
  expect(htmlElementLastNameInput.disabled).toBeTruthy();
  expect(htmlElementEmailAddressInput.disabled).toBeTruthy();
  expect(htmlElementPhoneNumberInput.disabled).toBeTruthy();
  expect(htmlElementPasswordInput.disabled).toBeTruthy();
  expect(htmlElementPasswordRetypeInput.disabled).toBeTruthy();

  expect(htmlElementUpdateButton.disabled).toBeTruthy();

  expect(htmlElementTransactionHistoryPageNumberInput.disabled).toBeTruthy();
  expect(htmlElementGoToButton.disabled).toBeTruthy();

  expect(htmlElementFirstNameInput.value).toBe('');
  expect(htmlElementLastNameInput.value).toBe('');
  expect(htmlElementEmailAddressInput.value).toBe('');
  expect(htmlElementPhoneNumberInput.value).toBe('');
  expect(htmlElementPasswordInput.value).toBe('');
  expect(htmlElementPasswordRetypeInput.value).toBe('');

  expect(htmlElementTransactionHistoryPageNumberInput.value).toBe('');

  expect(screen.getByRole("error-notice").innerHTML).toBe("");


  /*************************************************************************************************
  Admin-user-login mock Jest DOM test (for input-control disablement check)
  **************************************************************************************************/
  loginState = 'admin-login';

  useUserAccountSettings.mockImplementation(() => {
    console.log('useUserAccountSettings() mock called!');
    return userAccountSettings;
  });

  cleanup();
  await act(async () => {
    render(<UserAccountPage />);
  });

  await waitFor(() => expect(screen.queryByLabelText('First name')).not.toBeNull());

  htmlElementFirstNameInput = screen.getByLabelText('First name');
  htmlElementLastNameInput = screen.getByLabelText('Last name');
  htmlElementEmailAddressInput = screen.getByLabelText('Email address');
  htmlElementPhoneNumberInput = screen.getByLabelText('Phone number');
  htmlElementPasswordInput = screen.getByLabelText('Password');
  htmlElementPasswordRetypeInput = screen.getByLabelText('Password (Retype)');

  htmlElementUpdateButton = screen.getByRole("button", {name: "Update"});

  htmlElementTransactionHistoryPageNumberInput = screen.getByLabelText('Page');
  htmlElementGoToButton = screen.getByRole("button", {name: "Go to"});

  htmlElementErrorNotice = screen.getByRole("error-notice");

  expect(htmlElementFirstNameInput.disabled).toBeFalsy();
  expect(htmlElementLastNameInput.disabled).toBeFalsy();
  expect(htmlElementEmailAddressInput.disabled).toBeFalsy();
  expect(htmlElementPhoneNumberInput.disabled).toBeFalsy();
  expect(htmlElementPasswordInput.disabled).toBeFalsy();
  expect(htmlElementPasswordRetypeInput.disabled).toBeFalsy();

  expect(htmlElementUpdateButton.disabled).toBeFalsy();

  expect(htmlElementTransactionHistoryPageNumberInput.disabled).toBeTruthy();
  expect(htmlElementGoToButton.disabled).toBeTruthy();

  expect(htmlElementFirstNameInput.value).toBe('Allen');
  expect(htmlElementLastNameInput.value).toBe('Young');
  expect(htmlElementEmailAddressInput.value).toBe('AllenYoung@AllenYoung.dev');
  expect(htmlElementPhoneNumberInput.value).toBe('111-111-1111');
  expect(htmlElementPasswordInput.value).toBe('');
  expect(htmlElementPasswordRetypeInput.value).toBe('');

  expect(htmlElementTransactionHistoryPageNumberInput.value).toBe('');

  expect(screen.getByRole("error-notice").innerHTML).toBe("");


  /*************************************************************************************************
  Non-admin-user-login mock Jest DOM test (for input-control enablement check)
  **************************************************************************************************/
  loginState = 'non-admin-login';

  cleanup();
  await act(async () => {
    render(<UserAccountPage />);
  });

  await waitFor(() => expect(screen.queryByLabelText('First name')).not.toBeNull());

  htmlElementFirstNameInput = screen.getByLabelText('First name');
  htmlElementLastNameInput = screen.getByLabelText('Last name');
  htmlElementEmailAddressInput = screen.getByLabelText('Email address');
  htmlElementPhoneNumberInput = screen.getByLabelText('Phone number');
  htmlElementPasswordInput = screen.getByLabelText('Password');
  htmlElementPasswordRetypeInput = screen.getByLabelText('Password (Retype)');

  htmlElementUpdateButton = screen.getByRole("button", {name: "Update"});

  htmlElementTransactionHistoryPageNumberInput = screen.getByLabelText('Page');
  htmlElementGoToButton = screen.getByRole("button", {name: "Go to"});

  htmlElementErrorNotice = screen.getByRole("error-notice");

  expect(htmlElementFirstNameInput.disabled).toBeFalsy();
  expect(htmlElementLastNameInput.disabled).toBeFalsy();
  expect(htmlElementEmailAddressInput.disabled).toBeFalsy();
  expect(htmlElementPhoneNumberInput.disabled).toBeFalsy();
  expect(htmlElementPasswordInput.disabled).toBeFalsy();
  expect(htmlElementPasswordRetypeInput.disabled).toBeFalsy();

  expect(htmlElementUpdateButton.disabled).toBeFalsy();

  expect(htmlElementTransactionHistoryPageNumberInput.disabled).toBeFalsy();
  expect(htmlElementGoToButton.disabled).toBeFalsy();

  expect(htmlElementFirstNameInput.value).toBe('Allen');
  expect(htmlElementLastNameInput.value).toBe('Young');
  expect(htmlElementEmailAddressInput.value).toBe('AllenYoung@AllenYoung.dev');
  expect(htmlElementPhoneNumberInput.value).toBe('111-111-1111');
  expect(htmlElementPasswordInput.value).toBe('');
  expect(htmlElementPasswordRetypeInput.value).toBe('');

  expect(htmlElementTransactionHistoryPageNumberInput.value).toBe('');

  expect(screen.getByRole("error-notice").innerHTML).toBe("");


  /*************************************************************************************************
  Password show/hide text click Jest DOM test
  **************************************************************************************************/
  htmlElementPasswordShowHide = screen.getByRole("password-show-hide");

  expect(htmlElementPasswordInput.type).toBe("password");
  expect(htmlElementPasswordShowHide.innerHTML).toBe("show");

  await user.click(htmlElementPasswordShowHide);

  expect(htmlElementPasswordInput.type).toBe("text");
  expect(htmlElementPasswordShowHide.innerHTML).toBe("hide");

  await user.click(htmlElementPasswordShowHide);

  expect(htmlElementPasswordInput.type).toBe("password");
  expect(htmlElementPasswordShowHide.innerHTML).toBe("show");

  /*************************************************************************************************
  Update button click Jest DOM tests with button-click event handler function mocking 
  (mock only the fetch() call portion that should reside in a separate module for mocking)  
  (email and password input format validity check.)
  **************************************************************************************************/

  //Invalid email address test
  await act(async () => {
    htmlElementEmailAddressInput.value = "";  //Set the email address input field to blank
  });

  await user.type(htmlElementEmailAddressInput, 'AllenYoung@'); //UI typing event simulation
  expect(htmlElementEmailAddressInput.value).toEqual('AllenYoung@');

  await user.click(htmlElementUpdateButton);
  expect(screen.getByRole("error-notice").innerHTML).toBe("Unable to update.  You've entered an invalid email address.  Please correct and try again.");


  //Password and password-retype mismatch test
  await act(async () => {
    htmlElementEmailAddressInput.value = "";  //Set the email address input field to blank
  });

  await user.type(htmlElementPasswordInput, '1234'); //UI typing event simulation
  expect(htmlElementPasswordInput.value).toEqual('1234');

  await user.click(htmlElementUpdateButton);
  expect(screen.getByRole("error-notice").innerHTML).toBe("Unable to update.  Password and password retype do not match.  Please correct and try again.");


  //Incorrect password format test
  await user.type(htmlElementPasswordRetypeInput, '1234'); //UI typing event simulation
  expect(htmlElementPasswordRetypeInput.value).toEqual('1234');

  await user.click(htmlElementUpdateButton);
  expect(screen.getByRole("error-notice").innerHTML).toBe("Unable to update.  Password does not meet the requirement.  Please correct and try again.");
  

  //Successful login submission test
  await act(async () => {
    htmlElementPasswordInput.value = "";  //Set the password input field to blank
    htmlElementPasswordRetypeInput.value = "";  //Set the password-retype input field to blank
    screen.getByRole("error-notice").innerHTML = "";
  });

  await user.type(htmlElementPasswordInput, '12345abcde!'); //UI typing event simulation
  expect(htmlElementPasswordInput.value).toEqual('12345abcde!');

  await user.type(htmlElementPasswordRetypeInput, '12345abcde!'); //UI typing event simulation
  expect(htmlElementPasswordRetypeInput.value).toEqual('12345abcde!');


  await user.click(htmlElementUpdateButton);
  expect(screen.getByRole("error-notice").innerHTML).toBe("Update success!");


  /*************************************************************************************************
  User-transactions-list-section page number entering Jest DOM test
  **************************************************************************************************/
  await user.type(htmlElementTransactionHistoryPageNumberInput, '-'); //UI typing event simulation
  expect(htmlElementTransactionHistoryPageNumberInput.value).toEqual('');

  /*************************************************************************************************
  User-transactions-list-section page go-to button click Jest DOM test 
  (with fetch() wrapper function mock for returning mock data, and mock data display validation)
  **************************************************************************************************/
  await act(async () => {
    htmlElementTransactionHistoryPageNumberInput.value = "";  //Set the email address input field to blank
  });

  await user.type(htmlElementTransactionHistoryPageNumberInput, '2'); //UI typing event simulation
  expect(htmlElementTransactionHistoryPageNumberInput.value).toEqual('');


  fetchNumberOfUserStockTransactions.mockImplementation((setNumberOfUserStockTransactions, ignore) => {
    console.log('fetchNumberOfUserStockTransactions() mock called!');
    setNumberOfUserStockTransactions(100);
  });

  cleanup();
  await act(async () => {
    render(<UserAccountPage />);
  });

  await waitFor(() => expect(screen.queryByLabelText('First name')).not.toBeNull());

  htmlElementTransactionHistoryPageNumberInput = screen.getByLabelText('Page');
  htmlElementGoToButton = screen.getByRole("button", {name: "Go to"});

  await user.type(htmlElementTransactionHistoryPageNumberInput, '2'); //UI typing event simulation
  expect(htmlElementTransactionHistoryPageNumberInput.value).toEqual('2');

  await user.click(htmlElementGoToButton);

  /*************************************************************************************************
  User-transactions-list-section page navigation-link click Jest DOM test 
  (with fetch() wrapper function mock for returning mock data, and mock data display validation)
  **************************************************************************************************/
  //I'm not doing this now.  Maybe I'll do it in the future with the backend mocking.
  //It doesn't make sense to do this without the backend mocking.

});
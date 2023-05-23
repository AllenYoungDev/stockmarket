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

import {UserRegistrationPage} from '../registration.js';

jest.mock('../utilities/fetchAccessTokenValidity');
jest.mock('../utilities/fetchRegisterUser');

import {fetchAccessTokenValidity} from '../utilities/fetchAccessTokenValidity.js';
import {fetchRegisterUser} from '../utilities/fetchRegisterUser.js';

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


it('React app Jest DOM unit and integration testing for Allen Young\'s Stockmarket Demo UserRegistrationPage', async () => {
  /*************************************************************************************************
  fetch() wrapper function mocking
  **************************************************************************************************/

  fetchAccessTokenValidity.mockImplementation((setLoginState, ignore) => {
    console.log('fetchAccessTokenValidity() mock called!');
    setLoginState(loginState);
  });
  fetchRegisterUser.mockImplementation((firstName, lastName, emailAddress, phoneNumber, password, errorNoticeDomNodeRef) => {
    console.log('fetchRegisterUser() mock called!');
  });


  /*************************************************************************************************
  Tests prep
  **************************************************************************************************/
  let htmlElement;

  let htmlElementFirstNameInput;
  let htmlElementLastNameInput;
  let htmlElementEmailAddressInput;
  let htmlElementPhoneNumberInput;
  let htmlElementPasswordInput;
  let htmlElementPasswordRetypeInput;
  let htmlElementPasswordShowHide;

  let htmlElementRegisterButton;

  let htmlElementErrorNotice;

  const user = userEvent.setup();

  /*************************************************************************************************
  No-login Jest DOM test
  **************************************************************************************************/
  loginState = 'non-admin-login';

  await act(async () => {
    render(<UserRegistrationPage />);
  });

  await waitFor(() => expect(screen.queryByLabelText('First name')).not.toBeNull());

  expect(screen.queryByLabelText('First name').disabled).toBeTruthy();
  expect(screen.queryByLabelText('Last name').disabled).toBeTruthy();
  expect(screen.queryByLabelText('Email address').disabled).toBeTruthy();
  expect(screen.queryByLabelText('Phone number').disabled).toBeTruthy();
  expect(screen.queryByLabelText('Password').disabled).toBeTruthy();
  expect(screen.queryByLabelText('Password (Retype)').disabled).toBeTruthy();

  expect(screen.getByRole("button", {name: "Register"}).disabled).toBeTruthy();


  /*************************************************************************************************
  Password show/hide text click Jest DOM test
  **************************************************************************************************/
  loginState = 'no-login';

  cleanup();
  await act(async () => {
    render(<UserRegistrationPage />);
  });

  await waitFor(() => expect(screen.queryByLabelText('First name')).not.toBeNull());

  expect(screen.queryByLabelText('First name').disabled).toBeFalsy();
  expect(screen.queryByLabelText('Last name').disabled).toBeFalsy();
  expect(screen.queryByLabelText('Email address').disabled).toBeFalsy();
  expect(screen.queryByLabelText('Phone number').disabled).toBeFalsy();
  expect(screen.queryByLabelText('Password').disabled).toBeFalsy();
  expect(screen.queryByLabelText('Password (Retype)').disabled).toBeFalsy();

  expect(screen.getByRole("button", {name: "Register"}).disabled).toBeFalsy();


  htmlElementPasswordInput = screen.queryByLabelText('Password');
  htmlElementPasswordRetypeInput = screen.queryByLabelText('Password (Retype)');
  htmlElementPasswordShowHide = screen.getByRole("password-show-hide");

  expect(htmlElementPasswordInput.type).toBe("password");
  expect(htmlElementPasswordRetypeInput.type).toBe("password");
  expect(htmlElementPasswordShowHide.innerHTML).toBe("show");

  await user.click(htmlElementPasswordShowHide);

  expect(htmlElementPasswordInput.type).toBe("text");
  expect(htmlElementPasswordRetypeInput.type).toBe("text");
  expect(htmlElementPasswordShowHide.innerHTML).toBe("hide");

  await user.click(htmlElementPasswordShowHide);

  expect(htmlElementPasswordInput.type).toBe("password");
  expect(htmlElementPasswordRetypeInput.type).toBe("password");
  expect(htmlElementPasswordShowHide.innerHTML).toBe("show");


  /*************************************************************************************************
  Register button click Jest DOM tests with button-click event handler function mocking 
  (mock only the fetch() call portion that should reside in a separate module for mocking) 
  (registration input validation Jest DOM tests)
  **************************************************************************************************/

  cleanup();
  await act(async () => {
    render(<UserRegistrationPage />);
  });

  await waitFor(() => expect(screen.queryByLabelText('First name')).not.toBeNull());

  htmlElementFirstNameInput = screen.getByLabelText('First name');
  htmlElementLastNameInput = screen.getByLabelText('Last name');
  htmlElementEmailAddressInput = screen.getByLabelText('Email address');
  htmlElementPhoneNumberInput = screen.getByLabelText('Phone number');
  htmlElementPasswordInput = screen.getByLabelText('Password');
  htmlElementPasswordRetypeInput = screen.getByLabelText('Password (Retype)');

  htmlElementRegisterButton = screen.getByRole("button", {name: "Register"});

  htmlElementErrorNotice = screen.getByRole("error-notice");

  expect(htmlElementFirstNameInput.disabled).toBeFalsy();
  expect(htmlElementLastNameInput.disabled).toBeFalsy();
  expect(htmlElementEmailAddressInput.disabled).toBeFalsy();
  expect(htmlElementPhoneNumberInput.disabled).toBeFalsy();
  expect(htmlElementPasswordInput.disabled).toBeFalsy();
  expect(htmlElementPasswordRetypeInput.disabled).toBeFalsy();

  expect(htmlElementRegisterButton.disabled).toBeFalsy();

  expect(screen.getByRole("error-notice").innerHTML).toBe("");


  //Missing first name test
  await user.click(htmlElementRegisterButton);
  expect(screen.getByRole("error-notice").innerHTML).toBe("Unable to register.  You need to enter your first name.  Please correct and try again.");


  //Missing last name test
  await user.type(htmlElementFirstNameInput, 'Allen'); //UI typing event simulation
  expect(htmlElementFirstNameInput.value).toEqual('Allen');

  await user.click(htmlElementRegisterButton);
  expect(screen.getByRole("error-notice").innerHTML).toBe("Unable to register.  You need to enter your last name.  Please correct and try again.");


  //Missing email address test
  await user.type(htmlElementLastNameInput, 'Young'); //UI typing event simulation
  expect(htmlElementLastNameInput.value).toEqual('Young');

  await user.click(htmlElementRegisterButton);
  expect(screen.getByRole("error-notice").innerHTML).toBe("Unable to register.  You've entered an invalid email address.  Please correct and try again.");


  //Invalid email address test
  await user.type(htmlElementEmailAddressInput, 'AllenYoung@'); //UI typing event simulation
  expect(htmlElementEmailAddressInput.value).toEqual('AllenYoung@');

  await user.click(htmlElementRegisterButton);
  expect(screen.getByRole("error-notice").innerHTML).toBe("Unable to register.  You've entered an invalid email address.  Please correct and try again.");


  //Missing phone number test
  await act(async () => {
    htmlElementEmailAddressInput.value = "";  //Set the email address input field to blank
  });

  await user.type(htmlElementEmailAddressInput, 'AllenYoung@allenyoung.dev'); //UI typing event simulation
  expect(htmlElementEmailAddressInput.value).toEqual('AllenYoung@allenyoung.dev');

  await user.click(htmlElementRegisterButton);
  expect(screen.getByRole("error-notice").innerHTML).toBe("Unable to register.  You need to enter your phone number.  Please correct and try again.");


  //Missing password test
  await user.type(htmlElementPhoneNumberInput, '111-111-1111'); //UI typing event simulation
  expect(htmlElementPhoneNumberInput.value).toEqual('111-111-1111');

  await user.click(htmlElementRegisterButton);
  expect(screen.getByRole("error-notice").innerHTML).toBe("Unable to register.  You need to enter password.  Please correct and try again.");


  //Missing password retype test
  await user.type(htmlElementPasswordInput, '1234'); //UI typing event simulation
  expect(htmlElementPasswordInput.value).toEqual('1234');

  await user.click(htmlElementRegisterButton);
  expect(screen.getByRole("error-notice").innerHTML).toBe("Unable to register.  You need to enter password (retype).  Please correct and try again.");


  //Incorrect password format test
  await user.type(htmlElementPasswordRetypeInput, '1234'); //UI typing event simulation
  expect(htmlElementPasswordRetypeInput.value).toEqual('1234');

  await user.click(htmlElementRegisterButton);
  expect(screen.getByRole("error-notice").innerHTML).toBe("Unable to register.  Password does not meet the requirement.  Please correct and try again.");
  

  //Password retype mismatch test
  await act(async () => {
    htmlElementPasswordInput.value = "";  //Set the password input field to blank
  });

  await user.type(htmlElementPasswordInput, '12345abcde!'); //UI typing event simulation
  expect(htmlElementPasswordInput.value).toEqual('12345abcde!');


  await user.click(htmlElementRegisterButton);
  expect(screen.getByRole("error-notice").innerHTML).toBe("Unable to register.  Password and password retype do not match.  Please correct and try again.");
  

  //Successful registration submission test
  await act(async () => {
    htmlElementPasswordRetypeInput.value = "";  //Set the password retype input field to blank
    screen.getByRole("error-notice").innerHTML = "";
  });

  await user.type(htmlElementPasswordRetypeInput, '12345abcde!'); //UI typing event simulation
  expect(htmlElementPasswordRetypeInput.value).toEqual('12345abcde!');


  await user.click(htmlElementRegisterButton);
  expect(screen.getByRole("error-notice").innerHTML).toBe("");
});
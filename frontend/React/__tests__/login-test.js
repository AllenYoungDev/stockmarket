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

import {LoginPage} from '../login.js';

jest.mock('../utilities/fetchAccessTokenValidity');
jest.mock('../utilities/fetchLogin');

import {fetchAccessTokenValidity} from '../utilities/fetchAccessTokenValidity.js';
import {fetchLogin} from '../utilities/fetchLogin.js';

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


it('React app Jest DOM unit and integration testing for Allen Young\'s Stockmarket Demo LoginPage', async () => {
  /*************************************************************************************************
  fetch() wrapper function mocking
  **************************************************************************************************/

  fetchAccessTokenValidity.mockImplementation((setLoginState, ignore) => {
    console.log('fetchAccessTokenValidity() mock called!');
    setLoginState(loginState);
  });
  fetchLogin.mockImplementation((emailAddress, password, errorNoticeDomNodeRef) => {
    console.log('fetchLogin() mock called!');
  });


  /*************************************************************************************************
  Tests prep
  **************************************************************************************************/
  let htmlElement;

  let htmlElementEmailAddressInput;
  let htmlElementPasswordInput;
  let htmlElementPasswordShowHide;

  let htmlElementLoginButton;

  let htmlElementErrorNotice;

  const user = userEvent.setup();

  /*************************************************************************************************
  Non-admin-user-login mock Jest DOM test (for input-control disablement check)
  **************************************************************************************************/
  loginState = 'non-admin-login';

  await act(async () => {
    render(<LoginPage />);
  });

  await waitFor(() => expect(screen.queryByLabelText('Email address')).not.toBeNull());

  htmlElementEmailAddressInput = screen.getByLabelText('Email address');
  htmlElementPasswordInput = screen.getByLabelText('Password');

  htmlElementLoginButton = screen.getByRole("button", {name: "Login"});

  htmlElementErrorNotice = screen.getByRole("error-notice");

  expect(htmlElementEmailAddressInput.disabled).toBeTruthy();
  expect(htmlElementPasswordInput.disabled).toBeTruthy();

  expect(htmlElementLoginButton.disabled).toBeTruthy();

  expect(screen.getByRole("error-notice").innerHTML).toBe("");


  /*************************************************************************************************
  Admin-user-login mock Jest DOM test (for input-control disablement check)
  **************************************************************************************************/
  loginState = 'admin-login';

  cleanup();
  await act(async () => {
    render(<LoginPage />);
  });

  await waitFor(() => expect(screen.queryByLabelText('Email address')).not.toBeNull());

  htmlElementEmailAddressInput = screen.getByLabelText('Email address');
  htmlElementPasswordInput = screen.getByLabelText('Password');

  htmlElementLoginButton = screen.getByRole("button", {name: "Login"});

  htmlElementErrorNotice = screen.getByRole("error-notice");

  expect(htmlElementEmailAddressInput.disabled).toBeTruthy();
  expect(htmlElementPasswordInput.disabled).toBeTruthy();

  expect(htmlElementLoginButton.disabled).toBeTruthy();

  expect(screen.getByRole("error-notice").innerHTML).toBe("");


  /*************************************************************************************************
  No-login mock Jest DOM test (for input-control enablement check)
  **************************************************************************************************/
  loginState = 'no-login';

  cleanup();
  await act(async () => {
    render(<LoginPage />);
  });

  await waitFor(() => expect(screen.queryByLabelText('Email address')).not.toBeNull());

  htmlElementEmailAddressInput = screen.getByLabelText('Email address');
  htmlElementPasswordInput = screen.getByLabelText('Password');

  htmlElementLoginButton = screen.getByRole("button", {name: "Login"});

  htmlElementErrorNotice = screen.getByRole("error-notice");

  expect(htmlElementEmailAddressInput.disabled).toBeFalsy();
  expect(htmlElementPasswordInput.disabled).toBeFalsy();

  expect(htmlElementLoginButton.disabled).toBeFalsy();

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
  Login button click Jest DOM tests with button-click event handler function mocking 
  (mock only the fetch() call portion that should reside in a separate module for mocking) 
  (login input validation Jest DOM tests, email and password format validity checks)
  **************************************************************************************************/

  //Missing email address test
  await user.click(htmlElementLoginButton);
  expect(screen.getByRole("error-notice").innerHTML).toBe("Unable to log in.  You've entered an invalid email address.  Please correct and try again.");


  //Invalid email address test
  await user.type(htmlElementEmailAddressInput, 'AllenYoung@'); //UI typing event simulation
  expect(htmlElementEmailAddressInput.value).toEqual('AllenYoung@');

  await user.click(htmlElementLoginButton);
  expect(screen.getByRole("error-notice").innerHTML).toBe("Unable to log in.  You've entered an invalid email address.  Please correct and try again.");


  //Missing password test
  await act(async () => {
    htmlElementEmailAddressInput.value = "";  //Set the email address input field to blank
  });

  await user.type(htmlElementEmailAddressInput, 'AllenYoung@allenyoung.dev'); //UI typing event simulation
  expect(htmlElementEmailAddressInput.value).toEqual('AllenYoung@allenyoung.dev');

  await user.click(htmlElementLoginButton);
  expect(screen.getByRole("error-notice").innerHTML).toBe("Unable to log in.  You need to enter password.  Please correct and try again.");


  //Incorrect password format test
  await user.type(htmlElementPasswordInput, '1234'); //UI typing event simulation
  expect(htmlElementPasswordInput.value).toEqual('1234');

  await user.click(htmlElementLoginButton);
  expect(screen.getByRole("error-notice").innerHTML).toBe("Unable to log in.  Password does not meet the requirement.  Please correct and try again.");
  

  //Successful login submission test
  await act(async () => {
    htmlElementPasswordInput.value = "";  //Set the password input field to blank
    screen.getByRole("error-notice").innerHTML = "";
  });

  await user.type(htmlElementPasswordInput, '12345abcde!'); //UI typing event simulation
  expect(htmlElementPasswordInput.value).toEqual('12345abcde!');


  await user.click(htmlElementLoginButton);
  expect(screen.getByRole("error-notice").innerHTML).toBe("");
});
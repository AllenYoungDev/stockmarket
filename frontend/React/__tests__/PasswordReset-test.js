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

import {PasswordResetPage} from '../PasswordReset.js';

jest.mock('../utilities/fetchResetPassword');
jest.mock('../utilities/getEmailAddressAndAccessTokenInUrlParam');

import {fetchResetPassword} from '../utilities/fetchResetPassword.js';
import {getEmailAddressAndAccessTokenInUrlParam} from '../utilities/getEmailAddressAndAccessTokenInUrlParam.js';

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


it('React app Jest DOM unit and integration testing for Allen Young\'s Stockmarket Demo PasswordResetPage', async () => {
  /*************************************************************************************************
  fetch() wrapper function mocking
  **************************************************************************************************/

  fetchResetPassword.mockImplementation((accessToken, password, errorNoticeDomNodeRef) => {
    console.log('mockImplementation() mock called!');
  });
  getEmailAddressAndAccessTokenInUrlParam.mockImplementation(() => {
    console.log('getEmailAddressAndAccessTokenInUrlParam() mock called!');
    return "AllenYoung@AllenYoung.dev";
  });


  /*************************************************************************************************
  Tests prep
  **************************************************************************************************/
  let htmlElementPasswordInput;
  let htmlElementPasswordRetypeInput;
  let htmlElementPasswordShowHide;

  let htmlElementResetPasswordButton;

  let htmlElementErrorNotice;

  const user = userEvent.setup();


  /*************************************************************************************************
  Password show/hide text click Jest DOM test
  **************************************************************************************************/
  await act(async () => {
    render(<PasswordResetPage />);
  });

  await waitFor(() => expect(screen.queryByLabelText('Password')).not.toBeNull());

  htmlElementPasswordInput = screen.getByLabelText('Password');
  htmlElementPasswordRetypeInput = screen.getByLabelText('Password (Retype)');

  htmlElementResetPasswordButton = screen.getByRole("button", {name: "Reset password"});

  htmlElementErrorNotice = screen.getByRole("error-notice");

  expect(screen.getByRole("error-notice").innerHTML).toBe("");


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
  Password-reset button click Jest DOM tests with button-click event handler function mocking 
  (mock only the fetch() call portion that should reside in a separate module for mocking) 
  (password format validity and retype-match checks)
  **************************************************************************************************/

  //Missing password test
  await user.click(htmlElementResetPasswordButton);
  expect(screen.getByRole("error-notice").innerHTML).toBe("Unable to reset password.  You need to enter password.  Please correct and try again.");


  //Invalid password format test
  await user.type(htmlElementPasswordInput, '1234'); //UI typing event simulation
  expect(htmlElementPasswordInput.value).toEqual('1234');

  await user.click(htmlElementResetPasswordButton);
  expect(screen.getByRole("error-notice").innerHTML).toBe("Unable to reset password.  Password does not meet the requirement.  Please correct and try again.");


  //Missing password retype test
  await act(async () => {
    htmlElementPasswordInput.value = "";  //Set the email address input field to blank
  });

  await user.type(htmlElementPasswordInput, '12345abcde!'); //UI typing event simulation
  expect(htmlElementPasswordInput.value).toEqual('12345abcde!');

  await user.click(htmlElementResetPasswordButton);
  expect(screen.getByRole("error-notice").innerHTML).toBe("Unable to reset password.  You need to enter password (retype).  Please correct and try again.");


  //Password and password retype mismatch test
  await user.type(htmlElementPasswordRetypeInput, '1234'); //UI typing event simulation
  expect(htmlElementPasswordRetypeInput.value).toEqual('1234');

  await user.click(htmlElementResetPasswordButton);
  expect(screen.getByRole("error-notice").innerHTML).toBe("Password and password retype do not match.  Please correct and try again.");
  

  //Successful password reset submission test
  await act(async () => {
    htmlElementPasswordRetypeInput.value = "";  //Set the password retype input field to blank
    screen.getByRole("error-notice").innerHTML = "";
  });

  await user.type(htmlElementPasswordRetypeInput, '12345abcde!'); //UI typing event simulation
  expect(htmlElementPasswordRetypeInput.value).toEqual('12345abcde!');


  await user.click(htmlElementResetPasswordButton);
  expect(screen.getByRole("error-notice").innerHTML).toBe("");
});
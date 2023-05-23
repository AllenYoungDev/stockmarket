'use strict';

//import React, { StrictMode } from "react";
//import { createRoot } from 'react-dom/client';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

import { fetchRegisterUser } from './utilities/fetchRegisterUser.js';
import { fetchAccessTokenValidity } from './utilities/fetchAccessTokenValidity.js';
import { validateEmail } from './utilities/validators.js';
import './utilities/SendEmailAddressVerificationEmail.js';
import './utilities/ServerUrl.js';
import { checkPasswordFormat } from './utilities/checkPasswordFormat.js';
import { footer } from './footer.js';

/* *************************************************************************************************************
UserRegistrationPage React component
************************************************************************************************************** */
export function UserRegistrationPage() {
  var _React$useState = React.useState(''),
      _React$useState2 = _slicedToArray(_React$useState, 2),
      loginState = _React$useState2[0],
      setLoginState = _React$useState2[1];
  //loginState can be 'fetch-error', 'no-login', 'admin-login', and 'non-admin-login'.

  // /fetchAccessTokenValidity route requestwindow.
  // If access token is valid, admin cookie check and retrieval on client


  React.useEffect(function () {
    var ignore = false;
    setLoginState('');

    fetchAccessTokenValidity(setLoginState, ignore);

    return function () {
      ignore = true;
    };
  }, [setLoginState]);

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      'div',
      { className: 'top-bar' },
      React.createElement(
        'a',
        { href: window.frontendServerUrl, style: { textDecoration: 'none', color: 'rgb(255,255,255)' } },
        'Allen Young\'s Stockmarket Demo'
      )
    ),
    React.createElement(
      'section',
      { className: 'registration-form-section' },
      React.createElement(
        'h1',
        { className: 'registration-form-section-heading' },
        'Allen Young\'s Stockmarket Demo',
        React.createElement('br', null),
        'Account Registration'
      ),
      React.createElement(AccountRegistrationForm, { loginState: loginState })
    ),
    footer()
  );
}

/* *************************************************************************************************************
AccountRegistrationForm React component
************************************************************************************************************** */

export function AccountRegistrationForm(_ref) {
  var loginState = _ref.loginState;

  /*
  Implementation strategy
  -----------------------
  Handle the Register button click with a JavaScript event handler function defined in 
  this React component function.
  Use https://programminghead.com/submit-button-redirect-to-another-page-in-html as a reference.
    In the JavaScript event handler function, call fetch() to send a request to /RegisterUser backend API method.
  Display /RegisterUser response error on UI.
    If the response status of /RegisterUser request is 200, call fetch() to send a request to 
  /SendEmailAddressVerificationEmail backend API method.
  Display /SendEmailAddressVerificationEmail response error on UI.
    If the response status of /RegisterUser request is 200, redirect to EmailAddressVerificationNotice.html,
  with email address and access token in the URL.
  */
  var firstNameInputRef = React.useRef(null);
  var lastNameInputRef = React.useRef(null);
  var emailAddressInputRef = React.useRef(null);
  var phoneNumberInputRef = React.useRef(null);
  var passwordInputRef = React.useRef(null);
  var passwordRetypeInputRef = React.useRef(null);
  var errorNoticeDomNodeRef = React.useRef(null);

  function handleShowHideClick(event) {
    event.preventDefault();
    event.stopPropagation();

    if (event.target.innerHTML === 'show') {
      event.target.innerHTML = 'hide';
      passwordInputRef.current.type = "text";
      passwordRetypeInputRef.current.type = "text";
    } else {
      event.target.innerHTML = 'show';
      passwordInputRef.current.type = "password";
      passwordRetypeInputRef.current.type = "password";
    }
  }

  function handleOnClick(event) {
    event.stopPropagation();

    errorNoticeDomNodeRef.current.innerHTML = '';

    firstNameInputRef.current.style.backgroundColor = '#FFFFFF';
    lastNameInputRef.current.style.backgroundColor = '#FFFFFF';
    emailAddressInputRef.current.style.backgroundColor = '#FFFFFF';
    phoneNumberInputRef.current.style.backgroundColor = '#FFFFFF';
    passwordInputRef.current.style.backgroundColor = '#FFFFFF';
    passwordRetypeInputRef.current.style.backgroundColor = '#FFFFFF';

    /* ************************************************************************************************
    Input validation
    ************************************************************************************************ */

    var firstName = firstNameInputRef.current.value.trim();
    if (firstName === '') {
      errorNoticeDomNodeRef.current.innerHTML = "Unable to register.  You need to enter your first name.  Please correct and try again.";
      firstNameInputRef.current.style.backgroundColor = '#FAA0A0';
      return;
    }

    var lastName = lastNameInputRef.current.value.trim();
    if (lastName === '') {
      errorNoticeDomNodeRef.current.innerHTML = "Unable to register.  You need to enter your last name.  Please correct and try again.";
      lastNameInputRef.current.style.backgroundColor = '#FAA0A0';
      return;
    }

    var emailAddress = emailAddressInputRef.current.value.trim();
    console.log('AccountRegistrationForm() handleOnClick() email address input value:  ' + emailAddress + '.');
    if (!validateEmail(emailAddress)) {
      console.log('AccountRegistrationForm() handleOnClick() email address input invalid.');
      errorNoticeDomNodeRef.current.innerHTML = "Unable to register.  You've entered an invalid email address.  Please correct and try again.";
      emailAddressInputRef.current.style.backgroundColor = '#FAA0A0';
      return;
    }

    var phoneNumber = phoneNumberInputRef.current.value.trim();
    if (phoneNumber === '') {
      errorNoticeDomNodeRef.current.innerHTML = "Unable to register.  You need to enter your phone number.  Please correct and try again.";
      phoneNumberInputRef.current.style.backgroundColor = '#FAA0A0';
      return;
    }

    var password = passwordInputRef.current.value.trim();
    if (password === '') {
      errorNoticeDomNodeRef.current.innerHTML = "Unable to register.  You need to enter password.  Please correct and try again.";
      passwordInputRef.current.style.backgroundColor = '#FAA0A0';
      return;
    }

    var passwordRetype = passwordRetypeInputRef.current.value.trim();
    if (passwordRetype === '') {
      errorNoticeDomNodeRef.current.innerHTML = "Unable to register.  You need to enter password (retype).  Please correct and try again.";
      passwordRetypeInputRef.current.style.backgroundColor = '#FAA0A0';
      return;
    }

    if (!checkPasswordFormat(password)) {
      errorNoticeDomNodeRef.current.innerHTML = "Unable to register.  Password does not meet the requirement.  Please correct and try again.";
      passwordInputRef.current.style.backgroundColor = '#FAA0A0';
      return;
    }

    if (passwordRetype !== password) {
      errorNoticeDomNodeRef.current.innerHTML = "Unable to register.  Password and password retype do not match.  Please correct and try again.";
      passwordInputRef.current.style.backgroundColor = '#FAA0A0';
      passwordRetypeInputRef.current.style.backgroundColor = '#FAA0A0';
      return;
    }

    /* ************************************************************************************************
    Registration submission to backend
    ************************************************************************************************ */
    fetchRegisterUser(firstName, lastName, emailAddress, phoneNumber, password, errorNoticeDomNodeRef);
  }

  if (loginState === 'admin-login' || loginState === 'non-admin-login' || document.cookie.includes('accessToken=')) {
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        'form',
        { className: 'registration-form' },
        React.createElement(
          'div',
          { className: 'registration-form-div-grid' },
          React.createElement(
            'label',
            { className: 'registration-form-label-first-name', htmlFor: 'firstname' },
            'First name'
          ),
          React.createElement('input', { disabled: true, className: 'registration-form-input-first-name', type: 'text', id: 'firstname', name: 'firstname', size: '20', ref: firstNameInputRef }),
          React.createElement(
            'label',
            { className: 'registration-form-label-last-name', htmlFor: 'lastname' },
            'Last name'
          ),
          React.createElement('input', { disabled: true, className: 'registration-form-input-last-name', type: 'text', id: 'lastname', name: 'lastname', size: '20', ref: lastNameInputRef }),
          React.createElement('div', { className: 'registration-form-div-below-first-last-names' }),
          React.createElement(
            'label',
            { className: 'registration-form-label-email-address', htmlFor: 'emailaddress' },
            'Email address'
          ),
          React.createElement('input', { disabled: true, className: 'registration-form-input-email-address', type: 'text', id: 'emailaddress', name: 'emailaddress', size: '20', ref: emailAddressInputRef }),
          React.createElement(
            'label',
            { className: 'registration-form-label-phone-number', htmlFor: 'phonenumber' },
            'Phone number'
          ),
          React.createElement('input', { disabled: true, className: 'registration-form-input-phone-number', type: 'text', id: 'phonenumber', name: 'phonenumber', size: '20', ref: phoneNumberInputRef }),
          React.createElement('div', { className: 'registration-form-div-below-phone-number' }),
          React.createElement(
            'label',
            { className: 'registration-form-label-password', htmlFor: 'password' },
            'Password'
          ),
          React.createElement('input', { disabled: true, className: 'registration-form-input-password', type: 'text', id: 'password', name: 'password', ref: passwordInputRef }),
          React.createElement(
            'label',
            { className: 'registration-form-label-password-retype', htmlFor: 'passwordretype' },
            'Password (Retype)'
          ),
          React.createElement('input', { disabled: true, className: 'registration-form-input-password-retype', type: 'text', id: 'passwordretype', name: 'passwordretype', size: '20', ref: passwordRetypeInputRef })
        ),
        React.createElement(
          'p',
          { className: 'registration-form-paragraph-notice1' },
          'Password must be at least 10 characters, and must contain a letter, a number, and a special character from any of the following ~`!@#$%^&*-_+=|\\/?;:"\'<>,.',
          '[]().'
        ),
        React.createElement(
          'p',
          { className: 'registration-form-paragraph-notice2' },
          'Your email address will be your login ID.'
        ),
        React.createElement(
          'p',
          { className: 'registration-form-paragraph-notice3' },
          'After pressing the register button below, you\'ll receive an email-address verification email with a link that you must click to verify your email address.  You will not be able to log in before verifying your email address.'
        ),
        React.createElement(
          'div',
          { className: 'registration-form-div-register-button' },
          React.createElement('p', { className: 'registration-form-error-notice', role: 'error-notice', ref: errorNoticeDomNodeRef }),
          React.createElement('input', { disabled: true, className: 'registration-form-input-register-button', type: 'button', value: 'Register', onClick: handleOnClick })
        )
      )
    );
  } else {
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        'form',
        { className: 'registration-form' },
        React.createElement(
          'div',
          { className: 'registration-form-div-grid' },
          React.createElement(
            'label',
            { className: 'registration-form-label-first-name', htmlFor: 'firstname' },
            'First name'
          ),
          React.createElement('input', { className: 'registration-form-input-first-name', type: 'text', id: 'firstname', name: 'firstname', size: '20', placeholder: 'First name', ref: firstNameInputRef }),
          React.createElement(
            'label',
            { className: 'registration-form-label-last-name', htmlFor: 'lastname' },
            'Last name'
          ),
          React.createElement('input', { className: 'registration-form-input-last-name', type: 'text', id: 'lastname', name: 'lastname', size: '20', placeholder: 'Last name', ref: lastNameInputRef }),
          React.createElement('div', { className: 'registration-form-div-below-first-last-names' }),
          React.createElement(
            'label',
            { className: 'registration-form-label-email-address', htmlFor: 'emailaddress' },
            'Email address'
          ),
          React.createElement('input', { className: 'registration-form-input-email-address', type: 'text', id: 'emailaddress', name: 'emailaddress', size: '20', placeholder: 'Email address', ref: emailAddressInputRef }),
          React.createElement(
            'label',
            { className: 'registration-form-label-phone-number', htmlFor: 'phonenumber' },
            'Phone number'
          ),
          React.createElement('input', { className: 'registration-form-input-phone-number', type: 'text', id: 'phonenumber', name: 'phonenumber', size: '20', placeholder: 'Phone number', ref: phoneNumberInputRef }),
          React.createElement('div', { className: 'registration-form-div-below-phone-number' }),
          React.createElement(
            'label',
            { className: 'registration-form-label-password', htmlFor: 'password' },
            'Password'
          ),
          React.createElement('input', { className: 'registration-form-input-password', type: 'password', id: 'password', name: 'password', placeholder: 'Password', ref: passwordInputRef }),
          React.createElement(
            'p',
            { className: 'registration-form-password-show-hide' },
            React.createElement(
              'a',
              { href: '', role: 'password-show-hide', style: { textDecoration: 'none', color: 'rgb(255,255,255)' }, onClick: handleShowHideClick },
              'show'
            )
          ),
          React.createElement(
            'label',
            { className: 'registration-form-label-password-retype', htmlFor: 'passwordretype' },
            'Password (Retype)'
          ),
          React.createElement('input', { className: 'registration-form-input-password-retype', type: 'password', id: 'passwordretype', name: 'passwordretype', placeholder: 'Password (Retype)', size: '20', ref: passwordRetypeInputRef })
        ),
        React.createElement(
          'p',
          { className: 'registration-form-paragraph-notice1' },
          'Password must be at least 10 characters, and must contain a letter, a number, and a special character from any of the following ~`!@#$%^&*-_+=|\\/?;:"\'<>,.',
          '[]().'
        ),
        React.createElement(
          'p',
          { className: 'registration-form-paragraph-notice2' },
          'Your email address will be your login ID.'
        ),
        React.createElement(
          'p',
          { className: 'registration-form-paragraph-notice3' },
          'After pressing the register button below, you\'ll receive an email-address verification email with a link that you must click to verify your email address.  You will not be able to log in before verifying your email address.'
        ),
        React.createElement(
          'div',
          { className: 'registration-form-div-register-button' },
          React.createElement('p', { className: 'registration-form-error-notice', role: 'error-notice', ref: errorNoticeDomNodeRef }),
          React.createElement('input', { className: 'registration-form-input-register-button', type: 'button', value: 'Register', onClick: handleOnClick })
        )
      )
    );
  }
}
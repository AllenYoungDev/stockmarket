'use strict';

//import React, { StrictMode } from "react";
//import { createRoot } from 'react-dom/client';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

import { validateEmail } from './utilities/validators.js';
import './settings/ServerUrls.js';
import { fetchAccessTokenValidity } from './utilities/fetchAccessTokenValidity.js';
import { fetchLogin } from './utilities/fetchLogin.js';
import { checkPasswordFormat } from './utilities/checkPasswordFormat.js';
import { footer } from './footer.js';

/* *************************************************************************************************************
LoginPage React component
************************************************************************************************************** */
export function LoginPage() {
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

  console.log('LoginPage() cookies on client:  ' + document.cookie + '.');

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      'div',
      { className: 'top-bar' },
      React.createElement(
        'div',
        { className: 'top-bar-left-column' },
        React.createElement(
          'a',
          { href: window.frontendServerUrl, style: { textDecoration: 'none', color: 'rgb(255,255,255)' } },
          'Allen Young\'s Stockmarket Demo'
        )
      ),
      React.createElement(
        'div',
        { className: 'top-bar-right-column' },
        React.createElement(
          'a',
          { href: window.frontendServerUrl + '/registration.html', style: { textDecoration: 'none', color: 'rgb(255,255,255)' } },
          'Register'
        )
      )
    ),
    React.createElement(
      'section',
      { className: 'login-controls-section' },
      React.createElement(
        'h1',
        { className: 'login-controls-section-heading' },
        'Login'
      ),
      React.createElement(LoginControls, { loginState: loginState })
    ),
    footer()
  );
}

/* *************************************************************************************************************
LoginControls React component
************************************************************************************************************** */

export function LoginControls(_ref) {
  var loginState = _ref.loginState;

  var emailAddressInputRef = React.useRef(null);
  var passwordInputRef = React.useRef(null);
  var errorNoticeDomNodeRef = React.useRef(null);

  function handleShowHideClick(event) {
    event.preventDefault();
    event.stopPropagation();

    if (event.target.innerHTML === 'show') {
      event.target.innerHTML = 'hide';
      passwordInputRef.current.type = "text";
    } else {
      event.target.innerHTML = 'show';
      passwordInputRef.current.type = "password";
    }
  }

  function handleOnClick(event) {
    event.stopPropagation();

    errorNoticeDomNodeRef.current.innerHTML = '';

    emailAddressInputRef.current.style.backgroundColor = '#FFFFFF';
    passwordInputRef.current.style.backgroundColor = '#FFFFFF';

    /* ************************************************************************************************
    Input validation
    ************************************************************************************************ */
    var emailAddress = emailAddressInputRef.current.value.trim();
    if (!validateEmail(emailAddress)) {
      errorNoticeDomNodeRef.current.innerHTML = "Unable to log in.  You've entered an invalid email address.  Please correct and try again.";
      emailAddressInputRef.current.style.backgroundColor = '#FAA0A0';
      return;
    }

    var password = passwordInputRef.current.value.trim();
    if (password === '') {
      errorNoticeDomNodeRef.current.innerHTML = "Unable to log in.  You need to enter password.  Please correct and try again.";
      passwordInputRef.current.style.backgroundColor = '#FAA0A0';
      return;
    }

    if (!checkPasswordFormat(password)) {
      errorNoticeDomNodeRef.current.innerHTML = "Unable to log in.  Password does not meet the requirement.  Please correct and try again.";
      passwordInputRef.current.style.backgroundColor = '#FAA0A0';
      return;
    }

    /* ************************************************************************************************
    Login submission to backend
    ************************************************************************************************ */
    fetchLogin(emailAddress, password, errorNoticeDomNodeRef);
  }

  if (loginState === 'admin-login' || loginState === 'non-admin-login' || document.cookie.includes('accessToken=')) {
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        'form',
        { className: 'login-form' },
        React.createElement(
          'div',
          { className: 'login-form-div-grid' },
          React.createElement(
            'label',
            { className: 'login-form-label-email-address', htmlFor: 'emailaddress' },
            'Email address'
          ),
          React.createElement('input', { disabled: true, className: 'login-form-input-email-address', type: 'text', id: 'emailaddress', name: 'emailaddress', size: '20', placeholder: 'Email address', ref: emailAddressInputRef }),
          React.createElement(
            'label',
            { className: 'login-form-label-password', htmlFor: 'password' },
            'Password'
          ),
          React.createElement('input', { disabled: true, className: 'login-form-input-password', type: 'password', id: 'password', name: 'password', size: '20', placeholder: 'Password', ref: passwordInputRef })
        ),
        React.createElement(
          'div',
          { className: 'login-form-div-login-button' },
          React.createElement('p', { className: 'login-form-error-notice', role: 'error-notice', ref: errorNoticeDomNodeRef }),
          React.createElement('input', { disabled: true, className: 'login-form-input-login-button', type: 'button', value: 'Login', onClick: handleOnClick })
        )
      )
    );
  } else {
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        'form',
        { className: 'login-form' },
        React.createElement(
          'div',
          { className: 'login-form-div-grid' },
          React.createElement(
            'label',
            { className: 'login-form-label-email-address', htmlFor: 'emailaddress' },
            'Email address'
          ),
          React.createElement('input', { className: 'login-form-input-email-address', type: 'text', id: 'emailaddress', name: 'emailaddress', size: '20', placeholder: 'Email address', ref: emailAddressInputRef }),
          React.createElement(
            'label',
            { className: 'login-form-label-password', htmlFor: 'password' },
            'Password'
          ),
          React.createElement('input', { className: 'login-form-input-password', type: 'password', id: 'password', name: 'password', size: '20', placeholder: 'Password', ref: passwordInputRef }),
          React.createElement(
            'p',
            { className: 'login-form-password-show-hide' },
            React.createElement(
              'a',
              { href: '', role: 'password-show-hide', style: { textDecoration: 'none', color: 'rgb(255,255,255)' }, onClick: handleShowHideClick },
              'show'
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'login-form-div-login-button' },
          React.createElement('p', { className: 'login-form-error-notice', role: 'error-notice', ref: errorNoticeDomNodeRef }),
          React.createElement('input', { className: 'login-form-input-login-button', type: 'button', value: 'Login', onClick: handleOnClick })
        )
      )
    );
  }
}
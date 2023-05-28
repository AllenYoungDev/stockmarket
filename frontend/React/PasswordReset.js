'use strict';

//import React, { StrictMode } from "react";
//import { createRoot } from 'react-dom/client';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

import './settings/ServerUrls.js';
import { fetchResetPassword } from './utilities/fetchResetPassword.js';
import { getEmailAddressAndAccessTokenInUrlParam } from './utilities/getEmailAddressAndAccessTokenInUrlParam.js';
import { checkPasswordFormat } from './utilities/checkPasswordFormat.js';
import { footer } from './footer.js';

/* *************************************************************************************************************
PasswordResetPage React component
************************************************************************************************************** */
export function PasswordResetPage() {
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
      { className: 'password-reset-section' },
      React.createElement(
        'h1',
        { className: 'password-reset-section-heading' },
        'Password reset'
      ),
      React.createElement(PasswordResetControls, null)
    ),
    footer()
  );
}

/* *************************************************************************************************************
PasswordResetControls React component
************************************************************************************************************** */

export function PasswordResetControls() {
  var passwordInputRef = React.useRef(null);
  var passwordRetypeInputRef = React.useRef(null);
  var errorNoticeDomNodeRef = React.useRef(null);

  var _getEmailAddressAndAc = getEmailAddressAndAccessTokenInUrlParam(),
      _getEmailAddressAndAc2 = _slicedToArray(_getEmailAddressAndAc, 2),
      emailAddress = _getEmailAddressAndAc2[0],
      accessToken = _getEmailAddressAndAc2[1];

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

    passwordInputRef.current.style.backgroundColor = '#FFFFFF';
    passwordRetypeInputRef.current.style.backgroundColor = '#FFFFFF';

    /* ************************************************************************************************
    Input validation
    ************************************************************************************************ */

    var password = passwordInputRef.current.value.trim();
    if (password === '') {
      errorNoticeDomNodeRef.current.innerHTML = "Unable to reset password.  You need to enter password.  Please correct and try again.";
      passwordInputRef.current.style.backgroundColor = '#FAA0A0';
      return;
    }

    if (!checkPasswordFormat(password)) {
      errorNoticeDomNodeRef.current.innerHTML = "Unable to reset password.  Password does not meet the requirement.  Please correct and try again.";
      passwordInputRef.current.style.backgroundColor = '#FAA0A0';
      return;
    }

    var passwordRetype = passwordRetypeInputRef.current.value.trim();
    if (passwordRetype === '') {
      errorNoticeDomNodeRef.current.innerHTML = "Unable to reset password.  You need to enter password (retype).  Please correct and try again.";
      passwordRetypeInputRef.current.style.backgroundColor = '#FAA0A0';
      return;
    }

    if (passwordRetype !== password) {
      errorNoticeDomNodeRef.current.innerHTML = "Password and password retype do not match.  Please correct and try again.";
      passwordInputRef.current.style.backgroundColor = '#FAA0A0';
      passwordRetypeInputRef.current.style.backgroundColor = '#FAA0A0';
      return;
    }

    /* ************************************************************************************************
    Password reset submission to backend
    ************************************************************************************************ */
    fetchResetPassword(accessToken, password, errorNoticeDomNodeRef);
  }

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      'p',
      { className: 'email-address' },
      'Use the form below to change your login password.'
    ),
    React.createElement(
      'p',
      { className: 'email-address' },
      'Email address:  ',
      emailAddress
    ),
    React.createElement(
      'form',
      { className: 'reset-password-form' },
      React.createElement(
        'div',
        { className: 'reset-password-form-div-grid' },
        React.createElement(
          'label',
          { className: 'reset-password-form-label-password', htmlFor: 'password' },
          'Password'
        ),
        React.createElement('input', { className: 'reset-password-form-input-password', type: 'password', id: 'password', name: 'password', ref: passwordInputRef }),
        React.createElement('br', null),
        React.createElement(
          'p',
          { className: 'reset-password-form-password-show-hide' },
          React.createElement(
            'a',
            { href: '', role: 'password-show-hide', style: { textDecoration: 'none', color: 'rgb(255,255,255)' }, onClick: handleShowHideClick },
            'show'
          )
        ),
        React.createElement(
          'label',
          { className: 'reset-password-form-label-password-retype', htmlFor: 'passwordretype' },
          'Password (Retype)'
        ),
        React.createElement('input', { className: 'reset-password-form-input-password-retype', type: 'password', id: 'passwordretype', name: 'passwordretype', size: '20', ref: passwordRetypeInputRef })
      ),
      React.createElement(
        'div',
        { className: 'reset-password-form-div-reset-password-button' },
        React.createElement('p', { className: 'reset-password-form-error-notice', role: 'error-notice', ref: errorNoticeDomNodeRef }),
        React.createElement('input', { className: 'reset-password-form-input-reset-password-button', type: 'button', value: 'Reset password', onClick: handleOnClick })
      )
    )
  );
}
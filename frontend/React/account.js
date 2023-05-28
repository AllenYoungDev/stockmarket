'use strict';

//import React, { StrictMode } from "react";
//import { createRoot } from 'react-dom/client';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

import { validateEmail } from './utilities/validators.js';
import './settings/ServerUrls.js';
import './settings/dbMaximumNumberOfRowsReturned.js';
import './pageNavigationControlsGenerator.js';
import { fetchAccessTokenValidity } from './utilities/fetchAccessTokenValidity.js';
import { fetchNumberOfCompanySharesOwnedByUser } from './utilities/fetchNumberOfCompanySharesOwnedByUser.js';
import { fetchUpdateUserAccountSettings } from './utilities/fetchUpdateUserAccountSettings.js';
import { fetchNumberOfUserStockTransactions } from './utilities/fetchNumberOfUserStockTransactions.js';
import { fetchUserStockTransactionHistory } from './utilities/fetchUserStockTransactionHistory.js';
import { useUserAccountSettings } from './utilities/useUserAccountSettings.js';
import { convertEpochTimeToLocalTimeString } from './utilities/convertEpochTimeToLocalTimeString.js';
import { checkPasswordFormat } from './utilities/checkPasswordFormat.js';
import { handleLogoutOnClick } from './utilities/handleLogoutOnClick.js';
import { footer } from './footer.js';

/* *************************************************************************************************************
UserAccountPage React component
************************************************************************************************************** */
export function UserAccountPage() {
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

  console.log('UserAccountPage() cookies on client:  ' + document.cookie + '.');

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
        React.createElement(AdminLogout, { loginState: loginState })
      )
    ),
    React.createElement(
      'section',
      { className: 'account-settings-section' },
      React.createElement(
        'h1',
        { className: 'account-settings-section-heading' },
        'Account Settings'
      ),
      React.createElement(AccountSettingsUpdateForm, { loginState: loginState }),
      React.createElement(NumberOfCompanySharesOwnedByUser, null)
    ),
    React.createElement(
      'section',
      { className: 'company-stock-transaction-history-section' },
      React.createElement(
        'h1',
        { className: 'company-stock-transaction-history-section-heading' },
        'Company Stock Transaction History'
      ),
      React.createElement(CompanyStockTransactionHistory, { loginState: loginState })
    ),
    footer()
  );
}

/* *************************************************************************************************************
AdminLogout React component
************************************************************************************************************** */

export function AdminLogout(_ref) {
  var loginState = _ref.loginState;

  switch (loginState) {
    case 'fetch-error':
      return React.createElement(
        'div',
        null,
        'Network error.  Please retry later.'
      );
    case 'no-login':
      return React.createElement(
        React.Fragment,
        null,
        React.createElement(
          'a',
          { href: window.frontendServerUrl + "/registration.html", style: { textDecoration: 'none', color: 'rgb(255,255,255)' } },
          'Register'
        ),
        ' |\xA0',
        React.createElement(
          'a',
          { href: window.frontendServerUrl + "/login.html", style: { textDecoration: 'none', color: 'rgb(255,255,255)' } },
          'Login'
        )
      );
    case 'admin-login':
      return React.createElement(
        React.Fragment,
        null,
        React.createElement(
          'a',
          { href: window.frontendServerUrl + "/admin.html", style: { textDecoration: 'none', color: 'rgb(255,255,255)' } },
          'Admin'
        ),
        ' |\xA0',
        React.createElement(
          'a',
          { href: '', onClick: handleLogoutOnClick, style: { textDecoration: 'none', color: 'rgb(255,255,255)' } },
          'Logout'
        )
      );
    case 'non-admin-login':
      return React.createElement(
        React.Fragment,
        null,
        React.createElement(
          'a',
          { href: '', onClick: handleLogoutOnClick, style: { textDecoration: 'none', color: 'rgb(255,255,255)' } },
          'Logout'
        )
      );
    default:
      /* The following is for doing better or smooth rendering. Refer to the "Better rendering methods"
         section in the developer's journal.  */
      if (document.cookie.includes('accessToken=')) {
        if (document.cookie.includes('admin=true')) {
          return React.createElement(
            React.Fragment,
            null,
            React.createElement(
              'a',
              { href: window.frontendServerUrl + "/admin.html", style: { textDecoration: 'none', color: 'rgb(255,255,255)' } },
              'Admin'
            ),
            ' |\xA0',
            React.createElement(
              'a',
              { href: '', onClick: handleLogoutOnClick, style: { textDecoration: 'none', color: 'rgb(255,255,255)' } },
              'Logout'
            )
          );
        } else {
          return React.createElement(
            React.Fragment,
            null,
            React.createElement(
              'a',
              { href: '', onClick: handleLogoutOnClick, style: { textDecoration: 'none', color: 'rgb(255,255,255)' } },
              'Logout'
            )
          );
        }
      } else {
        return React.createElement(
          React.Fragment,
          null,
          React.createElement(
            'a',
            { href: window.frontendServerUrl + "/registration.html", style: { textDecoration: 'none', color: 'rgb(255,255,255)' } },
            'Register'
          ),
          ' |\xA0',
          React.createElement(
            'a',
            { href: window.frontendServerUrl + "/login.html", style: { textDecoration: 'none', color: 'rgb(255,255,255)' } },
            'Login'
          )
        );
      }
  }
}

/* *************************************************************************************************************
AccountSettingsUpdateForm React component
************************************************************************************************************** */

export function AccountSettingsUpdateForm(_ref2) {
  var loginState = _ref2.loginState;

  var firstNameInputRef = React.useRef(null);
  var lastNameInputRef = React.useRef(null);
  var emailAddressInputRef = React.useRef(null);
  var phoneNumberInputRef = React.useRef(null);
  var passwordInputRef = React.useRef(null);
  var passwordRetypeInputRef = React.useRef(null);
  var errorNoticeRef = React.useRef(null);

  //https://react.dev/learn/reusing-logic-with-custom-hooks#extracting-your-own-custom-hook-from-a-component
  var userAccountSettings = useUserAccountSettings();

  React.useEffect(function () {
    console.log('AccountSettingsUpdateForm() useEffect() userAccountSettings:  ' + JSON.stringify(userAccountSettings));

    if (userAccountSettings === null) {
      return;
    }

    firstNameInputRef.current.value = userAccountSettings["userFirstName"];
    lastNameInputRef.current.value = userAccountSettings["userLastName"];
    emailAddressInputRef.current.value = userAccountSettings["userEmailAddress"];
    phoneNumberInputRef.current.value = userAccountSettings["userPhoneNumber"];
  }, [userAccountSettings]);

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

  function handleUpdateClick(event) {
    event.stopPropagation();

    errorNoticeRef.current.innerHTML = '';

    emailAddressInputRef.current.style.backgroundColor = '#FFFFFF';
    passwordInputRef.current.style.backgroundColor = '#FFFFFF';
    passwordRetypeInputRef.current.style.backgroundColor = '#FFFFFF';

    /* ************************************************************************************************
    Input validation
    ************************************************************************************************ */
    var firstName = firstNameInputRef.current.value.trim();
    var lastName = lastNameInputRef.current.value.trim();

    var emailAddress = emailAddressInputRef.current.value.trim();
    if (emailAddress !== '' && !validateEmail(emailAddress)) {
      errorNoticeRef.current.innerHTML = "Unable to update.  You've entered an invalid email address.  Please correct and try again.";
      emailAddressInputRef.current.style.backgroundColor = '#FAA0A0';
      return;
    }

    var phoneNumber = phoneNumberInputRef.current.value.trim();

    var password = passwordInputRef.current.value.trim();
    var passwordRetype = passwordRetypeInputRef.current.value.trim();
    if (password !== '' && password !== passwordRetype) {
      errorNoticeRef.current.innerHTML = "Unable to update.  Password and password retype do not match.  Please correct and try again.";
      passwordInputRef.current.style.backgroundColor = '#FAA0A0';
      passwordRetypeInputRef.current.style.backgroundColor = '#FAA0A0';
      return;
    }
    if (password !== '' && !checkPasswordFormat(password)) {
      errorNoticeRef.current.innerHTML = "Unable to update.  Password does not meet the requirement.  Please correct and try again.";
      passwordInputRef.current.style.backgroundColor = '#FAA0A0';
      return;
    }

    /* ************************************************************************************************
    Update submission to backend
    ************************************************************************************************ */
    fetchUpdateUserAccountSettings(firstName, lastName, emailAddress, phoneNumber, password, errorNoticeRef);
  }

  console.log('AccountSettingsUpdateForm() useUserAccountSettings() userAccountSettings:  ' + JSON.stringify(userAccountSettings) + '.');

  console.log('AccountSettingsUpdateForm() loginState:  ' + loginState + '.');

  if (loginState === 'admin-login' || loginState === 'non-admin-login') {
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        'form',
        { className: 'account-settings-update-form' },
        React.createElement(
          'div',
          { className: 'account-settings-update-form-div-grid' },
          React.createElement(
            'label',
            { className: 'account-settings-update-form-label-first-name', htmlFor: 'fname' },
            'First name'
          ),
          React.createElement('input', { className: 'account-settings-update-form-input-first-name', type: 'text', id: 'fname', name: 'fname', size: '20', placeholder: 'First name', ref: firstNameInputRef }),
          React.createElement(
            'label',
            { className: 'account-settings-update-form-label-last-name', htmlFor: 'lname' },
            'Last name'
          ),
          React.createElement('input', { className: 'account-settings-update-form-input-last-name', type: 'text', id: 'lname', name: 'lname', size: '20', placeholder: 'Last name', ref: lastNameInputRef }),
          React.createElement('div', { className: 'account-settings-update-form-div-below-last-name' }),
          React.createElement(
            'label',
            { className: 'account-settings-update-form-label-email-address', htmlFor: 'emailaddress' },
            'Email address'
          ),
          React.createElement('input', { className: 'account-settings-update-form-input-email-address', type: 'text', id: 'emailaddress', name: 'emailaddress', size: '20', placeholder: 'Email address', ref: emailAddressInputRef }),
          React.createElement(
            'label',
            { className: 'account-settings-update-form-label-phone-number', htmlFor: 'phonenumber' },
            'Phone number'
          ),
          React.createElement('input', { className: 'account-settings-update-form-input-phone-number', type: 'text', id: 'phonenumber', name: 'phonenumber', size: '20', placeholder: 'Phone number', ref: phoneNumberInputRef }),
          React.createElement('div', { className: 'account-settings-update-form-div-below-phone-number' }),
          React.createElement(
            'label',
            { className: 'account-settings-update-form-label-password', htmlFor: 'password' },
            'Password'
          ),
          React.createElement('input', { className: 'account-settings-update-form-input-password', type: 'password', id: 'password', name: 'password', size: '20', placeholder: 'Password', ref: passwordInputRef }),
          React.createElement(
            'p',
            { className: 'account-settings-update-form-password-show-hide' },
            React.createElement(
              'a',
              { href: '', role: 'password-show-hide', style: { textDecoration: 'none', color: 'rgb(255,255,255)' }, onClick: handleShowHideClick },
              'show'
            )
          ),
          React.createElement(
            'label',
            { className: 'account-settings-update-form-label-password-retype', htmlFor: 'passwordretype' },
            'Password (Retype)'
          ),
          React.createElement('input', { className: 'account-settings-update-form-input-password-retype', type: 'password', id: 'passwordretype', name: 'passwordretype', size: '20', placeholder: 'Password (Retype)', ref: passwordRetypeInputRef })
        ),
        React.createElement(
          'p',
          { className: 'account-settings-update-form-notice1' },
          'Password must be at least 10 characters, and must contain a letter, a number, and a special character from any of the following ~`!@#$%^&*-_+=|\\/?;:"\'<>,.',
          '[]().'
        ),
        React.createElement(
          'p',
          { className: 'account-settings-update-form-notice2' },
          'Your email address is your login ID and PayPal account ID.'
        ),
        React.createElement(
          'p',
          { className: 'account-settings-update-form-notice3' },
          'Your email address will be updated instantly without the email-address verification.  Please make sure that the new email address you enter is correct.'
        ),
        React.createElement(
          'div',
          { className: 'account-settings-update-form-div-button' },
          React.createElement('p', { className: 'account-settings-update-form-error-notice', role: 'error-notice', ref: errorNoticeRef }),
          React.createElement('input', { className: 'account-settings-update-form-input-button', type: 'button', value: 'Update', onClick: handleUpdateClick })
        )
      )
    );
  } else {
    if (document.cookie.includes('accessToken=')) {
      return React.createElement(
        React.Fragment,
        null,
        React.createElement(
          'form',
          { className: 'account-settings-update-form' },
          React.createElement(
            'div',
            { className: 'account-settings-update-form-div-grid' },
            React.createElement(
              'label',
              { className: 'account-settings-update-form-label-first-name', htmlFor: 'fname' },
              'First name'
            ),
            React.createElement('input', { className: 'account-settings-update-form-input-first-name', type: 'text', id: 'fname', name: 'fname', size: '20', ref: firstNameInputRef }),
            React.createElement(
              'label',
              { className: 'account-settings-update-form-label-last-name', htmlFor: 'lname' },
              'Last name'
            ),
            React.createElement('input', { className: 'account-settings-update-form-input-last-name', type: 'text', id: 'lname', name: 'lname', size: '20', ref: lastNameInputRef }),
            React.createElement('div', { className: 'account-settings-update-form-div-below-last-name' }),
            React.createElement(
              'label',
              { className: 'account-settings-update-form-label-email-address', htmlFor: 'emailaddress' },
              'Email address'
            ),
            React.createElement('input', { className: 'account-settings-update-form-input-email-address', type: 'text', id: 'emailaddress', name: 'emailaddress', size: '20', ref: emailAddressInputRef }),
            React.createElement(
              'label',
              { className: 'account-settings-update-form-label-phone-number', htmlFor: 'phonenumber' },
              'Phone number'
            ),
            React.createElement('input', { className: 'account-settings-update-form-input-phone-number', type: 'text', id: 'phonenumber', name: 'phonenumber', size: '20', ref: phoneNumberInputRef }),
            React.createElement('div', { className: 'account-settings-update-form-div-below-phone-number' }),
            React.createElement(
              'label',
              { className: 'account-settings-update-form-label-password', htmlFor: 'password' },
              'Password'
            ),
            React.createElement('input', { className: 'account-settings-update-form-input-password', type: 'text', id: 'password', name: 'password', size: '20', ref: passwordInputRef }),
            React.createElement(
              'label',
              { className: 'account-settings-update-form-label-password-retype', htmlFor: 'passwordretype' },
              'Password (Retype)'
            ),
            React.createElement('input', { className: 'account-settings-update-form-input-password-retype', type: 'text', id: 'passwordretype', name: 'passwordretype', size: '20', ref: passwordRetypeInputRef })
          ),
          React.createElement(
            'p',
            { className: 'account-settings-update-form-notice1' },
            'Password must be at least 10 characters, and must contain a letter, a number, and a special character from any of the following ~`!@#$%^&*-_+=|\\/?;:"\'<>,.',
            '[]().'
          ),
          React.createElement(
            'p',
            { className: 'account-settings-update-form-notice2' },
            'Your email address is your login ID and PayPal account ID.'
          ),
          React.createElement(
            'p',
            { className: 'account-settings-update-form-notice3' },
            'Your email address will be updated instantly without the email-address verification.  Please make sure that the new email address you enter is correct.'
          ),
          React.createElement(
            'div',
            { className: 'account-settings-update-form-div-button' },
            React.createElement('p', { className: 'account-settings-update-form-error-notice', role: 'error-notice', ref: errorNoticeRef }),
            React.createElement('input', { className: 'account-settings-update-form-input-button', type: 'button', value: 'Update', onClick: handleUpdateClick })
          )
        )
      );
    } else {
      return React.createElement(
        React.Fragment,
        null,
        React.createElement(
          'form',
          { className: 'account-settings-update-form' },
          React.createElement(
            'div',
            { className: 'account-settings-update-form-div-grid' },
            React.createElement(
              'label',
              { className: 'account-settings-update-form-label-first-name', htmlFor: 'fname' },
              'First name'
            ),
            React.createElement('input', { disabled: true, className: 'account-settings-update-form-input-first-name', type: 'text', id: 'fname', name: 'fname', size: '20', ref: firstNameInputRef }),
            React.createElement(
              'label',
              { className: 'account-settings-update-form-label-last-name', htmlFor: 'lname' },
              'Last name'
            ),
            React.createElement('input', { disabled: true, className: 'account-settings-update-form-input-last-name', type: 'text', id: 'lname', name: 'lname', size: '20', ref: lastNameInputRef }),
            React.createElement('div', { className: 'account-settings-update-form-div-below-last-name' }),
            React.createElement(
              'label',
              { className: 'account-settings-update-form-label-email-address', htmlFor: 'emailaddress' },
              'Email address'
            ),
            React.createElement('input', { disabled: true, className: 'account-settings-update-form-input-email-address', type: 'text', id: 'emailaddress', name: 'emailaddress', size: '20', ref: emailAddressInputRef }),
            React.createElement(
              'label',
              { className: 'account-settings-update-form-label-phone-number', htmlFor: 'phonenumber' },
              'Phone number'
            ),
            React.createElement('input', { disabled: true, className: 'account-settings-update-form-input-phone-number', type: 'text', id: 'phonenumber', name: 'phonenumber', size: '20', ref: phoneNumberInputRef }),
            React.createElement('div', { className: 'account-settings-update-form-div-below-phone-number' }),
            React.createElement(
              'label',
              { className: 'account-settings-update-form-label-password', htmlFor: 'password' },
              'Password'
            ),
            React.createElement('input', { disabled: true, className: 'account-settings-update-form-input-password', type: 'text', id: 'password', name: 'password', size: '20', ref: passwordInputRef }),
            React.createElement(
              'label',
              { className: 'account-settings-update-form-label-password-retype', htmlFor: 'passwordretype' },
              'Password (Retype)'
            ),
            React.createElement('input', { disabled: true, className: 'account-settings-update-form-input-password-retype', type: 'text', id: 'passwordretype', name: 'passwordretype', size: '20', ref: passwordRetypeInputRef })
          ),
          React.createElement(
            'p',
            { className: 'account-settings-update-form-notice1' },
            'Password must be at least 10 characters, and must contain a letter, a number, and a special character from any of the following ~`!@#$%^&*-_+=|\\/?;:"\'<>,.',
            '[]().'
          ),
          React.createElement(
            'p',
            { className: 'account-settings-update-form-notice2' },
            'Your email address is your login ID and PayPal account ID.'
          ),
          React.createElement(
            'p',
            { className: 'account-settings-update-form-notice3' },
            'Your email address will be updated instantly without the email-address verification.  Please make sure that the new email address you enter is correct.'
          ),
          React.createElement(
            'div',
            { className: 'account-settings-update-form-div-button' },
            React.createElement('p', { className: 'account-settings-update-form-error-notice', role: 'error-notice', ref: errorNoticeRef }),
            React.createElement('input', { disabled: true, className: 'account-settings-update-form-input-button', type: 'button', value: 'Update' })
          )
        )
      );
    }
  }
}

/* *************************************************************************************************************
NumberOfCompanySharesOwnedByUser React component
************************************************************************************************************** */

export function NumberOfCompanySharesOwnedByUser() {
  var _React$useState3 = React.useState({ responseStatus: 0, responseBody: '' }),
      _React$useState4 = _slicedToArray(_React$useState3, 2),
      responseStatusBody = _React$useState4[0],
      setResponseStatusBody = _React$useState4[1];

  // /fetchNumberOfCompanySharesOwnedByUser route request
  // If access token is valid, admin cookie check and retrieval on client


  React.useEffect(function () {
    var ignore = false;

    setResponseStatusBody({ responseStatus: 0, responseBody: '' });

    fetchNumberOfCompanySharesOwnedByUser(setResponseStatusBody, ignore);

    return function () {
      ignore = true;
    };
  }, [setResponseStatusBody]);

  var numberOfCompanySharesOwned = Number(responseStatusBody['responseBody']);

  switch (responseStatusBody['responseStatus']) {
    case -1:
      //'fetch-error'
      return React.createElement(
        'p',
        { className: 'number-of-company-shares-owned' },
        'Network error.  Please retry later.'
      );
    case 200:
      return React.createElement(
        'div',
        null,
        React.createElement(
          'p',
          { className: 'number-of-company-shares-owned' },
          'Number of Company shares owned by me:  ',
          numberOfCompanySharesOwned
        )
      );
    case 500:
      return React.createElement(
        'p',
        { className: 'number-of-company-shares-owned' },
        'Server error.  Please retry later.'
      );
    default:
      //responseStatus 0 and 400
      return React.createElement(
        'div',
        { style: { opacity: 0.6 } },
        React.createElement(
          'p',
          { className: 'number-of-company-shares-owned' },
          'Number of Company shares owned by me:'
        )
      );
  }
}

/* *************************************************************************************************************
CompanyStockTransactionHistory React component
************************************************************************************************************** */

export function CompanyStockTransactionHistory(_ref3) {
  var loginState = _ref3.loginState;

  var userInputPageNumberInputRef = React.useRef(null);

  var _React$useState5 = React.useState(0),
      _React$useState6 = _slicedToArray(_React$useState5, 2),
      numberOfUserStockTransactions = _React$useState6[0],
      setNumberOfUserStockTransactions = _React$useState6[1];

  var _React$useState7 = React.useState(1),
      _React$useState8 = _slicedToArray(_React$useState7, 2),
      pageNumber = _React$useState8[0],
      setPageNumber = _React$useState8[1];

  var _React$useState9 = React.useState([]),
      _React$useState10 = _slicedToArray(_React$useState9, 2),
      userStockTransactionHistory = _React$useState10[0],
      setUserStockTransactionHistory = _React$useState10[1];

  // /GetNumberOfUserStockTransactions request.


  React.useEffect(function () {
    var ignore = false;
    setNumberOfUserStockTransactions(0);

    fetchNumberOfUserStockTransactions(setNumberOfUserStockTransactions, ignore);

    return function () {
      ignore = true;
    };
  }, [setNumberOfUserStockTransactions]);

  // /GetUserStockTransactionHistory/:pageNumber request.
  React.useEffect(function () {
    var ignore = false;
    setUserStockTransactionHistory([]);

    fetchUserStockTransactionHistory(pageNumber, setUserStockTransactionHistory, ignore);

    return function () {
      ignore = true;
    };
  }, [pageNumber, setUserStockTransactionHistory]);

  function handlePageNumberOnInput(event) {
    event.stopPropagation();
    if (!event.target.validity.valid) {
      event.target.value = '';
    }
  }

  function handleGoToButtonOnClick(event) {
    event.stopPropagation();

    var userInputPageNumber = userInputPageNumberInputRef.current.value.trim();
    if (userInputPageNumber == pageNumber || userInputPageNumber === '' || userInputPageNumber < 1 || userInputPageNumber > numberOfUserStockTransactions) {
      return;
    }

    setPageNumber(pageNumber);
  }

  function handleNavigationLinkOnClick(event, navigationPageNumber) {
    event.preventDefault();
    event.stopPropagation();

    console.log('account.js handleNavigationLinkOnClick() navigationPageNumber:  ' + navigationPageNumber + '.');

    if (navigationPageNumber === 0) {
      return;
    }

    if (pageNumber !== navigationPageNumber) {
      setPageNumber(navigationPageNumber);
    }
  }

  if (loginState === 'non-admin-login') {
    console.log('CompanyStockTransactionHistory(), loginState === \'non-admin-login\', userStockTransactionHistory:  ' + JSON.stringify(userStockTransactionHistory) + '.');

    var listItems = userStockTransactionHistory.map(function (stockTransaction) {
      return React.createElement(
        'tr',
        { key: stockTransaction["ID"] },
        React.createElement(
          'td',
          { key: stockTransaction["ID"] + "_1" },
          convertEpochTimeToLocalTimeString(stockTransaction["Transaction start datetime"])
        ),
        React.createElement(
          'td',
          { key: stockTransaction["ID"] + "_2" },
          stockTransaction["PayPal transaction (order) ID"]
        ),
        React.createElement(
          'td',
          { key: stockTransaction["ID"] + "_3" },
          stockTransaction["Number of shares"]
        ),
        React.createElement(
          'td',
          { key: stockTransaction["ID"] + "_4" },
          stockTransaction["Payment processing initiated"]
        ),
        React.createElement(
          'td',
          { key: stockTransaction["ID"] + "_5" },
          stockTransaction["Payment processing completed"]
        ),
        React.createElement(
          'td',
          { key: stockTransaction["ID"] + "_6" },
          stockTransaction["Payment processing status"]
        )
      );
    });

    /*
    if (listItems === undefined || listItems.length == 0) {
      // array does not exist or is empty
      listItems = null;
    }
    */

    console.log('CompanyStockTransactionHistory(), loginState === \'non-admin-login\', listItems:  ' + listItems + '.');

    var totalNumberOfPages = Math.ceil(numberOfUserStockTransactions / window.dbMaximumNumberOfRowsReturned);
    console.log('account.js totalNumberOfPages:  ' + totalNumberOfPages + '.');
    console.log('account.js pageNumber:  ' + pageNumber + '.');

    var navigationControls = window.generatePageNavigationControls(totalNumberOfPages, pageNumber, handleNavigationLinkOnClick, '#36454F');

    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        'div',
        { className: 'company-stock-transaction-history-div-display' },
        React.createElement(
          'table',
          { className: 'company-stock-transaction-history-table' },
          React.createElement(
            'thead',
            null,
            React.createElement(
              'tr',
              null,
              React.createElement(
                'th',
                null,
                'Transaction start datetime'
              ),
              React.createElement(
                'th',
                null,
                'PayPal transaction (order) ID'
              ),
              React.createElement(
                'th',
                null,
                'Number of shares'
              ),
              React.createElement(
                'th',
                null,
                'Payment processing initiated'
              ),
              React.createElement(
                'th',
                null,
                'Payment processing completed'
              ),
              React.createElement(
                'th',
                null,
                'Payment processing status'
              )
            )
          ),
          React.createElement(
            'tbody',
            null,
            listItems
          )
        )
      ),
      React.createElement(
        'p',
        { className: 'company-stock-transaction-history-p-navigation' },
        navigationControls
      ),
      React.createElement(
        'form',
        { className: 'company-stock-transaction-history-form' },
        React.createElement(
          'label',
          { htmlFor: 'page_number' },
          'Page'
        ),
        React.createElement('input', { type: 'number', id: 'page_number', name: 'page_number', size: '5', min: '1', max: totalNumberOfPages, step: '1', onInput: handlePageNumberOnInput, ref: userInputPageNumberInputRef }),
        React.createElement('input', { type: 'button', value: 'Go to', onClick: handleGoToButtonOnClick })
      )
    );
  } else {
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        'div',
        { className: 'company-stock-transaction-history-div-display' },
        'No records to show.'
      ),
      React.createElement(
        'p',
        { className: 'company-stock-transaction-history-p-navigation' },
        '< 1 2 3 \u2026 (last page number) >'
      ),
      React.createElement(
        'form',
        { className: 'company-stock-transaction-history-form' },
        React.createElement(
          'label',
          { htmlFor: 'page_number' },
          'Page'
        ),
        React.createElement('input', { disabled: true, type: 'text', id: 'page_number', name: 'page_number', size: '5' }),
        React.createElement('input', { disabled: true, type: 'button', value: 'Go to' })
      )
    );
  }
}
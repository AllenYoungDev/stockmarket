'use strict';

//import React, { StrictMode } from "react";
//import { createRoot } from 'react-dom/client';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

import './settings/ServerUrls.js';
import './settings/dbMaximumNumberOfRowsReturned.js';
import './pageNavigationControlsGenerator.js';
import { fetchAccessTokenValidity } from './utilities/fetchAccessTokenValidity.js';
import { fetchTotalNumberOfUsers } from './utilities/fetchTotalNumberOfUsers.js';
import { fetchUserList } from './utilities/fetchUserList.js';
import { fetchTotalNumberOfTransactions } from './utilities/fetchTotalNumberOfTransactions.js';
import { fetchTransactionHistory } from './utilities/fetchTransactionHistory.js';
import { convertEpochTimeToLocalTimeString } from './utilities/convertEpochTimeToLocalTimeString.js';
import { handleLogoutOnClick } from './utilities/handleLogoutOnClick.js';
import { footer } from './footer.js';

/* *************************************************************************************************************
AdminAccountPage React component
************************************************************************************************************** */
export function AdminAccountPage() {
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

  console.log('AdminAccountPage() cookies on client:  ' + document.cookie + '.');

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
        { className: 'top-bar-center-column' },
        'Admin Page'
      ),
      React.createElement(
        'div',
        { className: 'top-bar-right-column' },
        React.createElement(MyAccountLogout, { loginState: loginState })
      )
    ),
    React.createElement(
      'section',
      { className: 'user-list-section' },
      React.createElement(
        'h1',
        { className: 'user-list-section-heading' },
        'User List'
      ),
      React.createElement(UserList, { loginState: loginState })
    ),
    React.createElement(
      'section',
      { className: 'transaction-list-section' },
      React.createElement(
        'h1',
        { className: 'transaction-list-section-heading' },
        'Transaction List'
      ),
      React.createElement(TransactionList, { loginState: loginState })
    ),
    footer()
  );
}

/* *************************************************************************************************************
MyAccountLogout React component
************************************************************************************************************** */

export function MyAccountLogout(_ref) {
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
          { href: window.frontendServerUrl + "/account.html", style: { textDecoration: 'none', color: 'rgb(255,255,255)' } },
          'My Account'
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
          { href: window.frontendServerUrl + "/account.html", style: { textDecoration: 'none', color: 'rgb(255,255,255)' } },
          'My Account'
        ),
        ' |\xA0',
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
              { href: window.frontendServerUrl + "/account.html", style: { textDecoration: 'none', color: 'rgb(255,255,255)' } },
              'My Account'
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
              { href: window.frontendServerUrl + "/account.html", style: { textDecoration: 'none', color: 'rgb(255,255,255)' } },
              'My Account'
            ),
            ' |\xA0',
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
UserList React component
************************************************************************************************************** */

export function UserList(_ref2) {
  var loginState = _ref2.loginState;

  var userListPageNumberInputRef = React.useRef(null);

  var _React$useState3 = React.useState(0),
      _React$useState4 = _slicedToArray(_React$useState3, 2),
      numberOfUsers = _React$useState4[0],
      setNumberOfUsers = _React$useState4[1];

  var _React$useState5 = React.useState(1),
      _React$useState6 = _slicedToArray(_React$useState5, 2),
      pageNumber = _React$useState6[0],
      setPageNumber = _React$useState6[1];

  var _React$useState7 = React.useState([]),
      _React$useState8 = _slicedToArray(_React$useState7, 2),
      userListPageData = _React$useState8[0],
      setUserListPageData = _React$useState8[1];

  // /GetTotalNumberOfUsers request.


  React.useEffect(function () {
    var ignore = false;
    setNumberOfUsers(0);

    fetchTotalNumberOfUsers(setNumberOfUsers, ignore);

    return function () {
      ignore = true;
    };
  }, [setNumberOfUsers]);

  // /GetUserList/:pageNumber request.
  React.useEffect(function () {
    var ignore = false;
    setUserListPageData([]);

    fetchUserList(pageNumber, setUserListPageData, ignore);

    return function () {
      ignore = true;
    };
  }, [pageNumber, setUserListPageData]);

  function handlePageNumberOnInput(event) {
    event.stopPropagation();
    if (!event.target.validity.valid) {
      event.target.value = '';
    }
  }

  function handleGoToButtonOnClick(event) {
    event.stopPropagation();

    var userInputPageNumber = userListPageNumberInputRef.current.value.trim();
    if (userInputPageNumber == pageNumber || userInputPageNumber === '' || userInputPageNumber < 1 || userInputPageNumber > numberOfUsers) {
      return;
    }

    setPageNumber(userInputPageNumber);
  }

  function handleNavigationLinkOnClick(event, navigationPageNumber) {
    event.preventDefault();
    event.stopPropagation();

    if (navigationPageNumber === 0) {
      return;
    }

    if (pageNumber !== navigationPageNumber) {
      setPageNumber(navigationPageNumber);
    }
  }

  if (loginState === 'admin-login') {
    console.log('UserList(), loginState === \'admin-login\', userListPageData:  ' + JSON.stringify(userListPageData) + '.');

    var listItems = userListPageData.map(function (userData) {
      return React.createElement(
        'tr',
        { key: userData["ID"] },
        React.createElement(
          'td',
          { key: userData["ID"] + "_0" },
          userData["ID"]
        ),
        React.createElement(
          'td',
          { key: userData["ID"] + "_1" },
          userData["First name"]
        ),
        React.createElement(
          'td',
          { key: userData["ID"] + "_2" },
          userData["Last name"]
        ),
        React.createElement(
          'td',
          { key: userData["ID"] + "_3" },
          userData["Email address"]
        ),
        React.createElement(
          'td',
          { key: userData["ID"] + "_4" },
          userData["Email address verified"]
        ),
        React.createElement(
          'td',
          { key: userData["ID"] + "_5" },
          userData["Phone number"]
        ),
        React.createElement(
          'td',
          { key: userData["ID"] + "_6" },
          userData["Admin"]
        ),
        React.createElement(
          'td',
          { key: userData["ID"] + "_7" },
          userData["User deleted"]
        )
      );
    });

    console.log('UserList(), loginState === \'admin-login\', listItems:  ' + listItems + '.');

    var totalNumberOfPages = Math.ceil(numberOfUsers / window.dbMaximumNumberOfRowsReturned);

    var navigationControls = window.generatePageNavigationControls(totalNumberOfPages, pageNumber, handleNavigationLinkOnClick, 'rgb(250,250,250)');

    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        'div',
        { className: 'user-list-div-display' },
        React.createElement(
          'table',
          { className: 'user-list-table' },
          React.createElement(
            'thead',
            null,
            React.createElement(
              'tr',
              null,
              React.createElement(
                'th',
                null,
                'User primary key'
              ),
              React.createElement(
                'th',
                null,
                'First name'
              ),
              React.createElement(
                'th',
                null,
                'Last name'
              ),
              React.createElement(
                'th',
                null,
                'Email address'
              ),
              React.createElement(
                'th',
                null,
                'Email address verified'
              ),
              React.createElement(
                'th',
                null,
                'Phone number'
              ),
              React.createElement(
                'th',
                null,
                'Admin'
              ),
              React.createElement(
                'th',
                null,
                'User deleted'
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
        { className: 'user-list-p-navigation' },
        navigationControls
      ),
      React.createElement(
        'form',
        { className: 'user-list-form' },
        React.createElement(
          'label',
          { htmlFor: 'user_list_page_number' },
          'Page'
        ),
        React.createElement('input', { type: 'number', id: 'user_list_page_number', name: 'user_list_page_number', size: '5', min: '1', max: totalNumberOfPages, step: '1', onInput: handlePageNumberOnInput, ref: userListPageNumberInputRef }),
        React.createElement('input', { type: 'button', value: 'Go to', onClick: handleGoToButtonOnClick })
      )
    );
  } else {
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        'div',
        { className: 'user-list-div-display' },
        'No records to show.'
      ),
      React.createElement(
        'p',
        { className: 'user-list-p-navigation' },
        '< 1 2 3 \u2026 (last page number) >'
      ),
      React.createElement(
        'form',
        { className: 'user-list-form' },
        React.createElement(
          'label',
          { htmlFor: 'user_list_page_number' },
          'Page'
        ),
        React.createElement('input', { disabled: true, type: 'number', id: 'user_list_page_number', name: 'user_list_page_number', size: '5' }),
        React.createElement('input', { disabled: true, type: 'button', value: 'Go to' })
      )
    );
  }
}

/* *************************************************************************************************************
TransactionList React component
************************************************************************************************************** */

export function TransactionList(_ref3) {
  var loginState = _ref3.loginState;

  var transactionListPageNumberInputRef = React.useRef(null);

  var _React$useState9 = React.useState(0),
      _React$useState10 = _slicedToArray(_React$useState9, 2),
      numberOfTransactions = _React$useState10[0],
      setNumberOfTransactions = _React$useState10[1];

  var _React$useState11 = React.useState(1),
      _React$useState12 = _slicedToArray(_React$useState11, 2),
      pageNumber = _React$useState12[0],
      setPageNumber = _React$useState12[1];

  var _React$useState13 = React.useState([]),
      _React$useState14 = _slicedToArray(_React$useState13, 2),
      transactionListPageData = _React$useState14[0],
      setTransactionListPageData = _React$useState14[1];

  // /GetTotalNumberOfTransactions request.


  React.useEffect(function () {
    var ignore = false;
    setNumberOfTransactions(0);

    fetchTotalNumberOfTransactions(setNumberOfTransactions, ignore);

    return function () {
      ignore = true;
    };
  }, [setNumberOfTransactions]);

  // /GetTransactionHistory/:pageNumber request.
  React.useEffect(function () {
    var ignore = false;
    setTransactionListPageData([]);

    fetchTransactionHistory(pageNumber, setTransactionListPageData, ignore);

    return function () {
      ignore = true;
    };
  }, [pageNumber, setTransactionListPageData]);

  function handlePageNumberOnInput(event) {
    event.stopPropagation();
    if (!event.target.validity.valid) {
      event.target.value = '';
    }
  }

  function handleGoToButtonOnClick(event) {
    event.stopPropagation();

    var userInputPageNumber = transactionListPageNumberInputRef.current.value.trim();
    if (userInputPageNumber == pageNumber || userInputPageNumber === '' || userInputPageNumber < 1 || userInputPageNumber > numberOfTransactions) {
      return;
    }

    setPageNumber(userInputPageNumber);
  }

  function handleNavigationLinkOnClick(event, navigationPageNumber) {
    event.preventDefault();
    event.stopPropagation();

    if (navigationPageNumber === 0) {
      return;
    }

    if (pageNumber !== navigationPageNumber) {
      setPageNumber(navigationPageNumber);
    }
  }

  if (loginState === 'admin-login') {
    console.log('TransactionList(), loginState === \'admin-login\', transactionListPageData:  ' + JSON.stringify(transactionListPageData) + '.');

    var listItems = transactionListPageData.map(function (userData) {
      return React.createElement(
        'tr',
        { key: userData["Primary key"] },
        React.createElement(
          'td',
          { key: userData["Primary key"] + "_1" },
          userData["User primary key"]
        ),
        React.createElement(
          'td',
          { key: userData["Primary key"] + "_2" },
          userData["Stock stats table entry primary key"]
        ),
        React.createElement(
          'td',
          { key: userData["Primary key"] + "_3" },
          convertEpochTimeToLocalTimeString(userData["Transaction start datetime"])
        ),
        React.createElement(
          'td',
          { key: userData["Primary key"] + "_4" },
          convertEpochTimeToLocalTimeString(userData["Transaction end datetime"])
        ),
        React.createElement(
          'td',
          { key: userData["Primary key"] + "_5" },
          userData["PayPal transaction (order) ID"]
        ),
        React.createElement(
          'td',
          { key: userData["Primary key"] + "_6" },
          userData["Company stock transaction ID"]
        ),
        React.createElement(
          'td',
          { key: userData["Primary key"] + "_7" },
          userData["Number of shares"]
        ),
        React.createElement(
          'td',
          { key: userData["Primary key"] + "_8" },
          userData["Payment processing initiated"]
        ),
        React.createElement(
          'td',
          { key: userData["Primary key"] + "_9" },
          userData["Payment processing completed"]
        ),
        React.createElement(
          'td',
          { key: userData["Primary key"] + "_10" },
          userData["Payment processing status"]
        )
      );
    });

    console.log('TransactionList(), loginState === \'admin-login\', listItems:  ' + listItems + '.');

    var totalNumberOfPages = Math.ceil(numberOfTransactions / window.dbMaximumNumberOfRowsReturned);

    var navigationControls = window.generatePageNavigationControls(totalNumberOfPages, pageNumber, handleNavigationLinkOnClick, '#36454F');

    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        'div',
        { className: 'transaction-list-div-display' },
        React.createElement(
          'table',
          { className: 'transaction-list-table' },
          React.createElement(
            'thead',
            null,
            React.createElement(
              'tr',
              null,
              React.createElement(
                'th',
                null,
                'User primary key'
              ),
              React.createElement(
                'th',
                null,
                'Stock stats table entry primary key'
              ),
              React.createElement(
                'th',
                null,
                'Transaction start datetime'
              ),
              React.createElement(
                'th',
                null,
                'Transaction end datetime'
              ),
              React.createElement(
                'th',
                null,
                'PayPal transaction (order) ID'
              ),
              React.createElement(
                'th',
                null,
                'Company stock transaction ID'
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
        { className: 'transaction-list-p-navigation' },
        navigationControls
      ),
      React.createElement(
        'form',
        { className: 'transaction-list-form' },
        React.createElement(
          'label',
          { htmlFor: 'transaction_history_page_number' },
          'Page'
        ),
        React.createElement('input', { type: 'number', id: 'transaction_history_page_number', name: 'transaction_history_page_number', size: '5', min: '1', max: totalNumberOfPages, step: '1', onInput: handlePageNumberOnInput, ref: transactionListPageNumberInputRef }),
        React.createElement('input', { type: 'button', value: 'Go to', onClick: handleGoToButtonOnClick })
      )
    );
  } else {
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        'div',
        { className: 'transaction-list-div-display' },
        'No records to show.'
      ),
      React.createElement(
        'p',
        { className: 'transaction-list-p-navigation' },
        '< 1 2 3 \u2026 (last page number) >'
      ),
      React.createElement(
        'form',
        { className: 'transaction-list-form' },
        React.createElement(
          'label',
          { htmlFor: 'transaction_history_page_number' },
          'Page'
        ),
        React.createElement('input', { disabled: true, type: 'number', id: 'transaction_history_page_number', name: 'transaction_history_page_number', size: '5' }),
        React.createElement('input', { disabled: true, type: 'button', value: 'Go to' })
      )
    );
  }
}
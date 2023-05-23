'use strict';

//import React, { StrictMode } from "react";
//import { createRoot } from 'react-dom/client';
//import { useState } from 'react';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

import './utilities/ServerUrl.js';
import { fetchAccessTokenValidity } from './utilities/fetchAccessTokenValidity.js';
import { fetchNumberOfCompanySharesOwnedByUser } from './utilities/fetchNumberOfCompanySharesOwnedByUser.js';
import { fetchCompanyStockData } from './utilities/fetchCompanyStockData.js';
import { navigateToCheckout } from './utilities/navigateToCheckout.js';
import { handleLogoutOnClick } from './utilities/handleLogoutOnClick.js';
import { footer } from './footer.js';

//import React from "react";
//import ReactDOM from "react-dom/client";

console.log('typeof React before import:  ' + (typeof React === 'undefined' ? 'undefined' : _typeof(React)) + '.');

/*
if (typeof React === 'undefined') {
  console.log(`Importing React...`)
  import("react").then(exports => {
      //do something with @exports...
      console.log(`typeof exports:  ${typeof exports}.`);
      globalThis.React = exports;
      console.log(`typeof React after import:  ${typeof React}.`);
  });
}

if (typeof ReactDOM === 'undefined') {
  import("react-dom/client").then(exports => {
      //do something with @exports...
      globalThis.ReactDOM = exports;
  });
}
*/

/* *************************************************************************************************************
HomePage React component
************************************************************************************************************** */
export function HomePage() {
  var _React$useState = React.useState(''),
      _React$useState2 = _slicedToArray(_React$useState, 2),
      loginState = _React$useState2[0],
      setLoginState = _React$useState2[1];
  //loginState can be 'fetch-error', 'no-login', 'admin-login', and 'non-admin-login'.

  var _React$useState3 = React.useState({ responseType: '', stockData: {} }),
      _React$useState4 = _slicedToArray(_React$useState3, 2),
      stockDataServerResponse = _React$useState4[0],
      setStockDataServerResponse = _React$useState4[1];
  //responseType can be 'fetch-error', 'server-error', and 'success'.

  // /CheckAccessTokenValidity route requestwindow.
  // If access token is valid, admin cookie check and retrieval on client


  React.useEffect(function () {
    var ignore = false;
    setLoginState('');

    fetchAccessTokenValidity(setLoginState, ignore);

    return function () {
      ignore = true;
    };
  }, [setLoginState]);

  // /GetCompanyStockData route request
  React.useEffect(function () {
    var ignore = false;

    function onTimeout() {
      console.log('/GetCompanyStockData route request onTimeout() function called!  ' + Date.now());

      setStockDataServerResponse({ responseType: '', stockData: {} });

      fetchCompanyStockData(setStockDataServerResponse, ignore);
    }

    console.log('/GetCompanyStockData route request before calling fetch() setTimeout()!  ' + Date.now());
    var timeoutId = setTimeout(onTimeout, 250);

    return function () {
      ignore = true;
      clearTimeout(timeoutId);
    };
  }, [setStockDataServerResponse]);

  console.log('HomePage() cookies on client:  ' + document.cookie + '.');

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      'div',
      { className: 'top-bar' },
      React.createElement(
        'div',
        { className: 'top-bar-left-column' },
        'Allen Young\'s Stockmarket Demo'
      ),
      React.createElement(
        'div',
        { className: 'top-bar-right-column' },
        React.createElement(RegisterLoginOrMyAccountAdminLogout, { loginState: loginState })
      )
    ),
    React.createElement(
      'section',
      null,
      React.createElement(
        'h1',
        { className: 'page-heading' },
        'Allen Young\'s Stockmarket Demo'
      ),
      React.createElement(
        'div',
        { className: 'page-heading-section' },
        React.createElement(
          'p',
          { style: { margin: 0 } },
          'For demonstrating Allen Young\'s frontend, backend, and full-stack web app development skills'
        ),
        React.createElement(
          'p',
          { style: { margin: 0 } },
          'About ',
          React.createElement(
            'a',
            { target: '_blank', rel: 'noopener noreferrer', href: 'https://AllenYoung.dev' },
            'AllenYoung.dev'
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'company-stock-stats-subsection' },
        React.createElement(CompanyStockStats, { stockDataServerResponse: stockDataServerResponse })
      ),
      React.createElement(
        'div',
        { className: 'login-or-register-subsection' },
        React.createElement(LoginOrRegister, { loginState: loginState })
      ),
      React.createElement(
        'div',
        { className: 'number-of-company-shares-i-own-subsection' },
        React.createElement(NumberOfCompanySharesOwnedByUser, { stockDataServerResponse: stockDataServerResponse })
      ),
      React.createElement(
        'div',
        { className: 'share-purchase-form-subsection' },
        React.createElement(SharePurchaseForm, { loginState: loginState, stockDataServerResponse: stockDataServerResponse })
      )
    ),
    React.createElement(
      'section',
      { className: 'faq-section' },
      React.createElement(
        'h2',
        { className: 'faq-section-h2' },
        'FAQ'
      ),
      React.createElement(
        'h3',
        { className: 'faq-section-h3', style: { marginTop: "0%" } },
        'What\'s the current Company ownership structure?'
      ),
      React.createElement(
        'p',
        { className: 'faq-section-p' },
        '...'
      ),
      React.createElement(
        'h3',
        { className: 'faq-section-h3' },
        'Can I return my purchased Company share(s) and get a refund?'
      ),
      React.createElement(
        'p',
        { className: 'faq-section-p' },
        '...'
      ),
      React.createElement(
        'h3',
        { className: 'faq-section-h3' },
        'What the Company share liquidation plan?'
      ),
      React.createElement(
        'p',
        { className: 'faq-section-p' },
        '...'
      ),
      React.createElement(
        'h3',
        { className: 'faq-section-h3' },
        'Shares outstanding vs. Treasury stock vs. Issued shares vs. Authorized capital vs. Unissued shares'
      ),
      React.createElement(
        'p',
        { className: 'faq-section-p' },
        '...'
      ),
      React.createElement(
        'h3',
        { className: 'faq-section-h3' },
        'Company stock liquidation options (current and post-IPO)'
      ),
      React.createElement(
        'p',
        { className: 'faq-section-p' },
        '...'
      ),
      React.createElement(
        'h3',
        { className: 'faq-section-h3' },
        'Investor risk warning'
      ),
      React.createElement(
        'p',
        { className: 'faq-section-p' },
        '...'
      ),
      React.createElement(
        'h3',
        { className: 'faq-section-h3' },
        'Terms and conditions'
      ),
      React.createElement(
        'p',
        { className: 'faq-section-p' },
        '...'
      ),
      React.createElement(
        'h3',
        { className: 'faq-section-h3' },
        'Fees'
      ),
      React.createElement(
        'p',
        { className: 'faq-section-p' },
        '...'
      ),
      React.createElement(
        'h3',
        { className: 'faq-section-h3' },
        'About Company'
      ),
      React.createElement(
        'p',
        { className: 'faq-section-p' },
        '...'
      ),
      React.createElement(
        'p',
        { className: 'faq-section-p', style: { marginBottom: 0, paddingBottom: "1%" } },
        'For inquiries and support requests, please send an email to ',
        React.createElement(
          'a',
          { href: 'mailto:support@allenyoung.dev' },
          'support@allenyoung.dev'
        ),
        '.'
      )
    ),
    footer()
  );
}

/* *************************************************************************************************************
RegisterLoginOrMyAccountAdminLogout React component
************************************************************************************************************** */

export function RegisterLoginOrMyAccountAdminLogout(_ref) {
  var loginState = _ref.loginState;


  console.log('RegisterLoginOrMyAccountAdminLogout() start.');
  console.log('RegisterLoginOrMyAccountAdminLogout() loginState prop value:  ' + loginState + '.');

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
          { href: window.frontendServerUrl + "/admin.html", style: { textDecoration: 'none', color: 'rgb(255,255,255)' } },
          'Admin'
        ),
        ' |\xA0',
        React.createElement(
          'a',
          { className: 'logout', href: '', onClick: handleLogoutOnClick, style: { textDecoration: 'none', color: 'rgb(255,255,255)' } },
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
          { className: 'logout', href: '', onClick: handleLogoutOnClick, style: { textDecoration: 'none', color: 'rgb(255,255,255)' } },
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
              { href: window.frontendServerUrl + "/admin.html", style: { textDecoration: 'none', color: 'rgb(255,255,255)' } },
              'Admin'
            ),
            ' |\xA0',
            React.createElement(
              'a',
              { className: 'logout', href: '', onClick: handleLogoutOnClick, style: { textDecoration: 'none', color: 'rgb(255,255,255)' } },
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
              { className: 'logout', href: '', onClick: handleLogoutOnClick, style: { textDecoration: 'none', color: 'rgb(255,255,255)' } },
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
    //return null;
  }
}

/* *************************************************************************************************************
CompanyStockStats React component
************************************************************************************************************** */

export function CompanyStockStats(_ref2) {
  var stockDataServerResponse = _ref2.stockDataServerResponse;

  switch (stockDataServerResponse['responseType']) {
    case 'fetch-error':
      return React.createElement(
        'div',
        null,
        'Network error.  Please retry later.'
      );
    case 'server-error':
      return React.createElement(
        'div',
        null,
        'Server error.  Please retry later.'
      );
    case 'success':
      var stockData = stockDataServerResponse['stockData'];

      return React.createElement(
        React.Fragment,
        null,
        React.createElement(
          'p',
          { className: 'company-stock-stats-subsection-paragraph' },
          'Current Company valuation:  US$',
          stockData[0].toLocaleString()
        ),
        React.createElement('br', null),
        React.createElement(
          'p',
          { className: 'company-stock-stats-subsection-paragraph' },
          'Number of authorized Company shares:  ',
          stockData[1].toLocaleString()
        ),
        React.createElement('br', null),
        React.createElement(
          'p',
          { className: 'company-stock-stats-subsection-paragraph' },
          'Number of issued Company shares:  ',
          stockData[2].toLocaleString(),
          ' (',
          stockData[2] / stockData[1] * 100,
          '% of total)'
        ),
        React.createElement(
          'p',
          { className: 'company-stock-stats-subsection-paragraph' },
          'Number of outstanding Company shares:  ',
          stockData[3].toLocaleString(),
          ' (',
          stockData[3] / stockData[1] * 100,
          '% of total)'
        ),
        React.createElement('br', null),
        React.createElement(
          'p',
          { className: 'company-stock-stats-subsection-paragraph' },
          'Number of Company shares available for purchase: ',
          stockData[4].toLocaleString(),
          ' (',
          stockData[4] / stockData[1] * 100,
          '% of total)'
        ),
        React.createElement(
          'p',
          { className: 'company-stock-stats-subsection-paragraph' },
          'Price per share:  US$',
          stockData[5].toLocaleString()
        ),
        React.createElement(
          'p',
          { className: 'company-stock-stats-subsection-paragraph' },
          'Cash value of the shares available for purchase:  US$',
          stockData[6].toLocaleString()
        )
      );
    default:
      return React.createElement(
        'div',
        null,
        React.createElement(
          'p',
          { className: 'company-stock-stats-subsection-paragraph' },
          'Current Company valuation:  ',
          React.createElement(
            'span',
            { style: { opacity: 0.6 } },
            '(Inquiring)'
          )
        ),
        React.createElement('br', null),
        React.createElement(
          'p',
          { className: 'company-stock-stats-subsection-paragraph' },
          'Number of authorized Company shares:  ',
          React.createElement(
            'span',
            { style: { opacity: 0.6 } },
            '(Inquiring)'
          )
        ),
        React.createElement('br', null),
        React.createElement(
          'p',
          { className: 'company-stock-stats-subsection-paragraph' },
          'Number of issued Company shares:  ',
          React.createElement(
            'span',
            { style: { opacity: 0.6 } },
            '(Inquiring)'
          )
        ),
        React.createElement(
          'p',
          { className: 'company-stock-stats-subsection-paragraph' },
          'Number of outstanding Company shares:  ',
          React.createElement(
            'span',
            { style: { opacity: 0.6 } },
            '(Inquiring)'
          )
        ),
        React.createElement('br', null),
        React.createElement(
          'p',
          { className: 'company-stock-stats-subsection-paragraph' },
          'Number of Company shares available for purchase:  ',
          React.createElement(
            'span',
            { style: { opacity: 0.6 } },
            '(Inquiring)'
          )
        ),
        React.createElement(
          'p',
          { className: 'company-stock-stats-subsection-paragraph' },
          'Price per share:  ',
          React.createElement(
            'span',
            { style: { opacity: 0.6 } },
            '(Inquiring)'
          )
        ),
        React.createElement(
          'p',
          { className: 'company-stock-stats-subsection-paragraph' },
          'Cash value of the shares available for purchase:  ',
          React.createElement(
            'span',
            { style: { opacity: 0.6 } },
            '(Inquiring)'
          )
        )
      );
  }
}

/* *************************************************************************************************************
LoginOrRegister React component
************************************************************************************************************** */

export function LoginOrRegister(_ref3) {
  var loginState = _ref3.loginState;

  switch (loginState) {
    case 'fetch-error':
      return React.createElement(
        React.Fragment,
        null,
        'Network error.  Please retry later.'
      );
    case 'no-login':
      return React.createElement(
        React.Fragment,
        null,
        React.createElement(
          'a',
          { href: window.frontendServerUrl + "/login.html", style: { color: 'rgb(255,255,255)' } },
          'Login'
        ),
        '\xA0or\xA0',
        React.createElement(
          'a',
          { href: window.frontendServerUrl + "/registration.html", style: { color: 'rgb(255,255,255)' } },
          'register'
        ),
        ' to buy Company stocks'
      );
    case 'admin-login':
      return null;
    case 'non-admin-login':
      return null;
    default:
      /* The following is for doing better or smooth rendering. Refer to the "Better rendering methods"
         section in the developer's journal.  */
      if (document.cookie.includes('accessToken=')) {
        return null;
      } else {
        return React.createElement(
          React.Fragment,
          null,
          React.createElement(
            'a',
            { href: window.frontendServerUrl + "/login.html", style: { color: 'rgb(255,255,255)' } },
            'Login'
          ),
          '\xA0or\xA0',
          React.createElement(
            'a',
            { href: window.frontendServerUrl + "/registration.html", style: { color: 'rgb(255,255,255)' } },
            'register'
          ),
          ' to buy Company stocks'
        );
      }
  }
}

/* *************************************************************************************************************
NumberOfCompanySharesOwnedByUser React component
************************************************************************************************************** */

export function NumberOfCompanySharesOwnedByUser(_ref4) {
  var stockDataServerResponse = _ref4.stockDataServerResponse;

  var _React$useState5 = React.useState({ responseStatus: 0, responseBody: '' }),
      _React$useState6 = _slicedToArray(_React$useState5, 2),
      responseStatusBody = _React$useState6[0],
      setResponseStatusBody = _React$useState6[1];

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

  if (stockDataServerResponse['responseType'] === 'success') {
    var stockData = stockDataServerResponse['stockData'];
    var numberOfCompanySharesOwned = Number(responseStatusBody['responseBody']);
    var numberOfAuthorizedShares = Number(stockData[1]);
  } else {
    return React.createElement(
      'div',
      { style: { opacity: 0.6 } },
      React.createElement(
        'p',
        { style: { marginBottom: 0 } },
        'Number of Company shares I own:'
      ),
      React.createElement(
        'p',
        { style: { marginTop: 0 } },
        '(% of the authorized Company shares)'
      )
    );
  }

  switch (responseStatusBody['responseStatus']) {
    case -1:
      //'fetch-error'
      return React.createElement(
        'div',
        null,
        'Network error.  Please retry later.'
      );
    case 200:
      return React.createElement(
        'div',
        null,
        React.createElement(
          'p',
          { style: { marginBottom: 0 } },
          'Number of Company shares I own:  ',
          numberOfCompanySharesOwned
        ),
        React.createElement(
          'p',
          { style: { marginTop: 0 } },
          '(',
          numberOfCompanySharesOwned / numberOfAuthorizedShares * 100,
          '% of the authorized Company shares)'
        )
      );
    case 500:
      return React.createElement(
        'div',
        null,
        'Server error.  Please retry later.'
      );
    default:
      //responseStatus 0 and 400
      return React.createElement(
        'div',
        { style: { opacity: 0.6 } },
        React.createElement(
          'p',
          { style: { marginBottom: 0 } },
          'Number of Company shares I own:'
        ),
        React.createElement(
          'p',
          { style: { marginTop: 0 } },
          '(% of the authorized Company shares)'
        )
      );
  }
}

/* *************************************************************************************************************
SharePurchaseForm React component
************************************************************************************************************** */

export function SharePurchaseForm(_ref5) {
  var loginState = _ref5.loginState,
      stockDataServerResponse = _ref5.stockDataServerResponse;

  var numberOfSharesToBuyInputRef = React.useRef(null);
  var errorNoticeDomNodeRef = React.useRef(null);

  var _React$useState7 = React.useState(''),
      _React$useState8 = _slicedToArray(_React$useState7, 2),
      priceOfCompanySharesToBuyString = _React$useState8[0],
      setPriceOfCompanySharesToBuyString = _React$useState8[1];

  var numberOfSharesToBuy = 1;

  function handleOnInput(event) {
    console.log('SharePurchaseForm() in handleOnInput().');
    event.stopPropagation();
    console.log('SharePurchaseForm() in handleOnInput(), event.target.value:  ' + event.target.value + '.');
    if (event.target.validity.valid) {
      console.log('SharePurchaseForm() in handleOnInput(), event.target.validity.valid.');
      console.log('SharePurchaseForm() in handleOnInput(), event.target.value:  ' + event.target.value + '.');

      if (event.target.value === null || event.target.value === '') {
        event.preventDefault();
        event.target.value === '';
        return;
      }

      numberOfSharesToBuy = Number(event.target.value);
      setPriceOfCompanySharesToBuyString('US$' + String(pricePerShare * numberOfSharesToBuy));
    } else {
      console.log('SharePurchaseForm() in handleOnInput(), !event.target.validity.valid.');
      console.log('SharePurchaseForm() in handleOnInput(), event.target.value:  ' + event.target.value + '.');
      setPriceOfCompanySharesToBuyString('');
      event.target.value = '';
    }
  }

  function handleOnClick(event) {
    console.log("SharePurchaseForm handleOnClick() start.");

    event.stopPropagation();

    errorNoticeDomNodeRef.current.innerHTML = '';

    /* ************************************************************************************************
    Input validation
    ************************************************************************************************ */
    numberOfSharesToBuy = numberOfSharesToBuyInputRef.current.value.trim();
    console.log('SharePurchaseForm handleOnClick() numberOfSharesToBuy:  ' + numberOfSharesToBuy + '.');
    if (numberOfSharesToBuy == '') {
      console.log('SharePurchaseForm handleOnClick() setting errorNoticeDomNodeRef.current.innerHTML.');
      errorNoticeDomNodeRef.current.innerHTML = "Unable to proceed to checkout.  You need to enter a number of shares to buy.  Please correct and try again.";
      return;
    }

    /* ************************************************************************************************
    Fetch /Checkout
    ************************************************************************************************ */
    //fetchCheckout(numberOfSharesToBuy, errorNoticeDomNodeRef);
    navigateToCheckout(numberOfSharesToBuy);
  }

  var pricePerShare = 0;
  var stockData;
  if (stockDataServerResponse['responseType'] === 'success') {
    stockData = stockDataServerResponse['stockData'];
    pricePerShare = Number(stockData[5]);
  }

  if (loginState === 'fetch-error' || stockDataServerResponse['responseType'] === 'fetch-error') {
    return React.createElement(
      React.Fragment,
      null,
      'Network error.  Please retry later.'
    );
  } else if (stockDataServerResponse['responseType'] === 'server-error') {
    return React.createElement(
      React.Fragment,
      null,
      'Server error.  Please retry later.'
    );
  } else if (loginState === 'non-admin-login' && stockDataServerResponse['responseType'] === 'success') {
    return React.createElement(
      'div',
      null,
      React.createElement(
        'form',
        { className: 'share-purchase-form', style: { margin: 0 } },
        React.createElement(
          'label',
          { className: 'share-purchase-form-label', htmlFor: 'number_of_shares_to_buy' },
          'Number of Company shares to buy:'
        ),
        React.createElement('input', { className: 'share-purchase-form-input', type: 'number', id: 'number_of_shares_to_buy', name: 'numberOfSharesToBuy', size: '5', min: '1', step: '1', onInput: handleOnInput, ref: numberOfSharesToBuyInputRef }),
        React.createElement('br', null),
        React.createElement(
          'p',
          { className: 'share-purchase-form-paragraph', style: { margin: 0 } },
          'Price of Company shares to buy:  ',
          priceOfCompanySharesToBuyString
        ),
        React.createElement('p', { className: 'proceed-to-checkout-error-notice', role: 'error-notice', ref: errorNoticeDomNodeRef }),
        React.createElement('input', { type: 'button', value: 'Proceed to checkout', className: 'proceed-to-checkout-button-input', onClick: handleOnClick })
      )
    );
  } else {
    return React.createElement(
      'div',
      { style: { opacity: 0.6 } },
      React.createElement(
        'form',
        { className: 'share-purchase-form', style: { margin: 0 } },
        React.createElement(
          'label',
          { className: 'share-purchase-form-label', htmlFor: 'number_of_shares_to_buy' },
          'Number of Company shares to buy:'
        ),
        React.createElement('input', { className: 'share-purchase-form-input', disabled: true, type: 'number', id: 'number_of_shares_to_buy', name: 'numberOfSharesToBuy', size: '5', min: '1', step: '1', onInput: handleOnInput, ref: numberOfSharesToBuyInputRef }),
        React.createElement('br', null),
        React.createElement(
          'p',
          { className: 'share-purchase-form-paragraph', style: { margin: 0 } },
          'Price of Company shares to buy:'
        ),
        React.createElement('p', { className: 'proceed-to-checkout-error-notice', role: 'error-notice', ref: errorNoticeDomNodeRef }),
        React.createElement('input', { disabled: true, type: 'button', value: 'Proceed to checkout', className: 'proceed-to-checkout-button-input', onClick: handleOnClick })
      )
    );
  }
}
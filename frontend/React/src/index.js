'use strict';

//import React, { StrictMode } from "react";
//import { createRoot } from 'react-dom/client';
//import { useState } from 'react';

import './settings/ServerUrls.js';
import {fetchAccessTokenValidity} from './utilities/fetchAccessTokenValidity.js';
import {fetchNumberOfCompanySharesOwnedByUser} from './utilities/fetchNumberOfCompanySharesOwnedByUser.js';
import {fetchCompanyStockData} from './utilities/fetchCompanyStockData.js';
import {navigateToCheckout} from './utilities/navigateToCheckout.js';
import {handleLogoutOnClick} from './utilities/handleLogoutOnClick.js';
import {footer} from './footer.js';

//import React from "react";
//import ReactDOM from "react-dom/client";

console.log(`typeof React before import:  ${typeof React}.`);

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
  const [loginState, setLoginState] = React.useState('');
    //loginState can be 'fetch-error', 'no-login', 'admin-login', and 'non-admin-login'.

  var [stockDataServerResponse, setStockDataServerResponse] = React.useState({responseType: '', stockData: {}})
    //responseType can be 'fetch-error', 'server-error', and 'success'.

  // /CheckAccessTokenValidity route requestwindow.
  // If access token is valid, admin cookie check and retrieval on client
  React.useEffect(() => {
    let ignore = false;
    setLoginState('');

    fetchAccessTokenValidity(setLoginState, ignore);

    return () => {
      ignore = true;
    }
  }, [setLoginState]);

  // /GetCompanyStockData route request
  React.useEffect(() => {
    let ignore = false;

    function onTimeout() {
      console.log('/GetCompanyStockData route request onTimeout() function called!  ' + Date.now())

      setStockDataServerResponse({responseType: '', stockData: {}});

      fetchCompanyStockData(setStockDataServerResponse, ignore);
    }

    console.log('/GetCompanyStockData route request before calling fetch() setTimeout()!  ' + Date.now())
    const timeoutId = setTimeout(onTimeout, 250);

    return () => {
      ignore = true;
      clearTimeout(timeoutId);
    }
  }, [setStockDataServerResponse]);

  console.log(`HomePage() cookies on client:  ${document.cookie}.`)

  return (
    <React.Fragment>
    <div className="top-bar">
    <div className="top-bar-left-column">Allen Young's Stockmarket Demo</div>
    <div className="top-bar-right-column">
    <RegisterLoginOrMyAccountAdminLogout loginState={loginState} />
    </div>
    </div>
    
    <section>
    <h1 className="page-heading">Allen Young's Stockmarket Demo</h1>

    <div className="page-heading-section">
    <p style={{margin: 0}}>For demonstrating Allen Young's frontend, backend, and full-stack web app development skills</p>
    <p style={{margin: 0}}>About <a target="_blank" rel="noopener noreferrer" href="https://AllenYoung.dev">AllenYoung.dev</a></p>
    </div>

    <div className="company-stock-stats-subsection"><CompanyStockStats stockDataServerResponse={stockDataServerResponse} /></div>

    <div className="login-or-register-subsection"><LoginOrRegister loginState={loginState} /></div>

    <div className="number-of-company-shares-i-own-subsection"><NumberOfCompanySharesOwnedByUser stockDataServerResponse={stockDataServerResponse} /></div>

    <div className="share-purchase-form-subsection"><SharePurchaseForm loginState={loginState} stockDataServerResponse={stockDataServerResponse} /></div>

    </section>

    <section className="faq-section">
    <h2 className="faq-section-h2">FAQ</h2>

    <h3 className="faq-section-h3" style={{marginTop: "0%"}}>What's the current Company ownership structure?</h3>
    <p className="faq-section-p">...</p>

    <h3 className="faq-section-h3">Can I return my purchased Company share(s) and get a refund?</h3>
    <p className="faq-section-p">...</p>

    <h3 className="faq-section-h3">What the Company share liquidation plan?</h3>
    <p className="faq-section-p">...</p>

    <h3 className="faq-section-h3">Shares outstanding vs. Treasury stock vs. Issued shares vs. Authorized capital vs. Unissued shares</h3>
    <p className="faq-section-p">...</p>

    <h3 className="faq-section-h3">Company stock liquidation options (current and post-IPO)</h3>
    <p className="faq-section-p">...</p>

    <h3 className="faq-section-h3">Investor risk warning</h3>
    <p className="faq-section-p">...</p>

    <h3 className="faq-section-h3">Terms and conditions</h3>
    <p className="faq-section-p">...</p>

    <h3 className="faq-section-h3">Fees</h3>
    <p className="faq-section-p">...</p>

    <h3 className="faq-section-h3">About Company</h3>
    <p className="faq-section-p">...</p>

    <p className="faq-section-p" style={{marginBottom: 0, paddingBottom: "1%"}}>For inquiries and support requests, please send an email to <a href="mailto:support@allenyoung.dev">support@allenyoung.dev</a>.</p>
    </section>

    {footer()}
    </React.Fragment>
  );
}

/* *************************************************************************************************************
RegisterLoginOrMyAccountAdminLogout React component
************************************************************************************************************** */

export function RegisterLoginOrMyAccountAdminLogout({ loginState }) {

  console.log(`RegisterLoginOrMyAccountAdminLogout() start.`)
  console.log(`RegisterLoginOrMyAccountAdminLogout() loginState prop value:  ${loginState}.`)

  switch (loginState) {
    case 'fetch-error':
      return <div>Network error.  Please retry later.</div>;
    case 'no-login':
      return (
        <React.Fragment>
        <a href={window.frontendServerUrl + "/registration.html"} style={{textDecoration:'none', color: 'rgb(255,255,255)'}}>
          Register</a> |&nbsp;
        <a href={window.frontendServerUrl + "/login.html"} style={{textDecoration:'none', color: 'rgb(255,255,255)'}}>Login</a>
        </React.Fragment>
        );    
    case 'admin-login':
      return (
        <React.Fragment>
        <a href={window.frontendServerUrl + "/account.html"} style={{textDecoration:'none', color: 'rgb(255,255,255)'}}>My Account</a> |&nbsp;
        <a href={window.frontendServerUrl + "/admin.html"} style={{textDecoration:'none', color: 'rgb(255,255,255)'}}>Admin</a> |&nbsp;
        <a className="logout" href="" onClick={handleLogoutOnClick} style={{textDecoration:'none', color: 'rgb(255,255,255)'}}>Logout</a>
        </React.Fragment>
        );
    case 'non-admin-login':
      return (
        <React.Fragment>
        <a href={window.frontendServerUrl + "/account.html"} style={{textDecoration:'none', color: 'rgb(255,255,255)'}}>My Account</a> |&nbsp; 
        <a className="logout" href="" onClick={handleLogoutOnClick} style={{textDecoration:'none', color: 'rgb(255,255,255)'}}>Logout</a>
        </React.Fragment>
        );
    default:
      /* The following is for doing better or smooth rendering. Refer to the "Better rendering methods"
         section in the developer's journal.  */
      if (document.cookie.includes('accessToken=')) {
        if (document.cookie.includes('admin=true')) {
          return (
            <React.Fragment>
            <a href={window.frontendServerUrl + "/account.html"} style={{textDecoration:'none', color: 'rgb(255,255,255)'}}>My Account</a> |&nbsp;
            <a href={window.frontendServerUrl + "/admin.html"} style={{textDecoration:'none', color: 'rgb(255,255,255)'}}>Admin</a> |&nbsp;
            <a className="logout" href="" onClick={handleLogoutOnClick} style={{textDecoration:'none', color: 'rgb(255,255,255)'}}>Logout</a>
            </React.Fragment>
            );
        } else {
          return (
            <React.Fragment>
            <a href={window.frontendServerUrl + "/account.html"} style={{textDecoration:'none', color: 'rgb(255,255,255)'}}>My Account</a> |&nbsp; 
            <a className="logout" href="" onClick={handleLogoutOnClick} style={{textDecoration:'none', color: 'rgb(255,255,255)'}}>Logout</a>
            </React.Fragment>
            );
        }
      } else {
        return (
          <React.Fragment>
          <a href={window.frontendServerUrl + "/registration.html"} style={{textDecoration:'none', color: 'rgb(255,255,255)'}}>
            Register</a> |&nbsp;
          <a href={window.frontendServerUrl + "/login.html"} style={{textDecoration:'none', color: 'rgb(255,255,255)'}}>Login</a>
          </React.Fragment>
          );    
      }
      //return null;
  }
}


/* *************************************************************************************************************
CompanyStockStats React component
************************************************************************************************************** */

export function CompanyStockStats({stockDataServerResponse}) {
  switch (stockDataServerResponse['responseType']) {
    case 'fetch-error':
      return <div>Network error.  Please retry later.</div>;
      case 'server-error':
        return <div>Server error.  Please retry later.</div>;      
    case 'success':
      let stockData = stockDataServerResponse['stockData']

      return (
        <React.Fragment>
          <p className="company-stock-stats-subsection-paragraph">Current Company valuation:  US${stockData[0].toLocaleString()}</p><br />
          <p className="company-stock-stats-subsection-paragraph">Number of authorized Company shares:  {stockData[1].toLocaleString()}</p><br />
          <p className="company-stock-stats-subsection-paragraph">Number of issued Company shares:  {stockData[2].toLocaleString()} ({stockData[2] / stockData[1] * 100}% of total)</p>
          <p className="company-stock-stats-subsection-paragraph">Number of outstanding Company shares:  {stockData[3].toLocaleString()} ({stockData[3] / stockData[1] * 100}% of total)</p><br />
          <p className="company-stock-stats-subsection-paragraph">Number of Company shares available for purchase: {stockData[4].toLocaleString()} ({stockData[4] / stockData[1] * 100}% of total)</p>
          <p className="company-stock-stats-subsection-paragraph">Price per share:  US${stockData[5].toLocaleString()}</p>
          <p className="company-stock-stats-subsection-paragraph">Cash value of the shares available for purchase:  US${stockData[6].toLocaleString()}</p>
        </React.Fragment>
        );    
    default:
      return (
        <div>
          <p className="company-stock-stats-subsection-paragraph">Current Company valuation:  <span style={{opacity: 0.6}}>(Inquiring)</span></p><br />
          <p className="company-stock-stats-subsection-paragraph">Number of authorized Company shares:  <span style={{opacity: 0.6}}>(Inquiring)</span></p><br />
          <p className="company-stock-stats-subsection-paragraph">Number of issued Company shares:  <span style={{opacity: 0.6}}>(Inquiring)</span></p>
          <p className="company-stock-stats-subsection-paragraph">Number of outstanding Company shares:  <span style={{opacity: 0.6}}>(Inquiring)</span></p><br />
          <p className="company-stock-stats-subsection-paragraph">Number of Company shares available for purchase:  <span style={{opacity: 0.6}}>(Inquiring)</span></p>
          <p className="company-stock-stats-subsection-paragraph">Price per share:  <span style={{opacity: 0.6}}>(Inquiring)</span></p>
          <p className="company-stock-stats-subsection-paragraph">Cash value of the shares available for purchase:  <span style={{opacity: 0.6}}>(Inquiring)</span></p>
        </div>
        );   
  }
}


/* *************************************************************************************************************
LoginOrRegister React component
************************************************************************************************************** */

export function LoginOrRegister({ loginState }) {
  switch (loginState) {
    case 'fetch-error':
      return <React.Fragment>Network error.  Please retry later.</React.Fragment>;
    case 'no-login':
      return (
        <React.Fragment>
        <a href={window.frontendServerUrl + "/login.html"} style={{color: 'rgb(255,255,255)'}}>Login</a>
        &nbsp;or&nbsp;
        <a href={window.frontendServerUrl + "/registration.html"} style={{color: 'rgb(255,255,255)'}}>
          register</a> to buy Company stocks
        </React.Fragment>
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
        return (
          <React.Fragment>
          <a href={window.frontendServerUrl + "/login.html"} style={{color: 'rgb(255,255,255)'}}>Login</a>
          &nbsp;or&nbsp;
          <a href={window.frontendServerUrl + "/registration.html"} style={{color: 'rgb(255,255,255)'}}>
            register</a> to buy Company stocks
          </React.Fragment>
          );    
      }
  }
}

/* *************************************************************************************************************
NumberOfCompanySharesOwnedByUser React component
************************************************************************************************************** */

export function NumberOfCompanySharesOwnedByUser({stockDataServerResponse}) {
  const [responseStatusBody, setResponseStatusBody] = React.useState({responseStatus: 0, responseBody: ''});

  // /fetchNumberOfCompanySharesOwnedByUser route request
  // If access token is valid, admin cookie check and retrieval on client
  React.useEffect(() => {
    let ignore = false;

    setResponseStatusBody({responseStatus: 0, responseBody: ''});

    fetchNumberOfCompanySharesOwnedByUser(setResponseStatusBody, ignore);

    return () => {
      ignore = true;
    }
  }, [setResponseStatusBody]);

  if (stockDataServerResponse['responseType'] === 'success') {
    var stockData = stockDataServerResponse['stockData'];
    var numberOfCompanySharesOwned = Number(responseStatusBody['responseBody']);
    var numberOfAuthorizedShares = Number(stockData[1]);
  } else {
    return (
      <div style={{opacity: 0.6}}>
      <p style={{marginBottom: 0}}>Number of Company shares I own:</p>
      <p style={{marginTop: 0}}>(% of the authorized Company shares)</p>
      </div>
      ); 
  }
  
  switch (responseStatusBody['responseStatus']) {
    case -1: //'fetch-error'
      return <div>Network error.  Please retry later.</div>;
    case 200:
      return (
        <div>
        <p style={{marginBottom: 0}}>Number of Company shares I own:  {numberOfCompanySharesOwned}</p>
        <p style={{marginTop: 0}}>({numberOfCompanySharesOwned / numberOfAuthorizedShares * 100}% of the authorized Company shares)</p>
        </div>
        );    
    case 500:
      return <div>Server error.  Please retry later.</div>;
    default: //responseStatus 0 and 400
      return (
        <div style={{opacity: 0.6}}>
        <p style={{marginBottom: 0}}>Number of Company shares I own:</p>
        <p style={{marginTop: 0}}>(% of the authorized Company shares)</p>
        </div>
        );
  }
}

/* *************************************************************************************************************
SharePurchaseForm React component
************************************************************************************************************** */

export function SharePurchaseForm({ loginState, stockDataServerResponse }) {
  const numberOfSharesToBuyInputRef = React.useRef(null);
  const errorNoticeDomNodeRef = React.useRef(null);

  const [priceOfCompanySharesToBuyString, setPriceOfCompanySharesToBuyString] = React.useState('');

  var numberOfSharesToBuy = 1;

  function handleOnInput(event) {
    console.log('SharePurchaseForm() in handleOnInput().')
    event.stopPropagation();
    console.log(`SharePurchaseForm() in handleOnInput(), event.target.value:  ${event.target.value}.`)
    if (event.target.validity.valid) {
      console.log('SharePurchaseForm() in handleOnInput(), event.target.validity.valid.')
      console.log(`SharePurchaseForm() in handleOnInput(), event.target.value:  ${event.target.value}.`)

      if(event.target.value === null || event.target.value === '') {
        event.preventDefault();
        event.target.value === '';
        return;
      }

      numberOfSharesToBuy = Number(event.target.value);
      setPriceOfCompanySharesToBuyString('US$' + String(pricePerShare * numberOfSharesToBuy));
    } else {
      console.log('SharePurchaseForm() in handleOnInput(), !event.target.validity.valid.')
      console.log(`SharePurchaseForm() in handleOnInput(), event.target.value:  ${event.target.value}.`)
      setPriceOfCompanySharesToBuyString('');
      event.target.value='';
    }
  }

  function handleOnClick(event) {
    console.log("SharePurchaseForm handleOnClick() start.")

    event.stopPropagation();

    errorNoticeDomNodeRef.current.innerHTML = ''  

    /* ************************************************************************************************
    Input validation
    ************************************************************************************************ */
    numberOfSharesToBuy = numberOfSharesToBuyInputRef.current.value.trim();
    console.log(`SharePurchaseForm handleOnClick() numberOfSharesToBuy:  ${numberOfSharesToBuy}.`)
    if(numberOfSharesToBuy == '') {
      console.log(`SharePurchaseForm handleOnClick() setting errorNoticeDomNodeRef.current.innerHTML.`)
      errorNoticeDomNodeRef.current.innerHTML = "Unable to proceed to checkout.  You need to enter a number of shares to buy.  Please correct and try again."
      return
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
    return <React.Fragment>Network error.  Please retry later.</React.Fragment>;
  } else if (stockDataServerResponse['responseType'] === 'server-error') {
    return <React.Fragment>Server error.  Please retry later.</React.Fragment>;
  } else if (loginState === 'non-admin-login' && stockDataServerResponse['responseType'] === 'success') {
    return (
      <div>
      <form className="share-purchase-form" style={{margin: 0}}>
      <label className="share-purchase-form-label" htmlFor="number_of_shares_to_buy">Number of Company shares to buy:</label>
      <input className="share-purchase-form-input" type="number" id="number_of_shares_to_buy" name="numberOfSharesToBuy" size="5" min="1" step="1" onInput={handleOnInput} ref={numberOfSharesToBuyInputRef} /><br />
      <p className="share-purchase-form-paragraph" style={{margin: 0}}>Price of Company shares to buy:  {priceOfCompanySharesToBuyString}</p>
      <p className="proceed-to-checkout-error-notice" role="error-notice" ref={errorNoticeDomNodeRef}></p>
      <input type="button" value="Proceed to checkout" className="proceed-to-checkout-button-input" onClick={handleOnClick} />
      </form>
      </div>
    );
  } else {
    return (
      <div style={{opacity: 0.6}}>
      <form className="share-purchase-form" style={{margin: 0}}>
      <label className="share-purchase-form-label" htmlFor="number_of_shares_to_buy">Number of Company shares to buy:</label>
      <input className="share-purchase-form-input" disabled type="number" id="number_of_shares_to_buy" name="numberOfSharesToBuy" size="5" min="1" step="1" onInput={handleOnInput} ref={numberOfSharesToBuyInputRef} /><br />
      <p className="share-purchase-form-paragraph" style={{margin: 0}}>Price of Company shares to buy:</p>
      <p className="proceed-to-checkout-error-notice" role="error-notice" ref={errorNoticeDomNodeRef}></p>
      <input disabled type="button" value="Proceed to checkout" className="proceed-to-checkout-button-input" onClick={handleOnClick} />
      </form>
      </div>
    );
  }
}
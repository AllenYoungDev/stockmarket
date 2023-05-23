'use strict';

//import React, { StrictMode } from "react";
//import { createRoot } from 'react-dom/client';

import { validateEmail } from './utilities/validators.js';
import './utilities/ServerUrl.js';
import './utilities/dbMaximumNumberOfRowsReturned.js';
import './pageNavigationControlsGenerator.js';
import {fetchAccessTokenValidity} from './utilities/fetchAccessTokenValidity.js';
import {fetchNumberOfCompanySharesOwnedByUser} from './utilities/fetchNumberOfCompanySharesOwnedByUser.js';
import {fetchUpdateUserAccountSettings} from './utilities/fetchUpdateUserAccountSettings.js';
import {fetchNumberOfUserStockTransactions} from './utilities/fetchNumberOfUserStockTransactions.js';
import {fetchUserStockTransactionHistory} from './utilities/fetchUserStockTransactionHistory.js';
import {useUserAccountSettings} from './utilities/useUserAccountSettings.js';
import {convertEpochTimeToLocalTimeString} from './utilities/convertEpochTimeToLocalTimeString.js';
import { checkPasswordFormat } from './utilities/checkPasswordFormat.js';
import {handleLogoutOnClick} from './utilities/handleLogoutOnClick.js';
import {footer} from './footer.js';

/* *************************************************************************************************************
UserAccountPage React component
************************************************************************************************************** */
export function UserAccountPage() {
  const [loginState, setLoginState] = React.useState('');
    //loginState can be 'fetch-error', 'no-login', 'admin-login', and 'non-admin-login'.

  // /fetchAccessTokenValidity route requestwindow.
  // If access token is valid, admin cookie check and retrieval on client
  React.useEffect(() => {
    let ignore = false;
    setLoginState('');

    fetchAccessTokenValidity(setLoginState, ignore);

    return () => {
      ignore = true;
    }
  }, [setLoginState]);

  console.log(`UserAccountPage() cookies on client:  ${document.cookie}.`)

  return (
    <React.Fragment>
    <div className="top-bar">
    <div className="top-bar-left-column"><a href={window.frontendServerUrl} style={{textDecoration: 'none', color: 'rgb(255,255,255)'}}>Allen Young's Stockmarket Demo</a></div>
    <div className="top-bar-right-column">
    <AdminLogout loginState={loginState} />
    </div>
    </div>
    
    <section className="account-settings-section">
    <h1 className="account-settings-section-heading">Account Settings</h1>
    <AccountSettingsUpdateForm loginState={loginState} />
    <NumberOfCompanySharesOwnedByUser />
    </section>

    <section className="company-stock-transaction-history-section">
    <h1 className="company-stock-transaction-history-section-heading">Company Stock Transaction History</h1>  
    <CompanyStockTransactionHistory loginState={loginState} />
    </section>

    {footer()}
    </React.Fragment>
  );
}

/* *************************************************************************************************************
AdminLogout React component
************************************************************************************************************** */

export function AdminLogout({ loginState }) {
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
        <a href={window.frontendServerUrl + "/admin.html"} style={{textDecoration:'none', color: 'rgb(255,255,255)'}}>Admin</a> |&nbsp;
        <a href="" onClick={handleLogoutOnClick} style={{textDecoration:'none', color: 'rgb(255,255,255)'}}>Logout</a>
        </React.Fragment>
        );
    case 'non-admin-login':
      return (
        <React.Fragment>
        <a href="" onClick={handleLogoutOnClick} style={{textDecoration:'none', color: 'rgb(255,255,255)'}}>Logout</a>
        </React.Fragment>
        );
    default:
      /* The following is for doing better or smooth rendering. Refer to the "Better rendering methods"
         section in the developer's journal.  */
      if (document.cookie.includes('accessToken=')) {
        if (document.cookie.includes('admin=true')) {
          return (
            <React.Fragment>
            <a href={window.frontendServerUrl + "/admin.html"} style={{textDecoration:'none', color: 'rgb(255,255,255)'}}>Admin</a> |&nbsp;
            <a href="" onClick={handleLogoutOnClick} style={{textDecoration:'none', color: 'rgb(255,255,255)'}}>Logout</a>
            </React.Fragment>
            );
        } else {
          return (
            <React.Fragment>
            <a href="" onClick={handleLogoutOnClick} style={{textDecoration:'none', color: 'rgb(255,255,255)'}}>Logout</a>
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
  }
}


/* *************************************************************************************************************
AccountSettingsUpdateForm React component
************************************************************************************************************** */

export function AccountSettingsUpdateForm({ loginState }) {
  const firstNameInputRef = React.useRef(null);
  const lastNameInputRef = React.useRef(null);
  const emailAddressInputRef = React.useRef(null);
  const phoneNumberInputRef = React.useRef(null);
  const passwordInputRef = React.useRef(null);
  const passwordRetypeInputRef = React.useRef(null);
  const errorNoticeRef = React.useRef(null);

  //https://react.dev/learn/reusing-logic-with-custom-hooks#extracting-your-own-custom-hook-from-a-component
  const userAccountSettings = useUserAccountSettings();

  React.useEffect(() => {
    console.log(`AccountSettingsUpdateForm() useEffect() userAccountSettings:  ${JSON.stringify(userAccountSettings)}`)

    if (userAccountSettings === null) {return;}

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

    errorNoticeRef.current.innerHTML = ''

    emailAddressInputRef.current.style.backgroundColor = '#FFFFFF';
    passwordInputRef.current.style.backgroundColor = '#FFFFFF';
    passwordRetypeInputRef.current.style.backgroundColor = '#FFFFFF';

    /* ************************************************************************************************
    Input validation
    ************************************************************************************************ */
    const firstName = firstNameInputRef.current.value.trim();
    const lastName = lastNameInputRef.current.value.trim();

    const emailAddress = emailAddressInputRef.current.value.trim();
    if(emailAddress !== '' && !validateEmail(emailAddress)) {
      errorNoticeRef.current.innerHTML = "Unable to update.  You've entered an invalid email address.  Please correct and try again."
      emailAddressInputRef.current.style.backgroundColor = '#FAA0A0';
      return
    }

    const phoneNumber = phoneNumberInputRef.current.value.trim();

    const password = passwordInputRef.current.value.trim();
    const passwordRetype = passwordRetypeInputRef.current.value.trim();
    if(password !== '' && password !== passwordRetype) {
      errorNoticeRef.current.innerHTML = "Unable to update.  Password and password retype do not match.  Please correct and try again.";
      passwordInputRef.current.style.backgroundColor = '#FAA0A0';
      passwordRetypeInputRef.current.style.backgroundColor = '#FAA0A0';
      return
    }
    if(password !== '' && !checkPasswordFormat(password)) {
      errorNoticeRef.current.innerHTML = "Unable to update.  Password does not meet the requirement.  Please correct and try again.";
      passwordInputRef.current.style.backgroundColor = '#FAA0A0';
      return
    }


    /* ************************************************************************************************
    Update submission to backend
    ************************************************************************************************ */
    fetchUpdateUserAccountSettings(firstName, lastName, emailAddress, phoneNumber, password, errorNoticeRef);
  }

  console.log(`AccountSettingsUpdateForm() useUserAccountSettings() userAccountSettings:  ${JSON.stringify(userAccountSettings)}.`);

  console.log(`AccountSettingsUpdateForm() loginState:  ${loginState}.`)

  if (loginState === 'admin-login' || loginState === 'non-admin-login') {
    return (
      <React.Fragment>
      <form className="account-settings-update-form">
        <div className="account-settings-update-form-div-grid">
        <label className="account-settings-update-form-label-first-name" htmlFor="fname">First name</label>
        <input className="account-settings-update-form-input-first-name" type="text" id="fname" name="fname" size="20" placeholder="First name" ref={firstNameInputRef} />
        <label className="account-settings-update-form-label-last-name" htmlFor="lname">Last name</label>
        <input className="account-settings-update-form-input-last-name" type="text" id="lname" name="lname" size="20" placeholder="Last name" ref={lastNameInputRef} />
        <div className="account-settings-update-form-div-below-last-name"></div>
        <label className="account-settings-update-form-label-email-address" htmlFor="emailaddress">Email address</label>
        <input className="account-settings-update-form-input-email-address" type="text" id="emailaddress" name="emailaddress" size="20" placeholder="Email address" ref={emailAddressInputRef} />  
        <label className="account-settings-update-form-label-phone-number" htmlFor="phonenumber">Phone number</label>
        <input className="account-settings-update-form-input-phone-number" type="text" id="phonenumber" name="phonenumber" size="20" placeholder="Phone number" ref={phoneNumberInputRef} /> 
        <div className="account-settings-update-form-div-below-phone-number"></div>
        <label className="account-settings-update-form-label-password" htmlFor="password">Password</label>
        <input className="account-settings-update-form-input-password" type="password" id="password" name="password" size="20" placeholder="Password" ref={passwordInputRef} />
        <p className="account-settings-update-form-password-show-hide"><a href="" role="password-show-hide" style={{textDecoration: 'none', color: 'rgb(255,255,255)'}} onClick={handleShowHideClick}>show</a></p>
        <label className="account-settings-update-form-label-password-retype" htmlFor="passwordretype">Password (Retype)</label>
        <input className="account-settings-update-form-input-password-retype" type="password" id="passwordretype" name="passwordretype" size="20" placeholder="Password (Retype)" ref={passwordRetypeInputRef} />   
        </div>

        <p className="account-settings-update-form-notice1">Password must be at least 10 characters, and must contain a letter, a number, and a special character from any of the following ~`!@#$%^&amp;*-_+=|\/?;:"'&lt;&gt;,.{}[]().</p>

        <p className="account-settings-update-form-notice2">Your email address is your login ID and PayPal account ID.</p>
        <p className="account-settings-update-form-notice3">Your email address will be updated instantly without the email-address verification.  Please make sure that the new email address you enter is correct.</p>

        <div className="account-settings-update-form-div-button">
        <p className="account-settings-update-form-error-notice" role="error-notice" ref={errorNoticeRef}></p>
        <input className="account-settings-update-form-input-button" type="button" value="Update" onClick={handleUpdateClick} />
        </div>
      </form>
      </React.Fragment>
      );
  } else {
    if (document.cookie.includes('accessToken=')) {
      return (
        <React.Fragment>
        <form className="account-settings-update-form">
          <div className="account-settings-update-form-div-grid">
          <label className="account-settings-update-form-label-first-name" htmlFor="fname">First name</label>
          <input className="account-settings-update-form-input-first-name" type="text" id="fname" name="fname" size="20" ref={firstNameInputRef} />
          <label className="account-settings-update-form-label-last-name" htmlFor="lname">Last name</label>
          <input className="account-settings-update-form-input-last-name" type="text" id="lname" name="lname" size="20" ref={lastNameInputRef} />
          <div className="account-settings-update-form-div-below-last-name"></div>
          <label className="account-settings-update-form-label-email-address" htmlFor="emailaddress">Email address</label>
          <input className="account-settings-update-form-input-email-address" type="text" id="emailaddress" name="emailaddress" size="20" ref={emailAddressInputRef} />  
          <label className="account-settings-update-form-label-phone-number" htmlFor="phonenumber">Phone number</label>
          <input className="account-settings-update-form-input-phone-number" type="text" id="phonenumber" name="phonenumber" size="20" ref={phoneNumberInputRef} /> 
          <div className="account-settings-update-form-div-below-phone-number"></div>
          <label className="account-settings-update-form-label-password" htmlFor="password">Password</label>
          <input className="account-settings-update-form-input-password" type="text" id="password" name="password" size="20" ref={passwordInputRef} />
          <label className="account-settings-update-form-label-password-retype" htmlFor="passwordretype">Password (Retype)</label>
          <input className="account-settings-update-form-input-password-retype" type="text" id="passwordretype" name="passwordretype" size="20" ref={passwordRetypeInputRef} />   
          </div>

          <p className="account-settings-update-form-notice1">Password must be at least 10 characters, and must contain a letter, a number, and a special character from any of the following ~`!@#$%^&amp;*-_+=|\/?;:"'&lt;&gt;,.{}[]().</p>

          <p className="account-settings-update-form-notice2">Your email address is your login ID and PayPal account ID.</p>

          <p className="account-settings-update-form-notice3">Your email address will be updated instantly without the email-address verification.  Please make sure that the new email address you enter is correct.</p>

          <div className="account-settings-update-form-div-button">
          <p className="account-settings-update-form-error-notice" role="error-notice" ref={errorNoticeRef}></p>
          <input className="account-settings-update-form-input-button" type="button" value="Update" onClick={handleUpdateClick} />
          </div>
        </form>
        </React.Fragment>
        );
    } else {
      return (
        <React.Fragment>
        <form className="account-settings-update-form">
          <div className="account-settings-update-form-div-grid">
          <label className="account-settings-update-form-label-first-name" htmlFor="fname">First name</label>
          <input disabled className="account-settings-update-form-input-first-name" type="text" id="fname" name="fname" size="20" ref={firstNameInputRef} />
          <label className="account-settings-update-form-label-last-name" htmlFor="lname">Last name</label>
          <input disabled className="account-settings-update-form-input-last-name" type="text" id="lname" name="lname" size="20" ref={lastNameInputRef} />
          <div className="account-settings-update-form-div-below-last-name"></div>
          <label className="account-settings-update-form-label-email-address" htmlFor="emailaddress">Email address</label>
          <input disabled className="account-settings-update-form-input-email-address" type="text" id="emailaddress" name="emailaddress" size="20" ref={emailAddressInputRef} />  
          <label className="account-settings-update-form-label-phone-number" htmlFor="phonenumber">Phone number</label>
          <input disabled className="account-settings-update-form-input-phone-number" type="text" id="phonenumber" name="phonenumber" size="20" ref={phoneNumberInputRef} /> 
          <div className="account-settings-update-form-div-below-phone-number"></div>
          <label className="account-settings-update-form-label-password" htmlFor="password">Password</label>
          <input disabled className="account-settings-update-form-input-password" type="text" id="password" name="password" size="20" ref={passwordInputRef} />
          <label className="account-settings-update-form-label-password-retype" htmlFor="passwordretype">Password (Retype)</label>
          <input disabled className="account-settings-update-form-input-password-retype" type="text" id="passwordretype" name="passwordretype" size="20" ref={passwordRetypeInputRef} />   
          </div>

          <p className="account-settings-update-form-notice1">Password must be at least 10 characters, and must contain a letter, a number, and a special character from any of the following ~`!@#$%^&amp;*-_+=|\/?;:"'&lt;&gt;,.{}[]().</p>

          <p className="account-settings-update-form-notice2">Your email address is your login ID and PayPal account ID.</p>
          <p className="account-settings-update-form-notice3">Your email address will be updated instantly without the email-address verification.  Please make sure that the new email address you enter is correct.</p>

          <div className="account-settings-update-form-div-button">
          <p className="account-settings-update-form-error-notice" role="error-notice" ref={errorNoticeRef}></p>
          <input disabled className="account-settings-update-form-input-button" type="button" value="Update" />
          </div>
        </form>
        </React.Fragment>
        );
    }
  }
}

/* *************************************************************************************************************
NumberOfCompanySharesOwnedByUser React component
************************************************************************************************************** */

export function NumberOfCompanySharesOwnedByUser() {
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

  var numberOfCompanySharesOwned = Number(responseStatusBody['responseBody']);
    
  switch (responseStatusBody['responseStatus']) {
    case -1: //'fetch-error'
      return <p className="number-of-company-shares-owned">Network error.  Please retry later.</p>;
    case 200:
      return (
        <div>
        <p className="number-of-company-shares-owned">Number of Company shares owned by me:  {numberOfCompanySharesOwned}</p>
        </div>
        );    
    case 500:
      return <p className="number-of-company-shares-owned">Server error.  Please retry later.</p>;
    default: //responseStatus 0 and 400
      return (
        <div style={{opacity: 0.6}}>
        <p className="number-of-company-shares-owned">Number of Company shares owned by me:</p>
        </div>
        );
  }
}

/* *************************************************************************************************************
CompanyStockTransactionHistory React component
************************************************************************************************************** */

export function CompanyStockTransactionHistory({ loginState }) {
  const userInputPageNumberInputRef = React.useRef(null);

  const [numberOfUserStockTransactions, setNumberOfUserStockTransactions] = React.useState(0);
  const [pageNumber, setPageNumber] = React.useState(1);
  const [userStockTransactionHistory, setUserStockTransactionHistory] = React.useState([]);

  // /GetNumberOfUserStockTransactions request.
  React.useEffect(() => {
    let ignore = false;
    setNumberOfUserStockTransactions(0);

    fetchNumberOfUserStockTransactions(setNumberOfUserStockTransactions, ignore);

    return () => {
      ignore = true;
    }
  }, [setNumberOfUserStockTransactions]);

  // /GetUserStockTransactionHistory/:pageNumber request.
  React.useEffect(() => {
    let ignore = false;
    setUserStockTransactionHistory([]);

    fetchUserStockTransactionHistory(pageNumber, setUserStockTransactionHistory, ignore);

    return () => {
      ignore = true;
    }
  }, [pageNumber, setUserStockTransactionHistory]);

  function handlePageNumberOnInput(event) {
    event.stopPropagation();
    if (!(event.target.validity.valid)) {
      event.target.value='';
    }
  }

  function handleGoToButtonOnClick(event) {
    event.stopPropagation();

    let userInputPageNumber = userInputPageNumberInputRef.current.value.trim();
    if (userInputPageNumber == pageNumber || userInputPageNumber === '' || userInputPageNumber < 1 || 
      userInputPageNumber > numberOfUserStockTransactions) {return;}

    setPageNumber(pageNumber);
  }

  function handleNavigationLinkOnClick(event, navigationPageNumber) {
    event.preventDefault();
    event.stopPropagation();

    console.log(`account.js handleNavigationLinkOnClick() navigationPageNumber:  ${navigationPageNumber}.`)

    if (navigationPageNumber === 0) {return;}

    if (pageNumber !== navigationPageNumber) {
      setPageNumber(navigationPageNumber);
    }
  }

  if (loginState === 'non-admin-login') {
    console.log(`CompanyStockTransactionHistory(), loginState === 'non-admin-login', userStockTransactionHistory:  ${JSON.stringify(userStockTransactionHistory)}.`)

    const listItems = userStockTransactionHistory.map(stockTransaction => {
      return (
        <tr key={stockTransaction["ID"]}>
        <td key={stockTransaction["ID"] + "_1"}>{convertEpochTimeToLocalTimeString(stockTransaction["Transaction start datetime"])}</td>
        <td key={stockTransaction["ID"] + "_2"}>{stockTransaction["PayPal transaction (order) ID"]}</td>
        <td key={stockTransaction["ID"] + "_3"}>{stockTransaction["Number of shares"]}</td>
        <td key={stockTransaction["ID"] + "_4"}>{stockTransaction["Payment processing initiated"]}</td>
        <td key={stockTransaction["ID"] + "_5"}>{stockTransaction["Payment processing completed"]}</td>
        <td key={stockTransaction["ID"] + "_6"}>{stockTransaction["Payment processing status"]}</td>
        </tr>
      );
    });

    /*
    if (listItems === undefined || listItems.length == 0) {
      // array does not exist or is empty
      listItems = null;
    }
    */

    console.log(`CompanyStockTransactionHistory(), loginState === 'non-admin-login', listItems:  ${listItems}.`)

    var totalNumberOfPages = Math.ceil(numberOfUserStockTransactions / window.dbMaximumNumberOfRowsReturned);
    console.log(`account.js totalNumberOfPages:  ${totalNumberOfPages}.`)
    console.log(`account.js pageNumber:  ${pageNumber}.`)

    const navigationControls = window.generatePageNavigationControls(totalNumberOfPages, pageNumber, 
      handleNavigationLinkOnClick, '#36454F');

    return (
      <React.Fragment>
        <div className="company-stock-transaction-history-div-display">
        <table className="company-stock-transaction-history-table">
          <thead>
              <tr>
                  <th>Transaction start datetime</th>
                  <th>PayPal transaction (order) ID</th>
                  <th>Number of shares</th>
                  <th>Payment processing initiated</th>
                  <th>Payment processing completed</th>
                  <th>Payment processing status</th>
              </tr>
          </thead>
          <tbody>
                  {listItems}
          </tbody>
        </table>          
        </div>
        <p className="company-stock-transaction-history-p-navigation">{navigationControls}</p>

        <form className="company-stock-transaction-history-form">
          <label htmlFor="page_number">Page</label>
          <input type="number" id="page_number" name="page_number" size="5" min="1" max={totalNumberOfPages} step="1" onInput={handlePageNumberOnInput} ref={userInputPageNumberInputRef} />
          <input type="button" value="Go to" onClick={handleGoToButtonOnClick} />
        </form>
        </React.Fragment>
    );
  } else {
    return (
      <React.Fragment>
        <div className="company-stock-transaction-history-div-display">No records to show.</div>
        <p className="company-stock-transaction-history-p-navigation">&lt; 1 2 3 … (last page number) &gt;</p>

        <form className="company-stock-transaction-history-form">
          <label htmlFor="page_number">Page</label>
          <input disabled type="text" id="page_number" name="page_number" size="5" />
          <input disabled type="button" value="Go to" />
        </form>
      </React.Fragment>
    );    
  }
}

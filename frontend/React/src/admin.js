'use strict';

//import React, { StrictMode } from "react";
//import { createRoot } from 'react-dom/client';

import './settings/ServerUrls.js';
import './settings/dbMaximumNumberOfRowsReturned.js';
import './pageNavigationControlsGenerator.js';
import {fetchAccessTokenValidity} from './utilities/fetchAccessTokenValidity.js';
import {fetchTotalNumberOfUsers} from './utilities/fetchTotalNumberOfUsers.js';
import {fetchUserList} from './utilities/fetchUserList.js';
import {fetchTotalNumberOfTransactions} from './utilities/fetchTotalNumberOfTransactions.js';
import {fetchTransactionHistory} from './utilities/fetchTransactionHistory.js';
import {convertEpochTimeToLocalTimeString} from './utilities/convertEpochTimeToLocalTimeString.js';
import {handleLogoutOnClick} from './utilities/handleLogoutOnClick.js';
import {footer} from './footer.js';

/* *************************************************************************************************************
AdminAccountPage React component
************************************************************************************************************** */
export function AdminAccountPage() {
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

  console.log(`AdminAccountPage() cookies on client:  ${document.cookie}.`)

  return (
    <React.Fragment>
    <div className="top-bar">
    <div className="top-bar-left-column"><a href={window.frontendServerUrl} style={{textDecoration: 'none', color: 'rgb(255,255,255)'}}>Allen Young's Stockmarket Demo</a></div>
    <div className="top-bar-center-column">Admin Page</div>
    <div className="top-bar-right-column">
    <MyAccountLogout loginState={loginState} />
    </div>
    </div>
    
    <section className="user-list-section">
    <h1 className="user-list-section-heading">User List</h1>
    <UserList loginState={loginState} />
    </section>

    <section className="transaction-list-section">
    <h1 className="transaction-list-section-heading">Transaction List</h1>  
    <TransactionList loginState={loginState} />
    </section>

    {footer()}
    </React.Fragment>
  );
}

/* *************************************************************************************************************
MyAccountLogout React component
************************************************************************************************************** */

export function MyAccountLogout({loginState}) {
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
        <a href="" onClick={handleLogoutOnClick} style={{textDecoration:'none', color: 'rgb(255,255,255)'}}>Logout</a>
        </React.Fragment>
        );
    case 'non-admin-login':
      return (
        <React.Fragment>
        <a href={window.frontendServerUrl + "/account.html"} style={{textDecoration:'none', color: 'rgb(255,255,255)'}}>My Account</a> |&nbsp;
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
            <a href={window.frontendServerUrl + "/account.html"} style={{textDecoration:'none', color: 'rgb(255,255,255)'}}>My Account</a> |&nbsp;
            <a href="" onClick={handleLogoutOnClick} style={{textDecoration:'none', color: 'rgb(255,255,255)'}}>Logout</a>
            </React.Fragment>
            );
        } else {
          return (
            <React.Fragment>
            <a href={window.frontendServerUrl + "/account.html"} style={{textDecoration:'none', color: 'rgb(255,255,255)'}}>My Account</a> |&nbsp;
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
UserList React component
************************************************************************************************************** */

export function UserList({loginState}) {
  const userListPageNumberInputRef = React.useRef(null);

  const [numberOfUsers, setNumberOfUsers] = React.useState(0);
  const [pageNumber, setPageNumber] = React.useState(1);
  const [userListPageData, setUserListPageData] = React.useState([]);

  // /GetTotalNumberOfUsers request.
  React.useEffect(() => {
    let ignore = false;
    setNumberOfUsers(0);

    fetchTotalNumberOfUsers(setNumberOfUsers, ignore);

    return () => {
      ignore = true;
    }
  }, [setNumberOfUsers]);

  // /GetUserList/:pageNumber request.
  React.useEffect(() => {
    let ignore = false;
    setUserListPageData([]);

    fetchUserList(pageNumber, setUserListPageData, ignore);

    return () => {
      ignore = true;
    }
  }, [pageNumber, setUserListPageData]);

  function handlePageNumberOnInput(event) {
    event.stopPropagation();
    if (!(event.target.validity.valid)) {
      event.target.value='';
    }
  }

  function handleGoToButtonOnClick(event) {
    event.stopPropagation();

    let userInputPageNumber = userListPageNumberInputRef.current.value.trim();
    if (userInputPageNumber == pageNumber || userInputPageNumber === '' || userInputPageNumber < 1 || 
      userInputPageNumber > numberOfUsers) {return;}

    setPageNumber(userInputPageNumber);
  }

  function handleNavigationLinkOnClick(event, navigationPageNumber) {
    event.preventDefault();
    event.stopPropagation();

    if (navigationPageNumber === 0) {return;}

    if (pageNumber !== navigationPageNumber) {
      setPageNumber(navigationPageNumber);
    }
  }

  if (loginState === 'admin-login') {
    console.log(`UserList(), loginState === 'admin-login', userListPageData:  ${JSON.stringify(userListPageData)}.`)

    const listItems = userListPageData.map(userData => {
      return (
        <tr key={userData["ID"]}>
        <td key={userData["ID"] + "_0"}>{userData["ID"]}</td>
        <td key={userData["ID"] + "_1"}>{userData["First name"]}</td>
        <td key={userData["ID"] + "_2"}>{userData["Last name"]}</td>
        <td key={userData["ID"] + "_3"}>{userData["Email address"]}</td>
        <td key={userData["ID"] + "_4"}>{userData["Email address verified"]}</td>
        <td key={userData["ID"] + "_5"}>{userData["Phone number"]}</td>
        <td key={userData["ID"] + "_6"}>{userData["Admin"]}</td>
        <td key={userData["ID"] + "_7"}>{userData["User deleted"]}</td>
        </tr>
      );
    });

    console.log(`UserList(), loginState === 'admin-login', listItems:  ${listItems}.`)

    var totalNumberOfPages = Math.ceil(numberOfUsers / window.dbMaximumNumberOfRowsReturned);

    const navigationControls = window.generatePageNavigationControls(totalNumberOfPages, pageNumber, 
      handleNavigationLinkOnClick, 'rgb(250,250,250)');

    return (
      <React.Fragment>
        <div className="user-list-div-display">
        <table className="user-list-table">
          <thead>
              <tr>
                  <th>User primary key</th>
                  <th>First name</th>
                  <th>Last name</th>
                  <th>Email address</th>
                  <th>Email address verified</th>
                  <th>Phone number</th>
                  <th>Admin</th>
                  <th>User deleted</th>
              </tr>
          </thead>
          <tbody>
                  {listItems}
          </tbody>
        </table>          
        </div>
        <p className="user-list-p-navigation">{navigationControls}</p>

        <form className="user-list-form">
          <label htmlFor="user_list_page_number">Page</label>
          <input type="number" id="user_list_page_number" name="user_list_page_number" size="5" min="1" max={totalNumberOfPages} step="1" onInput={handlePageNumberOnInput} ref={userListPageNumberInputRef} />
          <input type="button" value="Go to" onClick={handleGoToButtonOnClick} />
        </form>
        </React.Fragment>
    );
  } else {
    return (
      <React.Fragment>
        <div className="user-list-div-display">No records to show.</div>
        <p className="user-list-p-navigation">&lt; 1 2 3 … (last page number) &gt;</p>

        <form className="user-list-form">
          <label htmlFor="user_list_page_number">Page</label>
          <input disabled type="number" id="user_list_page_number" name="user_list_page_number" size="5" />
          <input disabled type="button" value="Go to" />
        </form>
      </React.Fragment>
    );    
  }
}


/* *************************************************************************************************************
TransactionList React component
************************************************************************************************************** */

export function TransactionList({loginState}) {
  const transactionListPageNumberInputRef = React.useRef(null);

  const [numberOfTransactions, setNumberOfTransactions] = React.useState(0);
  const [pageNumber, setPageNumber] = React.useState(1);
  const [transactionListPageData, setTransactionListPageData] = React.useState([]);

  // /GetTotalNumberOfTransactions request.
  React.useEffect(() => {
    let ignore = false;
    setNumberOfTransactions(0);

    fetchTotalNumberOfTransactions(setNumberOfTransactions, ignore);

    return () => {
      ignore = true;
    }
  }, [setNumberOfTransactions]);

  // /GetTransactionHistory/:pageNumber request.
  React.useEffect(() => {
    let ignore = false;
    setTransactionListPageData([]);

    fetchTransactionHistory(pageNumber, setTransactionListPageData, ignore);

    return () => {
      ignore = true;
    }
  }, [pageNumber, setTransactionListPageData]);

  function handlePageNumberOnInput(event) {
    event.stopPropagation();
    if (!(event.target.validity.valid)) {
      event.target.value='';
    }
  }

  function handleGoToButtonOnClick(event) {
    event.stopPropagation();

    let userInputPageNumber = transactionListPageNumberInputRef.current.value.trim();
    if (userInputPageNumber == pageNumber || userInputPageNumber === '' || userInputPageNumber < 1 || 
      userInputPageNumber > numberOfTransactions) {return;}

    setPageNumber(userInputPageNumber);
  }

  function handleNavigationLinkOnClick(event, navigationPageNumber) {
    event.preventDefault();
    event.stopPropagation();

    if (navigationPageNumber === 0) {return;}

    if (pageNumber !== navigationPageNumber) {
      setPageNumber(navigationPageNumber);
    }
  }

  if (loginState === 'admin-login') {
    console.log(`TransactionList(), loginState === 'admin-login', transactionListPageData:  ${JSON.stringify(transactionListPageData)}.`)

    const listItems = transactionListPageData.map(userData => {
      return (
        <tr key={userData["Primary key"]}>
        <td key={userData["Primary key"] + "_1"}>{userData["User primary key"]}</td>
        <td key={userData["Primary key"] + "_2"}>{userData["Stock stats table entry primary key"]}</td>
        <td key={userData["Primary key"] + "_3"}>{convertEpochTimeToLocalTimeString(userData["Transaction start datetime"])}</td>
        <td key={userData["Primary key"] + "_4"}>{convertEpochTimeToLocalTimeString(userData["Transaction end datetime"])}</td>
        <td key={userData["Primary key"] + "_5"}>{userData["PayPal transaction (order) ID"]}</td>
        <td key={userData["Primary key"] + "_6"}>{userData["Company stock transaction ID"]}</td>
        <td key={userData["Primary key"] + "_7"}>{userData["Number of shares"]}</td>
        <td key={userData["Primary key"] + "_8"}>{userData["Payment processing initiated"]}</td>
        <td key={userData["Primary key"] + "_9"}>{userData["Payment processing completed"]}</td>
        <td key={userData["Primary key"] + "_10"}>{userData["Payment processing status"]}</td>
        </tr>
      );
    });

    console.log(`TransactionList(), loginState === 'admin-login', listItems:  ${listItems}.`)

    var totalNumberOfPages = Math.ceil(numberOfTransactions / window.dbMaximumNumberOfRowsReturned);

    const navigationControls = window.generatePageNavigationControls(totalNumberOfPages, pageNumber, 
      handleNavigationLinkOnClick, '#36454F');

    return (
      <React.Fragment>
        <div className="transaction-list-div-display">
        <table className="transaction-list-table">
          <thead>
              <tr>
                  <th>User primary key</th>
                  <th>Stock stats table entry primary key</th>
                  <th>Transaction start datetime</th>
                  <th>Transaction end datetime</th>
                  <th>PayPal transaction (order) ID</th>
                  <th>Company stock transaction ID</th>
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
        <p className="transaction-list-p-navigation">{navigationControls}</p>

        <form className="transaction-list-form">
          <label htmlFor="transaction_history_page_number">Page</label>
          <input type="number" id="transaction_history_page_number" name="transaction_history_page_number" size="5" min="1" max={totalNumberOfPages} step="1" onInput={handlePageNumberOnInput} ref={transactionListPageNumberInputRef} />
          <input type="button" value="Go to" onClick={handleGoToButtonOnClick} />
        </form>
        </React.Fragment>
    );
  } else {
    return (
      <React.Fragment>
        <div className="transaction-list-div-display">No records to show.</div>
        <p className="transaction-list-p-navigation">&lt; 1 2 3 … (last page number) &gt;</p>

        <form className="transaction-list-form">
          <label htmlFor="transaction_history_page_number">Page</label>
          <input disabled type="number" id="transaction_history_page_number" name="transaction_history_page_number" size="5" />
          <input disabled type="button" value="Go to" />
        </form>
      </React.Fragment>
    );    
  }
}


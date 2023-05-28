'use strict';

//import React, { StrictMode } from "react";
//import { createRoot } from 'react-dom/client';

import { validateEmail } from './utilities/validators.js';
import './settings/ServerUrls.js';
import {fetchAccessTokenValidity} from './utilities/fetchAccessTokenValidity.js';
import {fetchLogin} from './utilities/fetchLogin.js';
import { checkPasswordFormat } from './utilities/checkPasswordFormat.js';
import {footer} from './footer.js';


/* *************************************************************************************************************
LoginPage React component
************************************************************************************************************** */
export function LoginPage() {
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

  console.log(`LoginPage() cookies on client:  ${document.cookie}.`)

  return (
    <React.Fragment>
    <div className="top-bar">
    <div className="top-bar-left-column"><a href={window.frontendServerUrl} style={{textDecoration: 'none', color: 'rgb(255,255,255)'}}>Allen Young's Stockmarket Demo</a></div>
    <div className="top-bar-right-column">
    <a href={window.frontendServerUrl + '/registration.html'} style={{textDecoration: 'none', color: 'rgb(255,255,255)'}}>Register</a>
    </div>
    </div>
    
    <section className="login-controls-section">
    <h1 className="login-controls-section-heading">Login</h1>
    <LoginControls loginState={loginState} />
    </section>

    {footer()}
    </React.Fragment>
  );
}

/* *************************************************************************************************************
LoginControls React component
************************************************************************************************************** */

export function LoginControls({loginState}) {
  const emailAddressInputRef = React.useRef(null);
  const passwordInputRef = React.useRef(null);
  const errorNoticeDomNodeRef = React.useRef(null);

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

    errorNoticeDomNodeRef.current.innerHTML = ''  

    emailAddressInputRef.current.style.backgroundColor = '#FFFFFF';
    passwordInputRef.current.style.backgroundColor = '#FFFFFF';

    /* ************************************************************************************************
    Input validation
    ************************************************************************************************ */
    const emailAddress = emailAddressInputRef.current.value.trim();
    if(!validateEmail(emailAddress)) {
      errorNoticeDomNodeRef.current.innerHTML = "Unable to log in.  You've entered an invalid email address.  Please correct and try again."
      emailAddressInputRef.current.style.backgroundColor = '#FAA0A0';
      return
    }

    const password = passwordInputRef.current.value.trim();
    if(password === '') {
      errorNoticeDomNodeRef.current.innerHTML = "Unable to log in.  You need to enter password.  Please correct and try again.";
      passwordInputRef.current.style.backgroundColor = '#FAA0A0';
      return
    }

    if(!checkPasswordFormat(password)) {
      errorNoticeDomNodeRef.current.innerHTML = "Unable to log in.  Password does not meet the requirement.  Please correct and try again.";
      passwordInputRef.current.style.backgroundColor = '#FAA0A0';
      return
    }

    /* ************************************************************************************************
    Login submission to backend
    ************************************************************************************************ */
    fetchLogin(emailAddress, password, errorNoticeDomNodeRef);
  }
  
  if (loginState === 'admin-login' || loginState === 'non-admin-login' || document.cookie.includes('accessToken=')) {
    return (
      <React.Fragment>
      <form className="login-form">
        <div className="login-form-div-grid">
        <label className="login-form-label-email-address" htmlFor="emailaddress">Email address</label>
        <input disabled className="login-form-input-email-address" type="text" id="emailaddress" name="emailaddress" size="20" placeholder="Email address" ref={emailAddressInputRef} />  
        <label className="login-form-label-password" htmlFor="password">Password</label>
        <input disabled className="login-form-input-password" type="password" id="password" name="password" size="20" placeholder="Password" ref={passwordInputRef} />
        </div>

        <div className="login-form-div-login-button" >
        <p className="login-form-error-notice" role="error-notice" ref={errorNoticeDomNodeRef}></p>
        <input disabled className="login-form-input-login-button" type="button" value="Login" onClick={handleOnClick} />
        </div>
      </form>
      </React.Fragment>
    );
  } else {
    return (
      <React.Fragment>
      <form className="login-form">
        <div className="login-form-div-grid">
        <label className="login-form-label-email-address" htmlFor="emailaddress">Email address</label>
        <input className="login-form-input-email-address" type="text" id="emailaddress" name="emailaddress" size="20" placeholder="Email address" ref={emailAddressInputRef} />  
        <label className="login-form-label-password" htmlFor="password">Password</label>
        <input className="login-form-input-password" type="password" id="password" name="password" size="20" placeholder="Password" ref={passwordInputRef} />
        <p className="login-form-password-show-hide"><a href="" role="password-show-hide" style={{textDecoration: 'none', color: 'rgb(255,255,255)'}} onClick={handleShowHideClick}>show</a></p>
        </div>

        <div className="login-form-div-login-button" >
        <p className="login-form-error-notice" role="error-notice" ref={errorNoticeDomNodeRef}></p>
        <input className="login-form-input-login-button" type="button" value="Login" onClick={handleOnClick} />
        </div>
      </form>
      </React.Fragment>
    );    
  }
}
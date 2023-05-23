'use strict';

//import React, { StrictMode } from "react";
//import { createRoot } from 'react-dom/client';

import './utilities/ServerUrl.js';
import { fetchResetPassword } from './utilities/fetchResetPassword.js';
import { getEmailAddressAndAccessTokenInUrlParam } from './utilities/getEmailAddressAndAccessTokenInUrlParam.js';
import { checkPasswordFormat } from './utilities/checkPasswordFormat.js';
import {footer} from './footer.js';

/* *************************************************************************************************************
PasswordResetPage React component
************************************************************************************************************** */
export function PasswordResetPage() {
  return (
    <React.Fragment>
    <div className="top-bar">
    <a href={window.frontendServerUrl} style={{textDecoration: 'none', color: 'rgb(255,255,255)'}}>Allen Young's Stockmarket Demo</a>
    </div>
    
		<section className="password-reset-section">
		<h1 className="password-reset-section-heading">Password reset</h1>
    <PasswordResetControls />
    </section>

    {footer()}
    </React.Fragment>
  );
}

/* *************************************************************************************************************
PasswordResetControls React component
************************************************************************************************************** */

export function PasswordResetControls() {
  const passwordInputRef = React.useRef(null);
  const passwordRetypeInputRef = React.useRef(null);  
  const errorNoticeDomNodeRef = React.useRef(null);

  const [emailAddress, accessToken] = getEmailAddressAndAccessTokenInUrlParam();
  
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

    const password = passwordInputRef.current.value.trim();
    if(password === '') {
      errorNoticeDomNodeRef.current.innerHTML = "Unable to reset password.  You need to enter password.  Please correct and try again.";
      passwordInputRef.current.style.backgroundColor = '#FAA0A0';
      return
    }

    if(!checkPasswordFormat(password)) {
      errorNoticeDomNodeRef.current.innerHTML = "Unable to reset password.  Password does not meet the requirement.  Please correct and try again.";
      passwordInputRef.current.style.backgroundColor = '#FAA0A0';
      return
    }

    const passwordRetype = passwordRetypeInputRef.current.value.trim();
    if(passwordRetype === '') {
      errorNoticeDomNodeRef.current.innerHTML = "Unable to reset password.  You need to enter password (retype).  Please correct and try again.";
      passwordRetypeInputRef.current.style.backgroundColor = '#FAA0A0'; 
      return
    }

    if(passwordRetype !== password) {
      errorNoticeDomNodeRef.current.innerHTML = "Password and password retype do not match.  Please correct and try again.";
      passwordInputRef.current.style.backgroundColor = '#FAA0A0';
      passwordRetypeInputRef.current.style.backgroundColor = '#FAA0A0';      
      return
    }

    /* ************************************************************************************************
    Password reset submission to backend
    ************************************************************************************************ */
    fetchResetPassword(accessToken, password, errorNoticeDomNodeRef);
  }

  return (
    <React.Fragment>
      <p className="email-address">Use the form below to change your login password.</p>

    <p className="email-address">Email address:  {emailAddress}</p>

    <form className="reset-password-form">
      <div className="reset-password-form-div-grid">
      <label className="reset-password-form-label-password" htmlFor="password">Password</label>
      <input className="reset-password-form-input-password" type="password" id="password" name="password" ref={passwordInputRef} /><br />
      <p className="reset-password-form-password-show-hide"><a href="" role="password-show-hide" style={{textDecoration: 'none', color: 'rgb(255,255,255)'}} onClick={handleShowHideClick}>show</a></p>
      <label className="reset-password-form-label-password-retype" htmlFor="passwordretype">Password (Retype)</label>
      <input className="reset-password-form-input-password-retype" type="password" id="passwordretype" name="passwordretype" size="20" ref={passwordRetypeInputRef} />   
      </div>

      <div className="reset-password-form-div-reset-password-button">
      <p className="reset-password-form-error-notice" role="error-notice" ref={errorNoticeDomNodeRef}></p>
      <input className="reset-password-form-input-reset-password-button" type="button" value="Reset password" onClick={handleOnClick} />
      </div>
    </form>
    </React.Fragment>
  );
}

'use strict';

//import React, { StrictMode } from "react";
//import { createRoot } from 'react-dom/client';

import './settings/ServerUrls.js';
import './utilities/SendEmailAddressVerificationEmail.js';
import {getEmailAddressInUrlParam} from './utilities/getEmailAddressInUrlParam.js';
import {footer} from './footer.js';

/* *************************************************************************************************************
EmailAddressVerificationNoticePage React component
************************************************************************************************************** */
export function EmailAddressVerificationNoticePage() {
  return (
    <React.Fragment>
    <div className="top-bar">
    <a href={window.frontendServerUrl} style={{textDecoration: 'none', color: 'rgb(255,255,255)'}}>Allen Young's Stockmarket Demo</a>
    </div>
    
    <section className="email-verification-controls-section">
    <h1 className="email-verification-controls-section-heading">Verify Your Email Address</h1>
    <EmailVerificationControls />
    </section>

    {footer()}
    </React.Fragment>
  );
}

/* *************************************************************************************************************
EmailVerificationControls React component
************************************************************************************************************** */

export function EmailVerificationControls() {
  var emailAddress = getEmailAddressInUrlParam();
  
  function handleOnClick(event) {
    event.stopPropagation();
    window.SendEmailAddressVerificationEmail(null, emailAddress, '')
  }

  return (
    <React.Fragment>
    <div className="email-verification-controls-div">
    <p>Email address:  {emailAddress}</p>

    <p>You cannot log in until you verify your email address.</p>
    <p style={{marginBottom: "0.5%"}}>Please check your email inbox and click the verification link to verify your email address.</p>

    <div style={{textAlign: "center"}}>
    <p id="error_notice" className="email-address-verification-email-resend-button-error-notice"></p>
    <button type="button" className="email-address-verification-email-resend-button" onClick={handleOnClick}>Resend email-address verification email</button>
    </div>
    </div>
    </React.Fragment>
  );
}

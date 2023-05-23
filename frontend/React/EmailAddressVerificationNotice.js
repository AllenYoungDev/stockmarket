'use strict';

//import React, { StrictMode } from "react";
//import { createRoot } from 'react-dom/client';

import './utilities/SendEmailAddressVerificationEmail.js';
import { getEmailAddressInUrlParam } from './utilities/getEmailAddressInUrlParam.js';
import { footer } from './footer.js';

/* *************************************************************************************************************
EmailAddressVerificationNoticePage React component
************************************************************************************************************** */
export function EmailAddressVerificationNoticePage() {
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
      { className: 'email-verification-controls-section' },
      React.createElement(
        'h1',
        { className: 'email-verification-controls-section-heading' },
        'Verify Your Email Address'
      ),
      React.createElement(EmailVerificationControls, null)
    ),
    footer()
  );
}

/* *************************************************************************************************************
EmailVerificationControls React component
************************************************************************************************************** */

export function EmailVerificationControls() {
  var emailAddress = getEmailAddressInUrlParam();

  function handleOnClick(event) {
    event.stopPropagation();
    window.SendEmailAddressVerificationEmail(null, emailAddress, '');
  }

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      'div',
      { className: 'email-verification-controls-div' },
      React.createElement(
        'p',
        null,
        'Email address:  ',
        emailAddress
      ),
      React.createElement(
        'p',
        null,
        'You cannot log in until you verify your email address.'
      ),
      React.createElement(
        'p',
        { style: { marginBottom: "0.5%" } },
        'Please check your email inbox and click the verification link to verify your email address.'
      ),
      React.createElement(
        'div',
        { style: { textAlign: "center" } },
        React.createElement('p', { id: 'error_notice', className: 'email-address-verification-email-resend-button-error-notice' }),
        React.createElement(
          'button',
          { type: 'button', className: 'email-address-verification-email-resend-button', onClick: handleOnClick },
          'Resend email-address verification email'
        )
      )
    )
  );
}
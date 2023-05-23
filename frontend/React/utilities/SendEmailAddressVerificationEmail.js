import './ServerUrl.js';

import {fetchSendEmailAddressVerificationEmail} from "./fetchSendEmailAddressVerificationEmail.js";

window.SendEmailAddressVerificationEmail = function (event, emailAddress, accessToken) {
    var requestUrl;
  
    console.log(`SendEmailAddressVerificationEmail() start.`)
  
    console.log(`SendEmailAddressVerificationEmail() event value:  ${JSON.stringify(event)}.`)
    console.log(`SendEmailAddressVerificationEmail() emailAddress value:  ${emailAddress}.`)
    console.log(`SendEmailAddressVerificationEmail() accessToken value:  ${accessToken}.`)
  
    if (event !== null) {
      console.log(`SendEmailAddressVerificationEmail() event.target.innerHTML value:  ${event.target.innerHTML}.`)
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (emailAddress !== '') {
      requestUrl = `${backendServerUrl}/SendEmailAddressVerificationEmail/null/${emailAddress}`;
    } else {
      requestUrl = `${backendServerUrl}/SendEmailAddressVerificationEmail/${accessToken}/null`;
    }
  
    console.log(`SendEmailAddressVerificationEmail() right before fetch() call.`)
  
    fetchSendEmailAddressVerificationEmail(requestUrl, emailAddress, accessToken);
  
    console.log(`SendEmailAddressVerificationEmail() end.`)
}
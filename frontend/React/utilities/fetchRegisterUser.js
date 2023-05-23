import './ServerUrl.js';
import './SendEmailAddressVerificationEmail.js';

export function fetchRegisterUser(firstName, lastName, emailAddress, phoneNumber, password, errorNoticeDomNodeRef) {
  let registerUserResponseStatus = 0;
  let accessToken = '';

  fetch(window.backendServerUrl + "/RegisterUser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },      
    body: JSON.stringify({'firstName': firstName, 'lastName': lastName, 'emailAddress': emailAddress, 
      'phoneNumber': phoneNumber, 'password': password }),
    })
  .then((response) => {registerUserResponseStatus=response.status; return response.text();})
  .then((text) => {
    if(text === 'unavailable email address') {
      errorNoticeDomNodeRef.current.innerHTML = 
        `<p style="margin-bottom: 1%;">The email address you provided is not available for registering.  ` +
        `If you need another email-address verification email sent to this email address, ` +
        `<a href="" onclick="window.SendEmailAddressVerificationEmail(event, '${emailAddress}', '')">click here</a>.  If the email address is already verified, ` +
        `<a href="${window.frontendServerUrl}/login.html">log in</a> using the email address.</p>` +
        `<p>If you forgot the password and would like to reset the password via your email,  ` +
        `<a href="${window.backendServerUrl}/SendResetPasswordEmail/${emailAddress}">click here</a>.`;
      return
    }

    if(registerUserResponseStatus !== 200) {
      errorNoticeDomNodeRef.current.innerHTML = `Unable to register.  An error.  ${text}.`;
      return
    }

    accessToken = text;

    //Send an email-address verification email
    window.SendEmailAddressVerificationEmail(null, emailAddress, accessToken);
  })
  .catch((err) => {
    //'fetch-error'
    errorNoticeDomNodeRef.current.innerHTML = `Unable to register.  Network error.`;
  }); 
}
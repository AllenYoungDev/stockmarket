import './ServerUrl.js';

export function fetchLogin(emailAddress, password, errorNoticeDomNodeRef) {
  let loginResponse = 0;
  let loginResponseStatus = 0;

  fetch(window.backendServerUrl + "/Login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },      
    body: JSON.stringify({'emailAddress': emailAddress, 'password': password }),
    credentials: 'include',
    })
  .then((response) => {
    loginResponse = response;
    response.headers.forEach((value, key) => {
      console.log(`LoginControls() handleOnClick() loginResponse.headers key==>value:  ${key} ==> ${value}`)
    });
    loginResponseStatus=response.status;
    return response.text();})
  .then((text) => {
    if(text === 'unverified email address') {
      errorNoticeDomNodeRef.current.innerHTML = 
      `<p style="margin-bottom: 1%;">The email address you provided is not yet verified.  ` +
      `If you need another email-address verification email sent to this email address, ` +
      `<a href="" onclick="window.SendEmailAddressVerificationEmail(event, '${emailAddress}', '')">click here</a>.`
      return;
    } else if(text === 'invalid password') {
        errorNoticeDomNodeRef.current.innerHTML = 
        `<p>Incorrect password.  If you forgot the password and would like to reset the password via your email,  ` +
        `<a href="${window.backendServerUrl}/SendResetPasswordEmail/${emailAddress}">click here</a>.`;
        return;
    } else if(text !== 'success') {
      errorNoticeDomNodeRef.current.innerHTML = `Login failure.  ${text}.`;
      return;
    } else {
      console.log(`LoginControls() handleOnClick() document.cookie:  ${document.cookie}`)
      window.location.href = window.frontendServerUrl;
    }
  })
  .catch((err) => {
    //'fetch-error'
    errorNoticeDomNodeRef.current.innerHTML = `Unable to log in.  Network error.`;
  });   
}
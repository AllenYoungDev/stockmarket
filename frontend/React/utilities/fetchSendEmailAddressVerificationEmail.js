import '../settings/ServerUrls.js';

export function fetchSendEmailAddressVerificationEmail(requestUrl, emailAddress, accessToken) {
    var sendEmailAddressVerificationEmailResponseStatus = 0;

    const domNodeErrorNotice = document.getElementById('error_notice');
  
    fetch(requestUrl, {method: "GET"})
    .then((response) => {
      sendEmailAddressVerificationEmailResponseStatus=response.status;
      return response.text();
    })
    .then((text) => {
        
      if(text !== 'success') {
          domNodeErrorNotice.innerHTML = `Unable to send email-address verification email.  Server error.  Please retry registering later, or contact support at <a href="mailto:support@allenyoung.dev">support@allenyoung.dev</a>.`;
          return;
      } else {
            if(window.location.href.includes('EmailAddressVerificationNotice.html')) {
                domNodeErrorNotice.innerHTML = `Email-address verification email sent to ${emailAddress}.`;
                return;
            }

          //Redirect to EmailAddressVerificationNotice.html with proper parameters in URL
          if (emailAddress !== '') {
              window.location.href = 
              `${window.frontendServerUrl}/EmailAddressVerificationNotice.html?emailAddress=${emailAddress}`;
          } else {
              window.location.href = 
              `${window.frontendServerUrl}/EmailAddressVerificationNotice.html?emailAddress=${emailAddress}`;
              //`${window.frontendServerUrl}/EmailAddressVerificationNotice.html?accessToken=${accessToken}`;
          }
      }
    })
    .catch((err) => {
      //'fetch-error'
      domNodeErrorNotice.innerHTML = `Unable to send email-address verification email.  Network error.  Please check your network connection, and retry registering.`;
    }); 
}
import '../settings/ServerUrls.js';

export function fetchResetPassword(accessToken, password, errorNoticeDomNodeRef) {
  let passwordResetResponseStatus = 0;

  fetch(window.backendServerUrl + "/ResetPassword", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },      
    body: JSON.stringify({'accessToken': accessToken, 'password': password }),
    })
  .then((response) => {passwordResetResponseStatus=response.status; return response.text();})
  .then((text) => {
    console.log(`PasswordResetControls() fetch() completed.`);
    console.log(`PasswordResetControls() fetch() passwordResetResponseStatus:  ${passwordResetResponseStatus}.`);
    console.log(`PasswordResetControls() fetch() text:  ${text}.`);
    if (passwordResetResponseStatus === 500) {
      errorNoticeDomNodeRef.current.innerHTML = 
        `Password reset error.  ${text}.`;
    } else {
      document.open('text/html');
      document.write(text);
      document.close();
    }
    return;
  })
  .catch((err) => {
    //'fetch-error'
    errorNoticeDomNodeRef.current.innerHTML = `Unable to reset password.  Network error.`;
  });  
}
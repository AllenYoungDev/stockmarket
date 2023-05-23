'use strict';

import './ServerUrl.js';

export function fetchUpdateUserAccountSettings(firstName, lastName, emailAddress, phoneNumber, password, errorNoticeRef) {
    let updateUserAccountSettingsResponseStatus = 0;

    fetch(window.backendServerUrl + "/UpdateUserAccountSettings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },      
        body: JSON.stringify({'firstName': firstName, 'lastName': lastName, 'emailAddress': emailAddress, 
          'phoneNumber': phoneNumber, 'password': password }),
        credentials: 'include',
        })
      .then((response) => {updateUserAccountSettingsResponseStatus=response.status; return response.text();})
      .then((text) => {
        if(text === 'success') {
          errorNoticeRef.current.innerHTML = `Update success!`;
          return
        } else {
          errorNoticeRef.current.innerHTML = `Update failure.  ${text}.`;
        }
      })
      .catch((err) => {
        //'fetch-error'
        errorNoticeRef.current.innerHTML = `Unable to register.  Network error.`;
      }); 
}
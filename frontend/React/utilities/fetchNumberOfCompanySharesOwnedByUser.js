'use strict';

import '../settings/ServerUrls.js';

export function fetchNumberOfCompanySharesOwnedByUser(setResponseStatusBody, ignore) {
    let responseStatus = 0;

    console.log('fetchNumberOfCompanySharesOwnedByUser() start.')

    fetch(window.backendServerUrl + "/GetNumberOfCompanySharesOwnedByUser", {method: "GET", credentials: 'include'})
    .then((response) => {responseStatus=response.status; return response.text();})
    .then((text) => {
      console.log(`fetchNumberOfCompanySharesOwnedByUser() responseStatus:  ${responseStatus}.`)
      console.log(`fetchNumberOfCompanySharesOwnedByUser() responseBody:  ${text}.`)
      if (!ignore) {
        setResponseStatusBody({responseStatus: responseStatus, responseBody: text});
      }
    })
    .catch((err) => {
      if (!ignore) {
        setResponseStatusBody({responseStatus: -1, responseBody: ''}); //'fetch-error'
      }
    });
}
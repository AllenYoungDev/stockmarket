'use strict';

import './ServerUrl.js';

export function fetchCompanyStockData(setStockDataServerResponse, ignore) {

    fetch(window.backendServerUrl + "/GetCompanyStockData", {method: "GET", credentials: 'include'})
    .then((response) => response.status === 200 ? response.json() : response.text())
    .then((data) => {
      console.log(`CompanyStockStats() typeof data:  ${typeof data}.`)
      if (typeof data === 'object') {
        console.log(`CompanyStockStats() JSON response:  ${data}.`)
        //console.log(`CompanyStockStats() data[0]:  ${data[0]}.`)
        if (!ignore) {
          setStockDataServerResponse({responseType: 'success', stockData: data});
        }
      } else {
        console.error(`CompanyStockStats() text response:  ${data}.`)
        if (!ignore) {
          setStockDataServerResponse({responseType: 'server-error', stockData: {}});
        }      
      }
    })
    .catch((err) => {
      console.error(`CompanyStockStats() fetch() error:  ${err}.`)
      if (!ignore) {
        setStockDataServerResponse({responseType: 'fetch-error', stockData: {}});
      }    
    });
}
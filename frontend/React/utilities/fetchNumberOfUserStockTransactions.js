import '../settings/ServerUrls.js';

export function fetchNumberOfUserStockTransactions(setNumberOfUserStockTransactions, ignore) {
    let responseStatus = 0;

    fetch(window.backendServerUrl + `/GetNumberOfUserStockTransactions`, {method: "GET", credentials: 'include'})
    .then((response) => {responseStatus = response.status; return response.text();})
    .then((text) => {
      console.log(`CompanyStockTransactionHistory():  /GetNumberOfUserStockTransactions fetch() response status:  ${responseStatus}.`);
      console.log(`CompanyStockTransactionHistory():  /GetNumberOfUserStockTransactions fetch() response:  ${text}.`);

      if (ignore) {return;}

      if( responseStatus === 200) {
        setNumberOfUserStockTransactions(parseInt(text, 10));
      } else {
        setNumberOfUserStockTransactions(0);
      }
    })
    .catch((err) => {
      console.log(`CompanyStockTransactionHistory():  /GetNumberOfUserStockTransactions fetch() network error.  ${err}`);
      if (ignore) {return;}
      setNumberOfUserStockTransactions(0);
    });
}
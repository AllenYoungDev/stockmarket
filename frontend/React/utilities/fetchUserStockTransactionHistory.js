import '../settings/ServerUrls.js';

export function fetchUserStockTransactionHistory(pageNumber, setUserStockTransactionHistory, ignore) {
  let responseStatus = 0;

  fetch(window.backendServerUrl + `/GetUserStockTransactionHistory/${pageNumber}`, {method: "GET", credentials: 'include'})
  .then((response) => {
    responseStatus = response.status

    if (responseStatus === 200) {
        return response.json();
    } else {
        return response.text();
    }
  })
  .then((data) => {
    if (ignore) {return;}

    console.log(`CompanyStockTransactionHistory() /GetUserStockTransactionHistory/:pageNumber fetch() data: ${JSON.stringify(data)}.`)

    if( responseStatus === 200) {
      setUserStockTransactionHistory(data);
    } else {
      setUserStockTransactionHistory([]);
    }
  })
  .catch((err) => {
    console.log(`CompanyStockTransactionHistory():  /GetUserStockTransactionHistory/:pageNumber fetch() network error.  ${err}`);
    if (ignore) {return;}
    setUserStockTransactionHistory([]);
  });
}
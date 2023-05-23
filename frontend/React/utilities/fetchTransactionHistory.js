import './ServerUrl.js';

export function fetchTransactionHistory(pageNumber, setTransactionListPageData, ignore) {
  let responseStatus = 0;

  fetch(window.backendServerUrl + `/GetTransactionHistory/${pageNumber}`, {method: "GET", credentials: 'include'})
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

    console.log(`TransactionList() /GetTransactionHistory/:pageNumber fetch() data: ${JSON.stringify(data)}.`)

    if( responseStatus === 200) {
      setTransactionListPageData(data);
    } else {
      setTransactionListPageData([]);
    }
  })
  .catch((err) => {
    console.log(`TransactionList():  /GetTransactionHistory/:pageNumber fetch() network error.  ${err}`);
    if (ignore) {return;}
    setTransactionListPageData([]);
  });
}
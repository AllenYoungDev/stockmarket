import './ServerUrl.js';

export function fetchTotalNumberOfTransactions(setNumberOfTransactions, ignore) {
  let responseStatus = 0;

  fetch(window.backendServerUrl + `/GetTotalNumberOfTransactions`, {method: "GET", credentials: 'include'})
  .then((response) => {responseStatus = response.status; return response.text();})
  .then((text) => {
    console.log(`TransactionList():  /GetTotalNumberOfTransactions fetch() response status:  ${responseStatus}.`);
    console.log(`TransactionList():  /GetTotalNumberOfTransactions fetch() response:  ${text}.`);

    if (ignore) {return;}

    if( responseStatus === 200) {
      setNumberOfTransactions(parseInt(text, 10));
    } else {
      setNumberOfTransactions(0);
    }
  })
  .catch((err) => {
    console.log(`TransactionList():  /GetTotalNumberOfTransactions fetch() network error.  ${err}`);
    if (ignore) {return;}
    setNumberOfTransactions(0);
  });
}
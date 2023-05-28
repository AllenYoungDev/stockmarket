import '../settings/ServerUrls.js';

export function fetchTotalNumberOfUsers(setNumberOfUsers, ignore) {
  let responseStatus = 0;

  fetch(window.backendServerUrl + `/GetTotalNumberOfUsers`, {method: "GET", credentials: 'include'})
  .then((response) => {responseStatus = response.status; return response.text();})
  .then((text) => {
    console.log(`UserList():  /GetTotalNumberOfUsers fetch() response status:  ${responseStatus}.`);
    console.log(`UserList():  /GetTotalNumberOfUsers fetch() response:  ${text}.`);

    if (ignore) {return;}

    if( responseStatus === 200) {
      setNumberOfUsers(parseInt(text, 10));
    } else {
      setNumberOfUsers(0);
    }
  })
  .catch((err) => {
    console.log(`UserList():  /GetTotalNumberOfUsers fetch() network error.  ${err}`);
    if (ignore) {return;}
    setNumberOfUsers(0);
  });
}
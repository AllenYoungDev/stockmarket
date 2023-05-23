import './ServerUrl.js';

export function fetchUserList(pageNumber, setUserListPageData, ignore) {
  let responseStatus = 0;

  fetch(window.backendServerUrl + `/GetUserList/${pageNumber}`, {method: "GET", credentials: 'include'})
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

    console.log(`UserList() /GetUserList/:pageNumber fetch() data: ${JSON.stringify(data)}.`)

    if( responseStatus === 200) {
      setUserListPageData(data);
    } else {
      setUserListPageData([]);
    }
  })
  .catch((err) => {
    console.log(`UserList():  /GetUserList/:pageNumber fetch() network error.  ${err}`);
    if (ignore) {return;}
    setUserListPageData([]);
  });
}
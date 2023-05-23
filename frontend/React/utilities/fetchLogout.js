import './ServerUrl.js';

export function fetchLogout() {
    fetch(window.backendServerUrl + "/Logout", {method: "DELETE",credentials: 'include'})
      .then((response) => response.text())
      .then((text) => {
        if(text === 'success') {
            console.log('handleLogoutOnClick() fetch() returned success.')
            window.location.href = window.frontendServerUrl;
          return
        }
      })
      .catch((err) => {
        //'fetch-error'
        console.error(`Fetch() error.  Unable to log out.  ${JSON.stringify(err)}.`)
      });   
}
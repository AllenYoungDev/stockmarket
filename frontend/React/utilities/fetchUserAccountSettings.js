import '../settings/ServerUrls.js';

export function fetchUserAccountSettings(setUserAccountSettings, ignore) {
    let responseStatus = 0;
    
    fetch(window.backendServerUrl + "/GetUserAccountSettings", {method: "GET", credentials: 'include'})
    .then((response) => {
        responseStatus = response.status
        console.log(`useUserAccountSettings() responseStatus:  ${responseStatus}.`)

        if (responseStatus === 200) {
            return response.json();
        } else {
            return response.text();
        }
    })
    .then((data) => {
        if (ignore) {return;}

        console.log(`useUserAccountSettings() data:  ${JSON.stringify(data)}.`)

        if (responseStatus === 200) {
            setUserAccountSettings(data);
        } else {
            setUserAccountSettings(null);
        }
    })
    .catch((err) => {
      console.log(`useUserAccountSettings():  fetch() network error.  ${err}`);
      if (ignore) {return;}
      setUserAccountSettings(null);
    });
}
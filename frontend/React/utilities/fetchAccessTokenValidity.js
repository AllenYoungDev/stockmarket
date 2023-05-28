'use strict';

import '../settings/ServerUrls.js';

export function fetchAccessTokenValidity(setLoginState, ignore) {

    console.log('fetchAccessTokenValidity() start.')

    fetch(window.backendServerUrl + "/CheckAccessTokenValidity", {method: "GET", credentials: 'include'})
    .then((response) => response.text())
    .then((text) => {
        if (text === 'valid') {
            console.log('fetchAccessTokenValidity():  access token is valid.');
            if (ignore) {return;}
            if (document.cookie.includes('admin=true')) {
                setLoginState('admin-login');
            } else {
                setLoginState('non-admin-login');
            }
        } else {
            console.log('fetchAccessTokenValidity():  access token is invalid.');
            if (ignore) {return;}
            setLoginState('no-login');
        }
    })
    .catch((err) => {
        console.log(`fetchAccessTokenValidity():  fetch() network error.  ${err}`);
        if (ignore) {return;}
        setLoginState('fetch-error');
    });
}
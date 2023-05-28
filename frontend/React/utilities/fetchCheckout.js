import '../settings/ServerUrls.js';

export function fetchCheckout(numberOfSharesToBuy, errorNoticeDomNodeRef) {
  let checkoutResponse = 0;
  let checkoutResponseStatus = 0;

  fetch(window.backendServerUrl + "/Checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },      
    body: JSON.stringify({'numberOfSharesToBuy': numberOfSharesToBuy}),
    credentials: 'include',
    })
  .then((response) => {
    checkoutResponse = response;
    response.headers.forEach((value, key) => {
      console.log(`CheckoutButton() handleOnClick() checkoutResponse.headers key==>value:  ${key} ==> ${value}`)
    });
    checkoutResponseStatus=response.status;
    return response.text();})
  .then((text) => {
    if(checkoutResponseStatus === 200) {
      //window.location.href = window.frontendServerUrl;
      //This is not the proper implementation.  The page must navigate to /Checkout URL.
    } else {
      errorNoticeDomNodeRef.current.innerHTML = `Error.  Cannot proceed to checkout.  ${text}.`
    }
  })
  .catch((err) => {
    //'fetch-error'
    errorNoticeDomNodeRef.current.innerHTML = `Unable to proceed to checkout.  Network error.`;
  });   
}
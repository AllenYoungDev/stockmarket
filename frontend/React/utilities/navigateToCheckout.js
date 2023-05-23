import './ServerUrl.js';

export function navigateToCheckout(numberOfSharesToBuy) {
  window.location.href = `${window.backendServerUrl}/Checkout/${numberOfSharesToBuy}`; 
}
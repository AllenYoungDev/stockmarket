paypal
  .Buttons({
    // Sets up the transaction when a payment button is clicked
    createOrder: function (data, actions) {
      return fetch("/Checkout/api/orders", {
        method: "post",
        // use the "body" param to optionally pass additional order information
        // like product ids or amount
      })
        .then((response) => response.json())
        .then((order) => order.id);
    },
    // Finalize the transaction after payer approval
    onApprove: function (data, actions) {
      return fetch(`/Checkout/api/orders/${data.orderID}/capture`, {
        method: "post",
      })
        .then((response) => response.json())
        .then((orderData) => {
          // Successful capture! For dev/demo purposes:
          console.log(
            "Capture result",
            orderData,
            JSON.stringify(orderData, null, 2)
          );
          const transaction = orderData.purchase_units[0].payments.captures[0];
		  /*
          alert(`Transaction ${transaction.status}: ${transaction.id}

            See console for all available details
          `);
		  */
          // When ready to go live, remove the alert and show a success message within this page. For example:
          // var element = document.getElementById('paypal-button-container');
          // element.innerHTML = '<h3>Thank you for your payment!</h3>';
          // Or go to another URL:  actions.redirect('thank_you.html');
			var filenameSafeOrderId = data.orderID.replace(/[^a-z0-9]/gi, '_');
			var filenameSafetransactionId = transaction.id.replace(/[^a-z0-9]/gi, '_');		  
			var purchaseReceiptUrl = `https://localhost:8888/Receipt/${data.orderID}`;		  
			//actions.redirect(productDownloadPageFileFullName);
			window.location = purchaseReceiptUrl;
        });
    },
  })
  .render("#paypal-button-container");

// If this returns false or the card fields aren't visible, see Step #1.
if (paypal.HostedFields.isEligible()) {
  let orderId;

  // Renders card fields
  paypal.HostedFields.render({
    // Call your server to set up the transaction
    createOrder: () => {
      return fetch("/Checkout/api/orders", {
        method: "post",
        // use the "body" param to optionally pass additional order information like
        // product ids or amount.
      })
        .then((res) => res.json())
        .then((orderData) => {
          orderId = orderData.id; // needed later to complete capture
          return orderData.id;
        });
    },
    styles: {
      ".valid": {
        color: "green",
      },
      ".invalid": {
        color: "red",
      },
    },
    fields: {
      number: {
        selector: "#card-number",
        placeholder: "4111 1111 1111 1111",
      },
      cvv: {
        selector: "#cvv",
        placeholder: "123",
      },
      expirationDate: {
        selector: "#expiration-date",
        placeholder: "MM/YY",
      },
    },
  }).then((cardFields) => {
    document.querySelector("#card-form").addEventListener("submit", (event) => {
	  var notificationElement = document.getElementById('card-payment-error-notification-area');
	  notificationElement.innerHTML = '';		
	  notificationElement = document.getElementById('card-payment-processing-notification-area');
	  notificationElement.innerHTML = '<p>Processing payment.  Please wait for a moment.</p>';
	  
      event.preventDefault();
      cardFields
        .submit({
          // Cardholder's first and last name
          cardholderName: document.getElementById("card-holder-name").value,
          // Billing Address
          billingAddress: {
            // Street address, line 1
            streetAddress: document.getElementById(
              "card-billing-address-street"
            ).value,
            // Street address, line 2 (Ex: Unit, Apartment, etc.)
            extendedAddress: document.getElementById(
              "card-billing-address-unit"
            ).value,
            // State
            region: document.getElementById("card-billing-address-state").value,
            // City
            locality: document.getElementById("card-billing-address-city")
              .value,
            // Postal Code
            postalCode: document.getElementById("card-billing-address-zip")
              .value,
            // Country Code
            countryCodeAlpha2: document.getElementById(
              "card-billing-address-country"
            ).value,
          },
        })
        .then(() => {			
          fetch(`/Checkout/api/orders/${orderId}/capture`, {
            method: "post",
          })
            .then((res) => res.json())
            .then((orderData) => {
              // Two cases to handle:
              //   (1) Other non-recoverable errors -> Show a failure message
              //   (2) Successful transaction -> Show confirmation or thank you
              // This example reads a v2/checkout/orders capture response, propagated from the server
              // You could use a different API or structure for your 'orderData'
              const errorDetail =
                Array.isArray(orderData.details) && orderData.details[0];
              if (errorDetail) {
                var msg = "Your transaction could not be processed.";
                if (errorDetail.description)
                  msg += "\n\n" + errorDetail.description;
                if (orderData.debug_id) msg += " (" + orderData.debug_id + ")";
                //return alert(msg); // Show a failure message
				var notificationElement = document.getElementById('card-payment-processing-notification-area');
				notificationElement.innerHTML = '<p style="color: red;overflow-wrap: break-word;">Payment processing error.  Please see error below.</p>';
				notificationElement = document.getElementById('card-payment-error-notification-area');
				notificationElement.innerHTML = '<p style="color: red;overflow-wrap: break-word;">Payment transaction failure.  Please correct the error and try again.  ' + 
					'If you need support, please email a copy of the following error to <a href="mailto:support@allenyoung.dev">support@allenyoung.dev</a>.</p>' +
					`<p style="color: red;margin: 0; padding: 0;overflow-wrap: break-word;">${JSON.stringify(orderData)}</p>`;
				return;
              }
              // Show a success message or redirect
              //alert("Transaction completed!");
				console.log(JSON.stringify(orderData));
				const transaction = orderData.purchase_units[0].payments.captures[0];
				//console.log(transaction.status);
				if (transaction.status == 'COMPLETED') {
					var filenameSafeOrderId = orderData.id.replace(/[^a-z0-9]/gi, '_');
					var filenameSafetransactionId = transaction.id.replace(/[^a-z0-9]/gi, '_');		  
					var purchaseReceiptUrl = `https://localhost:8888/Receipt/${orderData.id}`;	  
					//actions.redirect(productDownloadPageFileFullName);
					window.location = purchaseReceiptUrl;
				} else {
					var notificationElement = document.getElementById('card-payment-processing-notification-area');
					notificationElement.innerHTML = '<p style="color: red;overflow-wrap: break-word;">Payment processing error.  Please see error below.</p>';
					notificationElement = document.getElementById('card-payment-error-notification-area');
					notificationElement.innerHTML = '<p style="color: red;overflow-wrap: break-word;">Card transaction could not be completed.  Payment was not approved.  Please try a different card.  ' + 
						'If you need support, please email a copy of the following error to <a href="mailto:support@allenyoung.dev">support@allenyoung.dev</a>.</p>' +
						`<p style="color: red;margin: 0; padding: 0;overflow-wrap: break-word;">${JSON.stringify(orderData)}</p>`;					
				}
            });
        })
        .catch((err) => {
          //alert("Payment could not be captured! " + JSON.stringify(err));
		  var notificationElement = document.getElementById('card-payment-processing-notification-area');
		  notificationElement.innerHTML = '<p style="color: red;">Payment processing error.  Please see error below.</p>';
		  notificationElement = document.getElementById('card-payment-error-notification-area');
		  var errorMessage = '<p style="color: red;">Payment could not be captured.  Please correct the following error(s) and try again.  ' + 
			'If you need support, please email a copy of the following error(s) to <a href="mailto:support@allenyoung.dev">support@allenyoung.dev</a>.</p>';
		  try {
			for (const property in err['details']) {
			  errorMessage += `<p style="color: red;margin-bottom: 0;padding-bottom: 0;overflow-wrap: break-word;">Error field:  ${err['details'][property]['field'].replace('/payment_source/card/', '')}</p>`;
			  errorMessage += `<p style="color: red;margin-bottom: 0;padding-bottom: 0;margin-top: 0;overflow-wrap: break-word;">Error description:  ${err['details'][property]['description']}</p>`;
			}			  
			  
		  } catch (error) {}

		  errorMessage += `<p style="color: red;margin: 0; padding: 0;overflow-wrap: break-word;"><br>Original error message<br>${JSON.stringify(err)}</p>`;
			
		  notificationElement.innerHTML = errorMessage;
        });
    });
  });
} else {
  // Hides card fields if the merchant isn't eligible
  document.querySelector("#card-form").style = "display: none";
}

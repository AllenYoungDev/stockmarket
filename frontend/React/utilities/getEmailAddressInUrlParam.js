export function getEmailAddressInUrlParam() {
    var url_string = window.location; 
    var url = new URL(url_string);
    var emailAddress = url.searchParams.get("emailAddress");
    console.log(`EmailVerificationControls() emailAddress:  ${emailAddress}.`);
    return emailAddress;
}
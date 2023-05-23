export function getEmailAddressAndAccessTokenInUrlParam() {
    var url_string = window.location; 
    var url = new URL(url_string);
    var emailAddress = url.searchParams.get("emailAddress");
    var accessToken = url.searchParams.get("accessToken");
    console.log(`PasswordResetControls() accessToken:  ${accessToken}.`);
    return [emailAddress, accessToken];
}
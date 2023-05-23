const reLetterChecker = /[a-zA-Z]/;
const reNumberChecker = /[0-9]/;
const reSpecialCharacterChecker = /[\~\`\!\@\#\$\%\^\&\*\-\_\+\=\|\\\/\?\;\:\"\'\<\>\,\.\{\}\[\]\(\)]/;

export function checkPasswordFormat(password) {
    var numberOfCharactersInPassword = password.trim().length;

    if (numberOfCharactersInPassword < 10) {return false;}

    if (password.match(reLetterChecker) === null) {return false;}

    if (password.match(reNumberChecker) === null) {return false;}

    if (password.match(reSpecialCharacterChecker) === null) {return false;}

    return true;
}
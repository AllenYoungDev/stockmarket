import "dotenv/config";

import process from 'node:process';
import * as child_process from "node:child_process";
import * as http from "node:http";
import * as https from "node:https";
import * as database_access from "./database-access.js";

import {setTimeout} from "timers/promises";

import * as server from "./server.js";

import debugFactory from 'debug';
const debug = debugFactory('server-test');

const osType = process.platform;
var subprocessBackendServer = null;

var exitCode = 1;

/*
A single function defined in this module, named testBackendRouteMethods() is used
to test all the route methods in server.js.

Using a return statement at the module level generates "Illegal return statement" error;
process.exit() exits 
"even if there are still asynchronous operations pending that have not yet completed fully"
as specified in https://nodejs.org/api/process.html#processexitcode.

So, a separate function is used for testing, to allow conditional returns and skipping
executing the remaining code when an error is generated.

The following statements can be used for conditional return or early return,
and for testing and writing this module's code gradually.
cleanup(); return;


For the proper uses of single and double quotation marks in SQLite3 CLI commands,
refer to the "SQLite3 CLI command execution with SQL statement" section in the design
document.


testBackendRouteMethods() asynchronously executes "DEBUG=* node server.js" command on Linux,
and "set DEBUG=* & node server.js" command on Windows, as a subprocess, synchronously executes
SQLite3 CLI commands, and captures and verifies the main-process and subprocess stdout and 
stderr outputs, for fully automated server.js route methods testing.
*/

/* **************************************************************************************
  **************************************************************************************
Code for capturing the stdout output
CREDIT:  https://gajus.medium.com/capturing-stdout-stderr-in-node-js-using-domain-module-3c86f5b1536d
***************************************************************************************
*************************************************************************************** */
let mainprocessCliStdoutOutput = '';

const originalStdoutWrite = process.stdout.write.bind(process.stdout);

process.stdout.write = (chunk, encoding, callback) => {
  if (typeof chunk === 'string') {
    mainprocessCliStdoutOutput += chunk;
  }

  return originalStdoutWrite(chunk, encoding, callback);
};

//process.stdout.write = originalStdoutWrite;
//The above restores process.stdout.write to the original.


/* **************************************************************************************
  **************************************************************************************
Code for capturing the stderr output (for capturing the debug() outputs)
CREDIT:  https://gajus.medium.com/capturing-stdout-stderr-in-node-js-using-domain-module-3c86f5b1536d
https://expressjs.com/en/guide/debugging.html
https://www.npmjs.com/package/debug
***************************************************************************************
*************************************************************************************** */
let mainprocessCliStderrOutput = '';

const originalStderrWrite = process.stderr.write.bind(process.stderr);

process.stderr.write = (chunk, encoding, callback) => {
  if (typeof chunk === 'string') {
    mainprocessCliStderrOutput += chunk;
  }

  return originalStderrWrite(chunk, encoding, callback);
};


/**************************************************************************************
***************************************************************************************
database-access.js API test code
***************************************************************************************
*************************************************************************************** */
var previousUserEmailAddress = ''
var userEmailAddress = process.env.ALLEN_YOUNG_STOCKMARKET_SERVER_TEST_USER_EMAIL_ADDRESS

const reLatestStockStatsTableEntryPrimaryKeyExtractor = 
  /(.*?)\|/;
const reAssignNewAccessTokenFunctionOutputAccessTokenParser = 
  /assignNewAccessToken\(\) new access token:  (.*?)\./g;
const reUpdatePasswordInUsersTableFunctionPasswordSaltParser = 
  /updatePasswordInUsersTable\(\) passwordSalt:  (.*?)\./g;
const reUpdatePasswordInUsersTableFunctionSaltHashedPasswordParser = 
  /updatePasswordInUsersTable\(\) saltHashedPassword:  (.*?)\./g;    
const reUpdateUserAccountSettingsFunctionSqlCommandParser = 
  /updateUserAccountSettings\(\) SQL command:  (.*)\./g;  
const reUpdateUserAccountSettingsFunctionPasswordSaltParser = 
  /updateUserAccountSettings\(\) passwordSalt:  (.*?)\./g;
const reUpdateUserAccountSettingsFunctionSaltHashedPasswordParser = 
  /updateUserAccountSettings\(\) saltHashedPassword:  (.*?)\./g;  
  
const reUserTableEntryAccessTokenExtractor = 
  /(.*?)\|(.*?)\|(.*?)\|(.*?)\|(.*?)\|(.*?)\|(.*?)\|(.*?)\|(.*?)\|(.*?)\|/;

var regularExpressionMatchArray

var result
var stdoutChild

var accessToken
var password
var passwordSalt
var saltHashedPassword
var adminStatus
var firstName
var lastName
var emailAddress
var emailAddressVerified
var phoneNumber
var latestStockStatsTableEntryPrimaryKey
var userPrimaryKey
var payPalTransactionOrderId = ''
var payPalTransactionOrderId2 = ''
var companyStockTransactionId
var companyStockTransactionId2

var emailAddressVerifiedToCheck
var saltHashedPasswordToCheck
var passwordSaltToCheck
var adminStatusToCheck

var numberOfSharesToBuy

var winSqlite3CliCommand, nixSqlite3CliCommand, errorMessage
var sqlite3CliCommandExecutionResult

var sqlCommand

var errorGenerated

var datetimeTest

var pageNumber


async function sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
  requestContentType, requestBody, requestCookies, responseContentType) {
  //https://nodejs.org/api/http.html#httprequesturl-options-callback
  //https://nodejs.org/api/http.html#class-httpclientrequest
  //https://nodejs.org/api/http.html#requestwritechunk-encoding-callback

  //requestBody must be a string.  For sending JSON object, use JSON.stringify().
  //requestCookies must be an array in the form of ['foo=bar', 'bar=baz'].

  const responseWaitCycleTimeoutInMilliseconds = 50
  const totalAllowedResponseWaitTimeInMilliseconds = 30000 //30 seconds

  var requestHeaders

  var responseReceived = false
  var totalResponseWaitTime = 0.0

  var responseStatus = 0
  var responseHeaders = null
  if (responseContentType == 'application/json') {
    var responseBody = {}
  } else {
    var responseBody = ''
  }
  var responseCookies = []
  
  /*
  const postData = JSON.stringify({
    'msg': 'Hello World!',
  });
  */
  
  if (Array.isArray(requestCookies) && requestCookies.length) {
    requestHeaders = {
      'Content-Type': requestContentType, //e.g. 'application/json', 'text/html'
      'Content-Length': Buffer.byteLength(requestBody),
      'Cookie': requestCookies,
    }
  } else {
    requestHeaders = {
      'Content-Type': requestContentType, //e.g. 'application/json', 'text/html'
      'Content-Length': Buffer.byteLength(requestBody),
    }
  }

  const options = {
    hostname: requestHostname, //e.g. 'www.google.com'
    port: requestPort, //e.g. 80
    path: requestPath, //e.g. '/upload'
    method: requestMethod, //e.g. 'POST'
    headers: requestHeaders,
  };


  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    responseStatus = res.statusCode
    
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    responseHeaders = res.headers

    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`);
      
      console.log(`typeof chunk:  ${typeof chunk}`)

      if (responseContentType == 'application/json') {
        responseBody = {...responseBody, ...JSON.parse(chunk)}
      } else {
        responseBody += chunk
      }
    });
    res.on('end', () => {
      console.log('No more data in response.');
      responseReceived = true
    });
  });

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
    return null
  });

  // Write data to request body
  if (requestBody !== '') {
    req.write(requestBody);
  }
  req.end();



	while (!responseReceived) {
		await setTimeout(responseWaitCycleTimeoutInMilliseconds);
    totalResponseWaitTime += responseWaitCycleTimeoutInMilliseconds
    if (totalResponseWaitTime > totalAllowedResponseWaitTimeInMilliseconds) {
      throw new Error('No response within the maximum allowed response wait time!');
    }
	}

  if ("set-cookie" in responseHeaders) {
    responseCookies = responseHeaders["set-cookie"]
  }

  return {'responseStatus': responseStatus, 'responseHeaders': responseHeaders, 
    'responseBody': responseBody, 'responseCookies': responseCookies}
}

function executeSqlite3CliCommand(winSqlite3CliCommand, nixSqlite3CliCommand, errorMessage) {
  var sqlite3CliCommand
  var stdoutChild

  try {
    //Stock stats table entry deletion
    if (osType === 'win32') {
      sqlite3CliCommand = winSqlite3CliCommand
    } else {
      sqlite3CliCommand = nixSqlite3CliCommand
    }
    //console.log(`executeSqlite3CliCommand() sqlite3CliCommand:  ${sqlite3CliCommand}`)
    stdoutChild = child_process.execSync(sqlite3CliCommand)
  } catch(error) {
    console.log(errorMessage + '  ' + error)
    return null
  }

  return stdoutChild.toLocaleString()
}

async function performUpdateUserAccountSettingsTest(accessToken, firstName, lastName, 
  emailAddress, phoneNumber, password) {

  console.log('-------------updateUserAccountSettings() test-------------')
  console.log(`firstName: ${firstName}, lastName: ${lastName}, ` +
    `emailAddress: ${emailAddress}, phoneNumber: ${phoneNumber}, password: ${password}`)

  try {
    await server.database_access.updateUserAccountSettings(accessToken, firstName, lastName, 
      emailAddress, phoneNumber, password)
  } catch(error) {
    console.log('server.js test failure!  updateUserAccountSettings() raised error!  ' + error)
    return null
  }

  //console.log(mainprocessCliStderrOutput)
  regularExpressionMatchArray = reUpdateUserAccountSettingsFunctionSqlCommandParser.exec(mainprocessCliStderrOutput)
  if (regularExpressionMatchArray == null || regularExpressionMatchArray.length !== 2) {
    console.log('server.js test failure!  reUpdateUserAccountSettingsFunctionSqlCommandParser returned invalid result!  ' + String(regularExpressionMatchArray))
    return null  
  }
  sqlCommand = regularExpressionMatchArray[1]
  console.log(`regularExpressionMatchArray[1] (SQL command):  ${sqlCommand}`)

  /*
  if (sqlCommand != `UPDATE users SET "First name" = '${firstName}' WHERE "Access token" = '${accessToken}';`) {
    console.log('server.js test failure!  updateUserAccountSettings() generated incorrect SQL command!  ' + sqlCommand)
    return null  
  }
  */

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM ""users"" WHERE ""Email address"" = '${userEmailAddress}';"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM \\"users\\" WHERE \\"Email address\\" = '${userEmailAddress}';"` 
  errorMessage = 'server.js test failure!  Added user query error in performUpdateUserAccountSettingsTest()!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {return null;}

  console.log(sqlite3CliCommandExecutionResult)

  if (firstName != '' && !sqlite3CliCommandExecutionResult.includes(firstName)) {
    console.log('server.js test failure!  updateUserAccountSettings() firstName update not done in the database!')
    return null
  }

  if (lastName != '' && !sqlite3CliCommandExecutionResult.includes(lastName)) {
    console.log('server.js test failure!  updateUserAccountSettings() lastName update not done in the database!')
    return null
  }

  if (emailAddress != '' && !sqlite3CliCommandExecutionResult.includes(emailAddress)) {
    console.log('server.js test failure!  updateUserAccountSettings() emailAddress update not done in the database!')
    return null
  }

  if (phoneNumber != '' && !sqlite3CliCommandExecutionResult.includes(phoneNumber)) {
    console.log('server.js test failure!  updateUserAccountSettings() phoneNumber update not done in the database!')
    return null
  }

  if (password != '') {
      regularExpressionMatchArray = 
      reUpdateUserAccountSettingsFunctionPasswordSaltParser.exec(mainprocessCliStderrOutput)
    if (regularExpressionMatchArray == null || regularExpressionMatchArray.length !== 2) {
      console.log('server.js test failure!  reUpdateUserAccountSettingsFunctionPasswordSaltParser returned invalid result!  ' + String(regularExpressionMatchArray))
      return null    
    }
    passwordSalt = regularExpressionMatchArray[1]
    console.log(`regularExpressionMatchArray[1] (password salt):  ${passwordSalt}`)

    regularExpressionMatchArray = 
    reUpdateUserAccountSettingsFunctionSaltHashedPasswordParser.exec(mainprocessCliStderrOutput)
    if (regularExpressionMatchArray == null || regularExpressionMatchArray.length !== 2) {
      console.log('server.js test failure!  reUpdateUserAccountSettingsFunctionSaltHashedPasswordParser returned invalid result!  ' + String(regularExpressionMatchArray))
      return null  
    }
    saltHashedPassword = regularExpressionMatchArray[1]
    console.log(`regularExpressionMatchArray[1] (salt-hashed password):  ${saltHashedPassword}`)

    if(!sqlite3CliCommandExecutionResult.includes(passwordSalt) ||
    !sqlite3CliCommandExecutionResult.includes(saltHashedPassword)) {
      console.log('server.js test failure!  updateUserAccountSettings() password update not done in the database!')
      return null
      }
  }

  return 1
}

function cleanup() {
  var winSqlite3CliCommand, nixSqlite3CliCommand, errorMessage

  try {
    //Close the server
    if (server.serverRunning) {server.closeServer()}

    //Stock stats table entry deletion
    winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
    `"DELETE FROM ""stock stats"" WHERE ""Stats entry datetime"" = 1;"`
    nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
    `"DELETE FROM \\"stock stats\\" WHERE \\"Stats entry datetime\\" = 1;"`
    errorMessage = 'server.js test failure!  stock stats entry delete failure in cleanup()!'
    executeSqlite3CliCommand(winSqlite3CliCommand, nixSqlite3CliCommand, errorMessage)

    //Added user deletion
    winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
    `"DELETE FROM ""users"" WHERE ""Email address"" = '${userEmailAddress}';"`
    nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
    `"DELETE FROM \\"users\\" WHERE \\"Email address\\" = '${userEmailAddress}';"`
    errorMessage = 'server.js test failure!  Added user deletion failure in cleanup()!'
    executeSqlite3CliCommand(winSqlite3CliCommand, nixSqlite3CliCommand, errorMessage)

    if (previousUserEmailAddress != '') {
      winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
      `"DELETE FROM ""users"" WHERE ""Email address"" = '${previousUserEmailAddress}';"`
      nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
      `"DELETE FROM \\"users\\" WHERE \\"Email address\\" = '${previousUserEmailAddress}';"`
      errorMessage = 'server.js test failure!  Previous added user deletion failure in cleanup()!'
      executeSqlite3CliCommand(winSqlite3CliCommand, nixSqlite3CliCommand, errorMessage)
    }

    //Stock reservation table entries deletion
    winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
    `"DELETE FROM ""stock reservation"" WHERE ""Stock stats table entry primary key"" = ${latestStockStatsTableEntryPrimaryKey};"`
    nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
    `"DELETE FROM \\"stock reservation\\" WHERE \\"Stock stats table entry primary key\\" = ${latestStockStatsTableEntryPrimaryKey};"`
    errorMessage = 'server.js test failure!  stock reservation entries delete failure in cleanup()!'
    executeSqlite3CliCommand(winSqlite3CliCommand, nixSqlite3CliCommand, errorMessage)

    //Transactions table entries deletion
    if (payPalTransactionOrderId != '') {
      winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
      `"DELETE FROM ""transactions"" WHERE ""PayPal transaction (order) ID"" = '${payPalTransactionOrderId}';"`
      nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
      `"DELETE FROM \\"transactions\\" WHERE \\"PayPal transaction (order) ID\\" = '${payPalTransactionOrderId}';"`
      errorMessage = 'server.js test failure!  transactions entries delete failure in cleanup()!'
      executeSqlite3CliCommand(winSqlite3CliCommand, nixSqlite3CliCommand, errorMessage)
    }
  } catch(error) {
    console.log('server.js test failure!  cleanup() raised error!  ' + error)
    return
  }
}

async function testBackendRouteMethods() {
  /* **************************************************************************************
  Initialization
  *************************************************************************************** */
  var result

  var response

  var requestHostname
  var requestPort
  var requestPath
  var requestMethod
  var requestContentType
  var requestBody
  var requestCookies
  var responseContentType
  

  //Stock stats table entry addition
  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
    `"INSERT INTO ""stock stats"" ('Current Company valuation', ` +
    `'Number of authorized Company shares', 'Number of issued Company shares', ` +
    `'Number of outstanding Company shares', ` +
    `'Number of Company shares available for purchase', 'Price per share', ` +
    `'Cash value of the shares available for purchase', 'Stats entry datetime') ` +
    `VALUES(4000000, 40000, 14000, 14000, 2000, 100, 200000, 1);"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
    `"INSERT INTO \\"stock stats\\" ('Current Company valuation', ` +
    `'Number of authorized Company shares', 'Number of issued Company shares', ` +
    `'Number of outstanding Company shares', ` +
    `'Number of Company shares available for purchase', 'Price per share', ` +
    `'Cash value of the shares available for purchase', 'Stats entry datetime') ` +
    `VALUES(4000000, 40000, 14000, 14000, 2000, 100, 200000, 1);"` 
  console.log(`Stock stats table entry addition winSqlite3CliCommand:  ${winSqlite3CliCommand}`)
  console.log(`Stock stats table entry addition nixSqlite3CliCommand:  ${nixSqlite3CliCommand}`)
  errorMessage = 'server.js test failure!  Stock stats table entry addition failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM ""stock stats"" WHERE ""Stats entry datetime"" = 1;"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM \\"stock stats\\" WHERE \\"Stats entry datetime\\" = 1;"` 
  errorMessage = 'server.js test failure!  Stock stats table entry query failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  console.log(sqlite3CliCommandExecutionResult)

  if (!sqlite3CliCommandExecutionResult.includes(
    "|4000000.0|40000|14000|14000|2000|100.0|200000.0|1")) {
    console.log('server.js test failure!  No added stock stats table entry!')
    cleanup()
    return    
  }
  
  regularExpressionMatchArray = reLatestStockStatsTableEntryPrimaryKeyExtractor.exec(sqlite3CliCommandExecutionResult)
  if (regularExpressionMatchArray == null || regularExpressionMatchArray.length !== 2) {
    console.log('server.js test failure!  reLatestStockStatsTableEntryPrimaryKeyExtractor returned invalid result!  ' + String(regularExpressionMatchArray))
    cleanup()
    return 
  }
  console.log(`regularExpressionMatchArray:  ${regularExpressionMatchArray}`)

  try {
    latestStockStatsTableEntryPrimaryKey = parseInt(regularExpressionMatchArray[1], 10)
  } catch (error) {
    console.log('server.js test failure!  Error on converting reLatestStockStatsTableEntryPrimaryKeyExtractor result to integer!  ' + String(regularExpressionMatchArray) + '  ' + error)
    cleanup()
    return     
  }

  if (isNaN(latestStockStatsTableEntryPrimaryKey)) {
    console.log('server.js test failure!  reLatestStockStatsTableEntryPrimaryKeyExtractor result converted to NaN!  ' + String(regularExpressionMatchArray))
  }

  console.log(`latestStockStatsTableEntryPrimaryKey:  ${latestStockStatsTableEntryPrimaryKey}`)


  /* **************************************************************************************
  Server start
  *************************************************************************************** */
  await server.runServer()


  /* **************************************************************************************
  User registration webpage route methods test
  *************************************************************************************** */

  //
  // /CheckEmailAddress test 1
  //
  console.log('============= /CheckEmailAddress route method test 1 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = '/CheckEmailAddress'
  requestMethod = 'GET'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({'emailAddress': 'test@@test.com' /*userEmailAddress*/})
  requestCookies = null
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'invalid email address format') {
    console.log('server.js test failure!  /CheckEmailAddress route method test 1 returned an incorrect value.')
    cleanup()
    return
  }

  console.log('============= /CheckEmailAddress route method test 1 end ===============')
  

  //
  // /CheckEmailAddress test 2
  //
  console.log('============= /CheckEmailAddress route method test 2 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = '/CheckEmailAddress'
  requestMethod = 'GET'
  requestContentType = 'application/json'
requestBody = JSON.stringify({'emailAddress': userEmailAddress})
  requestCookies = null
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'available for registration') {
    console.log('server.js test failure!  /CheckEmailAddress route method test 2 returned an incorrect value.')
    cleanup()
    return
  }

  console.log('============= /CheckEmailAddress route method test 2 end ===============')
  

  //
  // /RegisterUser test
  //
  console.log('\n============= /RegisterUser route method test start ===============')

  firstName = 'John'
  lastName = 'Doe'
  emailAddress = userEmailAddress
  phoneNumber = '111-111-1111'
  password = '12345abced!'

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = '/RegisterUser'
  requestMethod = 'POST'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({'firstName': firstName, 'lastName': lastName, 'emailAddress': emailAddress, 
  'phoneNumber': phoneNumber, 'password': password})
  requestCookies = null
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] === 'blank input' || response['responseBody'] === 'database access error') {
    console.log('server.js test failure!  /RegisterUser route method test didn\'t return an access token.')
    cleanup()
    return
  } else {
    accessToken = response['responseBody']
  }

  console.log('============= /RegisterUser route method test end ===============\n')


  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM ""users"" WHERE ""Email address"" = '${userEmailAddress}';"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM \\"users\\" WHERE \\"Email address\\" = '${userEmailAddress}';"` 
  errorMessage = 'server.js test failure!  Added user query error!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  console.log(sqlite3CliCommandExecutionResult)

  if (!sqlite3CliCommandExecutionResult.includes(
    `|${firstName}|${lastName}|${userEmailAddress}|false|${phoneNumber}|`)) {
    console.log('server.js test failure!  No added user in the database!')
    cleanup()
    return    
  }


  //
  // /SendEmailAddressVerificationEmail/:accessToken/:emailAddress test
  //
  console.log('\n============= /SendEmailAddressVerificationEmail/:accessToken/:emailAddress route method test start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = `/SendEmailAddressVerificationEmail/${accessToken}/null`
  requestMethod = 'GET'
  requestContentType = 'text/html'
  requestBody = ''
  requestCookies = null
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'success') {
    console.log("server.js test failure!  /SendEmailAddressVerificationEmail/:accessToken/:emailAddress route method test didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /SendEmailAddressVerificationEmail/:accessToken/:emailAddress route method test end ===============\n')


  //
  // /GetEmailAddressVerificationSuccessPage test
  //
  console.log('\n============= /GetEmailAddressVerificationSuccessPage route method test 1 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = '/GetEmailAddressVerificationSuccessPage/' + '1111-1111-0000'
  requestMethod = 'GET'
  requestContentType = 'application/json'
  requestBody = ''
  requestCookies = null
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'invalid access token') {
    console.log("server.js test failure!  /GetEmailAddressVerificationSuccessPage route method test didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /GetEmailAddressVerificationSuccessPage route method test 1 end ===============\n')


  console.log('\n============= /GetEmailAddressVerificationSuccessPage route method test 2 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = '/GetEmailAddressVerificationSuccessPage/' + accessToken
  requestMethod = 'GET'
  requestContentType = 'application/json'
  requestBody = ''
  requestCookies = null
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] === 'database access error' || response['responseBody'] === 'invalid access token') {
    console.log("server.js test failure!  /GetEmailAddressVerificationSuccessPage route method test didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /GetEmailAddressVerificationSuccessPage route method test 2 end ===============\n')

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM ""users"" WHERE ""Email address"" = '${userEmailAddress}';"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM \\"users\\" WHERE \\"Email address\\" = '${userEmailAddress}';"` 
  errorMessage = 'server.js test failure!  Added user query error!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  console.log(sqlite3CliCommandExecutionResult)

  if (!sqlite3CliCommandExecutionResult.includes(
    `|${firstName}|${lastName}|${userEmailAddress}|true|${phoneNumber}|`)) {
    console.log('server.js test failure!  User email address verification failed to set to true in the database!')
    cleanup()
    return    
  }


  //
  // /SendResetPasswordEmail test
  //
  console.log('\n============= /SendResetPasswordEmail route method test start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = `/SendResetPasswordEmail/${emailAddress}`
  requestMethod = 'GET'
  requestContentType = 'text/html'
  requestBody = ''
  requestCookies = null
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseStatus'] !== 200) {
    console.log("server.js test failure!  /SendResetPasswordEmail route method test didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /SendResetPasswordEmail route method test end ===============\n')

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM ""users"" WHERE ""Email address"" = '${userEmailAddress}';"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM \\"users\\" WHERE \\"Email address\\" = '${userEmailAddress}';"` 
  errorMessage = 'server.js test failure!  Added user query error!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  console.log(sqlite3CliCommandExecutionResult)

  if (!sqlite3CliCommandExecutionResult.includes(
    `|${firstName}|${lastName}|${userEmailAddress}|true|${phoneNumber}|`)) {
    console.log('server.js test failure!  No added user in the database!')
    cleanup()
    return    
  }

  regularExpressionMatchArray = reUserTableEntryAccessTokenExtractor.exec(sqlite3CliCommandExecutionResult)
  if (regularExpressionMatchArray == null || regularExpressionMatchArray.length !== 11) {
    console.log('server.js test failure!  reUserTableEntryAccessTokenExtractor returned invalid result!  ' + String(regularExpressionMatchArray))
    cleanup()
    return 
  }
  console.log(`regularExpressionMatchArray:  ${regularExpressionMatchArray}`)
  accessToken = regularExpressionMatchArray[10]

  //
  // /ResetPassword test
  //
  console.log('\n============= /ResetPassword route method test 1 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = '/ResetPassword'
  requestMethod = 'POST'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({'accessToken': '1111-1111-0000000', 'password': password})
  requestCookies = null
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] === 'database access error' || response['responseStatus'] === 200) {
    console.log("server.js test failure!  /ResetPassword route method test didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /ResetPassword route method test 1 end ===============\n')


  console.log('\n============= /ResetPassword route method test 2 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = '/ResetPassword'
  requestMethod = 'POST'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({'accessToken': accessToken, 'password': password})
  requestCookies = null
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] === 'database access error' || response['responseStatus'] !== 200) {
    console.log("server.js test failure!  /ResetPassword route method test didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /ResetPassword route method test 2 end ===============\n')


  /* **************************************************************************************
  Login webpage route methods test
  *************************************************************************************** */

  //
  // /Login test
  //
  console.log('\n============= /Login route method test 1 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = '/Login'
  requestMethod = 'POST'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({'emailAddress': 'fake@fake.com', 'password': password})
  requestCookies = null
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'invalid email address') {
    console.log("server.js test failure!  /Login route method test didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /Login route method test 1 end ===============\n')


  console.log('\n============= /Login route method test 2 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = '/Login'
  requestMethod = 'POST'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({'emailAddress': emailAddress, 'password': '000'})
  requestCookies = null
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'invalid password') {
    console.log("server.js test failure!  /Login route method test didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /Login route method test 2 end ===============\n')


  console.log('\n============= /Login route method test 3 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = '/Login'
  requestMethod = 'POST'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({'emailAddress': emailAddress, 'password': password})
  requestCookies = null
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'success') {
    console.log("server.js test failure!  /Login route method test didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /Login route method test 3 end ===============\n')


  //
  // /Logout test
  //
  console.log('\n============= /Logout route method test start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = '/Logout'
  requestMethod = 'DELETE'
  requestContentType = 'application/json'
  requestBody = '{}'
  requestCookies = null
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseStatus'] !== 200) {
    console.log("server.js test failure!  /Logout route method test didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /Logout route method test end ===============\n')

 
  /* **************************************************************************************
  Stockmarket home webpage route methods test
  *************************************************************************************** */

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM ""users"" WHERE ""Email address"" = '${userEmailAddress}';"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM \\"users\\" WHERE \\"Email address\\" = '${userEmailAddress}';"` 
  errorMessage = 'server.js test failure!  Added user query error!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  console.log(sqlite3CliCommandExecutionResult)

  if (!sqlite3CliCommandExecutionResult.includes(
    `|${firstName}|${lastName}|${userEmailAddress}|true|${phoneNumber}|`)) {
    console.log('server.js test failure!  No added user in the database!')
    cleanup()
    return    
  }

  regularExpressionMatchArray = reUserTableEntryAccessTokenExtractor.exec(sqlite3CliCommandExecutionResult)
  if (regularExpressionMatchArray == null || regularExpressionMatchArray.length !== 11) {
    console.log('server.js test failure!  reUserTableEntryAccessTokenExtractor returned invalid result!  ' + String(regularExpressionMatchArray))
    cleanup()
    return 
  }
  console.log(`regularExpressionMatchArray:  ${regularExpressionMatchArray}`)
  accessToken = regularExpressionMatchArray[10]

  //
  // /CheckAccessTokenValidity test
  //
  console.log('\n============= /CheckAccessTokenValidity route method test 1 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = '/CheckAccessTokenValidity'
  requestMethod = 'GET'
  requestContentType = 'application/json'
  requestBody = '{}'
  requestCookies = null
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'No accessToken cookie') {
    console.log("server.js test failure!  /CheckAccessTokenValidity route method test 1 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /CheckAccessTokenValidity route method test 1 end ===============\n')  


  console.log('\n============= /CheckAccessTokenValidity route method test 2 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = '/CheckAccessTokenValidity'
  requestMethod = 'GET'
  requestContentType = 'application/json'
  requestBody = '{}'
  requestCookies = [`accessToken=1111-1111-111111`, 'admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'invalid') {
    console.log("server.js test failure!  /CheckAccessTokenValidity route method test 2 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /CheckAccessTokenValidity route method test 2 end ===============\n')  


  console.log('\n============= /CheckAccessTokenValidity route method test 3 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = '/CheckAccessTokenValidity'
  requestMethod = 'GET'
  requestContentType = 'application/json'
  requestBody = '{}'
  requestCookies = [`accessToken=${accessToken}`, 'admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'valid') {
    console.log("server.js test failure!  /CheckAccessTokenValidity route method test 3 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /CheckAccessTokenValidity route method test 3 end ===============\n') 


  //
  // /GetCompanyStockData test
  //
  console.log('\n============= /GetCompanyStockData route method test start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = '/GetCompanyStockData'
  requestMethod = 'GET'
  requestContentType = 'application/json'
  requestBody = '{}'
  requestCookies = [`accessToken=${accessToken}`, 'admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseStatus'] !== 200) {
    console.log("server.js test failure!  /GetCompanyStockData route method test didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /GetCompanyStockData route method test end ===============\n')


  //
  // /GetNumberOfCompanySharesOwnedByUser test
  //
  console.log('\n============= /GetNumberOfCompanySharesOwnedByUser route method test start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = '/GetNumberOfCompanySharesOwnedByUser'
  requestMethod = 'GET'
  requestContentType = 'application/json'
  requestBody = '{}'
  requestCookies = [`accessToken=${accessToken}`, 'admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseStatus'] !== 200) {
    console.log("server.js test failure!  /GetNumberOfCompanySharesOwnedByUser route method test didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /GetNumberOfCompanySharesOwnedByUser route method test end ===============\n')


  /* **************************************************************************************
  Buy checkout webpage route methods test
  *************************************************************************************** */

  //
  // /Checkout test
  //
  console.log('\n============= /Checkout route method test 1 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = '/Checkout'
  requestMethod = 'POST'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({})
  requestCookies = [`accessToken=${accessToken}`, 'admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'No number of shares to buy') {
    console.log("server.js test failure!  /Checkout route method test 1 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /Checkout route method test 1 end ===============\n')


  console.log('\n============= /Checkout route method test 2 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = '/Checkout'
  requestMethod = 'POST'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({'numberOfSharesToBuy': 100})
  requestCookies = null
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'No accessToken cookie') {
    console.log("server.js test failure!  /Checkout route method test 2 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /Checkout route method test 2 end ===============\n')


  console.log('\n============= /Checkout route method test 3 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = '/Checkout'
  requestMethod = 'POST'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({'numberOfSharesToBuy': 100})
  requestCookies = [`accessToken=1111-2222-3333-4444`, 'admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'invalid access token') {
    console.log("server.js test failure!  /Checkout route method test 3 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /Checkout route method test 3 end ===============\n')


  console.log('\n============= /Checkout route method test 4 start ===============')

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"UPDATE ""users"" SET ""Admin"" = 'true' WHERE ""Email address"" = '${emailAddress}';"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"UPDATE \\"users\\" SET \\"Admin\\" = 'true' WHERE \\"Email address\\" = '${emailAddress}';"` 
  errorMessage = 'server.js test failure!  /Checkout route method test 4 route method test users table entry update failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = '/Checkout'
  requestMethod = 'POST'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({'numberOfSharesToBuy': 100})
  requestCookies = [`accessToken=${accessToken}`, 'admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseStatus'] !== 400) {
    console.log("server.js test failure!  /Checkout route method test 4 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /Checkout route method test 4 end ===============\n')


  console.log('\n============= /Checkout route method test 5 start ===============')

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"UPDATE ""users"" SET ""Admin"" = 'false' WHERE ""Email address"" = '${emailAddress}';"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"UPDATE \\"users\\" SET \\"Admin\\" = 'false' WHERE \\"Email address\\" = '${emailAddress}';"` 
  errorMessage = 'server.js test failure!  /Checkout route method test 4 route method test users table entry update failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = '/Checkout'
  requestMethod = 'POST'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({'numberOfSharesToBuy': 1000000000000})
  requestCookies = [`accessToken=${accessToken}`, 'admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseStatus'] !== 400) {
    console.log("server.js test failure!  /Checkout route method test 5 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /Checkout route method test 5 end ===============\n')


  console.log('\n============= /Checkout route method test 6 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = '/Checkout'
  requestMethod = 'POST'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({'numberOfSharesToBuy': 100})
  requestCookies = [`accessToken=${accessToken}`, 'admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseStatus'] !== 200) {
    console.log("server.js test failure!  /Checkout route method test 6 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /Checkout route method test 6 end ===============\n')


  //
  // /Checkout/api/orders test
  //
  console.log('\n============= /Checkout/api/orders route method test 1 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = '/Checkout/api/orders'
  requestMethod = 'POST'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({})
  requestCookies = ['admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'No accessToken cookie') {
    console.log("server.js test failure!  /Checkout/api/orders route method test 1 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /Checkout/api/orders route method test 1 end ===============\n')  


  console.log('\n============= /Checkout/api/orders route method test 2 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = '/Checkout/api/orders'
  requestMethod = 'POST'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({})
  requestCookies = [`accessToken=1111-1111-111111`, 'admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'invalid access token') {
    console.log("server.js test failure!  /Checkout/api/orders route method test 2 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /Checkout/api/orders route method test 2 end ===============\n')


  console.log('\n============= /Checkout/api/orders route method test 3 start ===============')

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"UPDATE ""users"" SET ""Admin"" = 'true' WHERE ""Email address"" = '${emailAddress}';"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"UPDATE \\"users\\" SET \\"Admin\\" = 'true' WHERE \\"Email address\\" = '${emailAddress}';"` 
  errorMessage = 'server.js test failure!  /Checkout/api/orders route method test 3 route method test users table entry update failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = '/Checkout/api/orders'
  requestMethod = 'POST'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({})
  requestCookies = [`accessToken=${accessToken}`, 'admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseStatus'] !== 400) {
    console.log("server.js test failure!  /Checkout/api/orders route method test 3 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /Checkout/api/orders route method test 3 end ===============\n')


  console.log('\n============= /Checkout/api/orders route method test 4 start ===============')

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"UPDATE ""users"" SET ""Admin"" = 'false' WHERE ""Email address"" = '${emailAddress}';"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"UPDATE \\"users\\" SET \\"Admin\\" = 'false' WHERE \\"Email address\\" = '${emailAddress}';"` 
  errorMessage = 'server.js test failure!  /Checkout/api/orders route method test 3 route method test users table entry update failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = '/Checkout/api/orders'
  requestMethod = 'POST'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({})
  requestCookies = [`accessToken=${accessToken}`, 'admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseStatus'] !== 200) {
    console.log("server.js test failure!  /Checkout/api/orders route method test 4 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /Checkout/api/orders route method test 4 end ===============\n')

  payPalTransactionOrderId = JSON.parse(response['responseBody']).id
  debug(`/Checkout/api/orders route method test 4 payPalTransactionOrderId:  ${payPalTransactionOrderId}.`)


  //
  // /Checkout/api/orders/:orderID/capture test
  //
  console.log('\n============= /Checkout/api/orders/:orderID/capture route method test start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = `/Checkout/api/orders/${payPalTransactionOrderId}/capture`
  requestMethod = 'POST'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({})
  requestCookies = [`accessToken=${accessToken}`, 'admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseStatus'] !== 500) {
    console.log("server.js test failure!  /Checkout/api/orders/:orderID/capture route method test didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /Checkout/api/orders/:orderID/capture route method test end ===============\n')


  //
  // /Receipt/:orderID test
  //
  console.log('\n============= /Receipt/:orderID route method test 1 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = `/Receipt/${payPalTransactionOrderId}`
  requestMethod = 'GET'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({})
  requestCookies = ['admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'No accessToken cookie') {
    console.log("server.js test failure!  /Receipt/:orderID route method test 1 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /Receipt/:orderID route method test 1 end ===============\n')


  console.log('\n============= /Receipt/:orderID route method test 2 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = `/Receipt/${payPalTransactionOrderId}`
  requestMethod = 'GET'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({})
  requestCookies = [`accessToken=1111-1111-111111`, 'admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'Invalid access token') {
    console.log("server.js test failure!  /Receipt/:orderID route method test 2 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /Receipt/:orderID route method test 2 end ===============\n')  


  console.log('\n============= /Receipt/:orderID route method test 3 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = `/Receipt/111111111`
  requestMethod = 'GET'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({})
  requestCookies = [`accessToken=${accessToken}`, 'admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseStatus'] !== 400) {
    console.log("server.js test failure!  /Receipt/:orderID route method test 3 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /Receipt/:orderID route method test 3 end ===============\n')  


  console.log('\n============= /Receipt/:orderID route method test 4 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = `/Receipt/${payPalTransactionOrderId}`
  requestMethod = 'GET'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({})
  requestCookies = [`accessToken=12345abcd`, 'admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'unauthorized request') {
    console.log("server.js test failure!  /Receipt/:orderID route method test 4 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /Receipt/:orderID route method test 4 end ===============\n') 


  console.log('\n============= /Receipt/:orderID route method test 5 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = `/Receipt/${payPalTransactionOrderId}`
  requestMethod = 'GET'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({})
  requestCookies = [`accessToken=${accessToken}`, 'admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'incomplete transaction') {
    console.log("server.js test failure!  /Receipt/:orderID route method test 5 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /Receipt/:orderID route method test 5 end ===============\n') 


  console.log('\n============= /Receipt/:orderID route method test 6 start ===============')

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"UPDATE ""transactions"" SET ""Payment processing completed"" = 'true' WHERE ""PayPal transaction (order) ID"" = '${payPalTransactionOrderId}';"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"UPDATE \\"transactions\\" SET \\"Payment processing completed\\" = 'true' WHERE \\"PayPal transaction (order) ID\\" = '${payPalTransactionOrderId}';"` 
  errorMessage = 'server.js test failure!  /Receipt/:orderID route method test transactions table entry update failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = `/Receipt/${payPalTransactionOrderId}`
  requestMethod = 'GET'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({})
  requestCookies = [`accessToken=${accessToken}`, 'admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseStatus'] !== 200) {
    console.log("server.js test failure!  /Receipt/:orderID route method test 6 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /Receipt/:orderID route method test 6 end ===============\n') 


  /* **************************************************************************************
  User Account Webpage route methods test
  *************************************************************************************** */

  //
  // /GetUserAccountSettings test
  //
  console.log('\n============= /GetUserAccountSettings route method test 1 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = `/GetUserAccountSettings`
  requestMethod = 'GET'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({})
  requestCookies = ['admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'No accessToken cookie') {
    console.log("server.js test failure!  /GetUserAccountSettings route method test 1 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /GetUserAccountSettings route method test 1 end ===============\n')  


  console.log('\n============= /GetUserAccountSettings route method test 2 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = `/GetUserAccountSettings`
  requestMethod = 'GET'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({})
  requestCookies = [`accessToken=1111-1111-111111`, 'admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'invalid access token') {
    console.log("server.js test failure!  /GetUserAccountSettings route method test 2 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /GetUserAccountSettings route method test 2 end ===============\n')


  console.log('\n============= /GetUserAccountSettings route method test 3 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = `/GetUserAccountSettings`
  requestMethod = 'GET'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({})
  requestCookies = [`accessToken=${accessToken}`, 'admin=false']
  responseContentType = 'application/json'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseStatus'] !== 200) {
    console.log("server.js test failure!  /GetUserAccountSettings route method test 3 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /GetUserAccountSettings route method test 3 end ===============\n')


  //
  // /UpdateUserAccountSettings test
  //
  console.log('\n============= /UpdateUserAccountSettings route method test 1 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = `/UpdateUserAccountSettings`
  requestMethod = 'POST'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({})
  requestCookies = ['admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'No accessToken cookie') {
    console.log("server.js test failure!  /UpdateUserAccountSettings route method test 1 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /UpdateUserAccountSettings route method test 1 end ===============\n')


  console.log('\n============= /UpdateUserAccountSettings route method test 2 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = `/UpdateUserAccountSettings`
  requestMethod = 'POST'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({})
  requestCookies = [`accessToken=1111-1111-111111`, 'admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'invalid access token') {
    console.log("server.js test failure!  /UpdateUserAccountSettings route method test 2 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /UpdateUserAccountSettings route method test 2 end ===============\n')


  console.log('\n============= /UpdateUserAccountSettings route method test 3 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = `/UpdateUserAccountSettings`
  requestMethod = 'POST'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({'firstName': '', 'lastName': '', 'emailAddress': '', 
    'phoneNumber': '', 'password': ''})
  requestCookies = [`accessToken=${accessToken}`, 'admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'all inputs are empty') {
    console.log("server.js test failure!  /UpdateUserAccountSettings route method test 3 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /UpdateUserAccountSettings route method test 3 end ===============\n')


  console.log('\n============= /UpdateUserAccountSettings route method test 4 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = `/UpdateUserAccountSettings`
  requestMethod = 'POST'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({'firstName': '', 'lastName': '', 'emailAddress': 'allenyoung2004@@gmail.com', 
    'phoneNumber': '', 'password': ''})
  requestCookies = [`accessToken=${accessToken}`, 'admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'invalid email address format') {
    console.log("server.js test failure!  /UpdateUserAccountSettings route method test 4 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /UpdateUserAccountSettings route method test 4 end ===============\n')


  console.log('\n============= /UpdateUserAccountSettings route method test 5 start ===============')

  firstName = 'Jane'

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = `/UpdateUserAccountSettings`
  requestMethod = 'POST'
  requestContentType = 'application/json'
  requestBody = JSON.stringify({'firstName': firstName, 'lastName': '', 'emailAddress': '', 
    'phoneNumber': '', 'password': ''})
  requestCookies = [`accessToken=${accessToken}`, 'admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'success') {
    console.log("server.js test failure!  /UpdateUserAccountSettings route method test 5 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /UpdateUserAccountSettings route method test 5 end ===============\n')

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM ""users"" WHERE ""Email address"" = '${userEmailAddress}';"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM \\"users\\" WHERE \\"Email address\\" = '${userEmailAddress}';"` 
  errorMessage = 'server.js test failure!  Added user query error!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  console.log(sqlite3CliCommandExecutionResult)

  if (!sqlite3CliCommandExecutionResult.includes(
    `|${firstName}|${lastName}|${userEmailAddress}|true|${phoneNumber}|`)) {
    console.log('server.js test failure!  /UpdateUserAccountSettings route method test 5 incorrect database update!')
    cleanup()
    return    
  }


  //
  // /GetUserStockTransactionHistory test
  //
  console.log('\n============= /GetUserStockTransactionHistory route method test 1 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = `/GetUserStockTransactionHistory/1`
  requestMethod = 'GET'
  requestContentType = 'application/json'
  requestBody = ''
  requestCookies = ['admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'No accessToken cookie') {
    console.log("server.js test failure!  /GetUserStockTransactionHistory route method test 1 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /GetUserStockTransactionHistory route method test 1 end ===============\n')


  console.log('\n============= /GetUserStockTransactionHistory route method test 2 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = `/GetUserStockTransactionHistory/1`
  requestMethod = 'GET'
  requestContentType = 'application/json'
  requestBody = ''
  requestCookies = [`accessToken=1111-1111-111111`, 'admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'invalid access token') {
    console.log("server.js test failure!  /GetUserStockTransactionHistory route method test 2 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /GetUserStockTransactionHistory route method test 2 end ===============\n')


  console.log('\n============= /GetUserStockTransactionHistory route method test 3 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = `/GetUserStockTransactionHistory/1`
  requestMethod = 'GET'
  requestContentType = 'application/json'
  requestBody = ''
  requestCookies = [`accessToken=${accessToken}`, 'admin=false']
  responseContentType = 'application/json'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseStatus'] !== 200) {
    console.log("server.js test failure!  /GetUserStockTransactionHistory route method test 3 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /GetUserStockTransactionHistory route method test 3 end ===============\n')


  /* **************************************************************************************
  Admin Webpage route methods test
  *************************************************************************************** */

  //
  // /GetUserList test
  //
  console.log('\n============= /GetUserList route method test 1 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = `/GetUserList/1`
  requestMethod = 'GET'
  requestContentType = 'application/json'
  requestBody = ''
  requestCookies = ['admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'No accessToken cookie') {
    console.log("server.js test failure!  /GetUserList route method test 1 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /GetUserList route method test 1 end ===============\n')


  console.log('\n============= /GetUserList route method test 2 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = `/GetUserList/1`
  requestMethod = 'GET'
  requestContentType = 'application/json'
  requestBody = ''
  requestCookies = [`accessToken=1111-1111-111111`, 'admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'invalid access token') {
    console.log("server.js test failure!  /GetUserList route method test 2 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /GetUserList route method test 2 end ===============\n')


  console.log('\n============= /GetUserList route method test 3 start ===============')

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"UPDATE ""users"" SET ""Admin"" = 'false' WHERE ""Email address"" = '${emailAddress}';"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"UPDATE \\"users\\" SET \\"Admin\\" = 'false' WHERE \\"Email address\\" = '${emailAddress}';"` 
  errorMessage = 'server.js test failure!  /Checkout route method test 4 route method test users table entry update failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = `/GetUserList/1`
  requestMethod = 'GET'
  requestContentType = 'application/json'
  requestBody = ''
  requestCookies = [`accessToken=${accessToken}`, 'admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'access prohibited') {
    console.log("server.js test failure!  /GetUserList route method test 3 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /GetUserList route method test 3 end ===============\n')


  console.log('\n============= /GetUserList route method test 4 start ===============')

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"UPDATE ""users"" SET ""Admin"" = 'true' WHERE ""Email address"" = '${emailAddress}';"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"UPDATE \\"users\\" SET \\"Admin\\" = 'true' WHERE \\"Email address\\" = '${emailAddress}';"` 
  errorMessage = 'server.js test failure!  /Checkout route method test 4 route method test users table entry update failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = `/GetUserList/1`
  requestMethod = 'GET'
  requestContentType = 'application/json'
  requestBody = ''
  requestCookies = [`accessToken=${accessToken}`, 'admin=false']
  responseContentType = 'application/json'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseStatus'] !== 200) {
    console.log("server.js test failure!  /GetUserList route method test 4 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /GetUserList route method test 4 end ===============\n')


  //
  // /GetTransactionHistory test
  //
  console.log('\n============= /GetTransactionHistory route method test 1 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = `/GetTransactionHistory/1`
  requestMethod = 'GET'
  requestContentType = 'application/json'
  requestBody = ''
  requestCookies = ['admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'No accessToken cookie') {
    console.log("server.js test failure!  /GetTransactionHistory route method test 1 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /GetTransactionHistory route method test 1 end ===============\n')


  console.log('\n============= /GetTransactionHistory route method test 2 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = `/GetTransactionHistory/1`
  requestMethod = 'GET'
  requestContentType = 'application/json'
  requestBody = ''
  requestCookies = [`accessToken=1111-1111-111111`, 'admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'invalid access token') {
    console.log("server.js test failure!  /GetTransactionHistory route method test 2 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /GetTransactionHistory route method test 2 end ===============\n')


  console.log('\n============= /GetTransactionHistory route method test 3 start ===============')

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"UPDATE ""users"" SET ""Admin"" = 'false' WHERE ""Email address"" = '${emailAddress}';"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"UPDATE \\"users\\" SET \\"Admin\\" = 'false' WHERE \\"Email address\\" = '${emailAddress}';"` 
  errorMessage = 'server.js test failure!  /Checkout route method test 4 route method test users table entry update failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = `/GetTransactionHistory/1`
  requestMethod = 'GET'
  requestContentType = 'application/json'
  requestBody = ''
  requestCookies = [`accessToken=${accessToken}`, 'admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseBody'] !== 'access prohibited') {
    console.log("server.js test failure!  /GetTransactionHistory route method test 3 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /GetTransactionHistory route method test 3 end ===============\n')


  console.log('\n============= /GetTransactionHistory route method test 4 start ===============')

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"UPDATE ""users"" SET ""Admin"" = 'true' WHERE ""Email address"" = '${emailAddress}';"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"UPDATE \\"users\\" SET \\"Admin\\" = 'true' WHERE \\"Email address\\" = '${emailAddress}';"` 
  errorMessage = 'server.js test failure!  /Checkout route method test 4 route method test users table entry update failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = `/GetTransactionHistory/1`
  requestMethod = 'GET'
  requestContentType = 'application/json'
  requestBody = ''
  requestCookies = [`accessToken=${accessToken}`, 'admin=false']
  responseContentType = 'text/html'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseStatus'] !== 200) {
    console.log("server.js test failure!  /GetTransactionHistory route method test 4 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /GetTransactionHistory route method test 4 end ===============\n')


  console.log('\n============= /GetTransactionHistory route method test 5 start ===============')

  requestHostname = '127.0.0.1'
  requestPort = 8888
  requestPath = `/GetTransactionHistory/1`
  requestMethod = 'GET'
  requestContentType = 'application/json'
  requestBody = ''
  requestCookies = [`accessToken=${accessToken}`, 'admin=false']
  responseContentType = 'application/json'

  response = await sendRequestGetResponse(requestHostname, requestPort, requestPath, requestMethod, 
    requestContentType, requestBody, requestCookies, responseContentType)

  console.log('')
  console.log(JSON.stringify(response))
  console.log(response['responseBody'])
  console.log('')

  if (response['responseStatus'] !== 200) {
    console.log("server.js test failure!  /GetTransactionHistory route method test 5 didn't succeed.")
    cleanup()
    return
  }

  console.log('============= /GetTransactionHistory route method test 5 end ===============\n')

  
  /* **************************************************************************************
  Cleanup
  *************************************************************************************** */
  cleanup()

  console.log('server.js test success!')

  exitCode = 0
}

await testBackendRouteMethods()

if (exitCode !== 0) {
  process.exitCode = exitCode
}
import process from 'node:process';

import * as child_process from "node:child_process";
import * as database_access from "./database-access.js";

import {setTimeout} from "timers/promises";

/*
A single function defined in this module, named testDatabaseAccessApi() is used
to test all the exported functions in database-access.js.

Using a return statement at the module level generates "Illegal return statement" error.
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
*/

/* **************************************************************************************
  **************************************************************************************
Code for capturing the stdout output
CREDIT:  https://gajus.medium.com/capturing-stdout-stderr-in-node-js-using-domain-module-3c86f5b1536d
***************************************************************************************
*************************************************************************************** */
let cliOutput = '';

const originalStdoutWrite = process.stdout.write.bind(process.stdout);

process.stdout.write = (chunk, encoding, callback) => {
  if (typeof chunk === 'string') {
    cliOutput += chunk;
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
let cliOutputErr = '';

const originalStderrWrite = process.stderr.write.bind(process.stderr);

process.stderr.write = (chunk, encoding, callback) => {
  if (typeof chunk === 'string') {
    cliOutputErr += chunk;
  }

  return originalStderrWrite(chunk, encoding, callback);
};


/**************************************************************************************
***************************************************************************************
database-access.js API test code
***************************************************************************************
*************************************************************************************** */
var exitCode = 1;

var previousUserEmailAddress = ''
var userEmailAddress = 'test@@test.com'
//@@ used to ensure that the test email address cannot match a normal email address.

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
var accessTokenToCheck

var numberOfSharesToBuy

var winSqlite3CliCommand, nixSqlite3CliCommand, errorMessage
var sqlite3CliCommandExecutionResult

var sqlCommand

var errorGenerated

var datetimeTest

var pageNumber

async function testAynchronousOutput() {
  var counter = 1

	while (counter < 101) {
		await setTimeout(2);
    console.log(`testAynchronousOutput() output ${counter}.`)
    counter++
	}	
}

function executeSqlite3CliCommand(winSqlite3CliCommand, nixSqlite3CliCommand, errorMessage) {
  const osType = process.platform

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
    await database_access.updateUserAccountSettings(accessToken, firstName, lastName, 
      emailAddress, phoneNumber, password)
  } catch(error) {
    console.log('database-access.js test failure!  updateUserAccountSettings() raised error!  ' + error)
    return null
  }

  //console.log(cliOutputErr)
  regularExpressionMatchArray = reUpdateUserAccountSettingsFunctionSqlCommandParser.exec(cliOutputErr)
  if (regularExpressionMatchArray == null || regularExpressionMatchArray.length !== 2) {
    console.log('database-access.js test failure!  reUpdateUserAccountSettingsFunctionSqlCommandParser returned invalid result!  ' + String(regularExpressionMatchArray))
    return null  
  }
  sqlCommand = regularExpressionMatchArray[1]
  console.log(`regularExpressionMatchArray[1] (SQL command):  ${sqlCommand}`)

  /*
  if (sqlCommand != `UPDATE users SET "First name" = '${firstName}' WHERE "Access token" = '${accessToken}';`) {
    console.log('database-access.js test failure!  updateUserAccountSettings() generated incorrect SQL command!  ' + sqlCommand)
    return null  
  }
  */

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM ""users"" WHERE ""Email address"" = '${userEmailAddress}';"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM \\"users\\" WHERE \\"Email address\\" = '${userEmailAddress}';"` 
  errorMessage = 'database-access.js test failure!  Added user query error in performUpdateUserAccountSettingsTest()!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {return null;}

  console.log(sqlite3CliCommandExecutionResult)

  if (firstName != '' && !sqlite3CliCommandExecutionResult.includes(firstName)) {
    console.log('database-access.js test failure!  updateUserAccountSettings() firstName update not done in the database!')
    return null
  }

  if (lastName != '' && !sqlite3CliCommandExecutionResult.includes(lastName)) {
    console.log('database-access.js test failure!  updateUserAccountSettings() lastName update not done in the database!')
    return null
  }

  if (emailAddress != '' && !sqlite3CliCommandExecutionResult.includes(emailAddress)) {
    console.log('database-access.js test failure!  updateUserAccountSettings() emailAddress update not done in the database!')
    return null
  }

  if (phoneNumber != '' && !sqlite3CliCommandExecutionResult.includes(phoneNumber)) {
    console.log('database-access.js test failure!  updateUserAccountSettings() phoneNumber update not done in the database!')
    return null
  }

  if (password != '') {
      regularExpressionMatchArray = 
      reUpdateUserAccountSettingsFunctionPasswordSaltParser.exec(cliOutputErr)
    if (regularExpressionMatchArray == null || regularExpressionMatchArray.length !== 2) {
      console.log('database-access.js test failure!  reUpdateUserAccountSettingsFunctionPasswordSaltParser returned invalid result!  ' + String(regularExpressionMatchArray))
      return null    
    }
    passwordSalt = regularExpressionMatchArray[1]
    console.log(`regularExpressionMatchArray[1] (password salt):  ${passwordSalt}`)

    regularExpressionMatchArray = 
    reUpdateUserAccountSettingsFunctionSaltHashedPasswordParser.exec(cliOutputErr)
    if (regularExpressionMatchArray == null || regularExpressionMatchArray.length !== 2) {
      console.log('database-access.js test failure!  reUpdateUserAccountSettingsFunctionSaltHashedPasswordParser returned invalid result!  ' + String(regularExpressionMatchArray))
      return null  
    }
    saltHashedPassword = regularExpressionMatchArray[1]
    console.log(`regularExpressionMatchArray[1] (salt-hashed password):  ${saltHashedPassword}`)

    if(!sqlite3CliCommandExecutionResult.includes(passwordSalt) ||
    !sqlite3CliCommandExecutionResult.includes(saltHashedPassword)) {
      console.log('database-access.js test failure!  updateUserAccountSettings() password update not done in the database!')
      return null
      }
  }

  return 1
}

function cleanup() {
  var winSqlite3CliCommand, nixSqlite3CliCommand, errorMessage

  try {
    //Stock stats table entry deletion
    winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
    `"DELETE FROM ""stock stats"" WHERE ""Stats entry datetime"" = 1;"`
    nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
    `"DELETE FROM \\"stock stats\\" WHERE \\"Stats entry datetime\\" = 1;"`
    errorMessage = 'database-access.js test failure!  stock stats entry delete failure in cleanup()!'
    executeSqlite3CliCommand(winSqlite3CliCommand, nixSqlite3CliCommand, errorMessage)

    //Added user deletion
    winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
    `"DELETE FROM ""users"" WHERE ""Email address"" = '${userEmailAddress}';"`
    nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
    `"DELETE FROM \\"users\\" WHERE \\"Email address\\" = '${userEmailAddress}';"`
    errorMessage = 'database-access.js test failure!  Added user deletion failure in cleanup()!'
    executeSqlite3CliCommand(winSqlite3CliCommand, nixSqlite3CliCommand, errorMessage)

    if (previousUserEmailAddress != '') {
      winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
      `"DELETE FROM ""users"" WHERE ""Email address"" = '${previousUserEmailAddress}';"`
      nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
      `"DELETE FROM \\"users\\" WHERE \\"Email address\\" = '${previousUserEmailAddress}';"`
      errorMessage = 'database-access.js test failure!  Previous added user deletion failure in cleanup()!'
      executeSqlite3CliCommand(winSqlite3CliCommand, nixSqlite3CliCommand, errorMessage)
    }

    //Stock reservation table entries deletion
    winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
    `"DELETE FROM ""stock reservation"" WHERE ""Stock stats table entry primary key"" = ${latestStockStatsTableEntryPrimaryKey};"`
    nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
    `"DELETE FROM \\"stock reservation\\" WHERE \\"Stock stats table entry primary key\\" = ${latestStockStatsTableEntryPrimaryKey};"`
    errorMessage = 'database-access.js test failure!  stock reservation entries delete failure in cleanup()!'
    executeSqlite3CliCommand(winSqlite3CliCommand, nixSqlite3CliCommand, errorMessage)

    //Transactions table entries deletion
    if (payPalTransactionOrderId != '') {
      winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
      `"DELETE FROM ""transactions"" WHERE ""PayPal transaction (order) ID"" = '${payPalTransactionOrderId}';"`
      nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
      `"DELETE FROM \\"transactions\\" WHERE \\"PayPal transaction (order) ID\\" = '${payPalTransactionOrderId}';"`
      errorMessage = 'database-access.js test failure!  transactions entries delete failure in cleanup()!'
      executeSqlite3CliCommand(winSqlite3CliCommand, nixSqlite3CliCommand, errorMessage)
    }

    database_access.closeDatabase()
  } catch(error) {
    console.log('database-access.js test failure!  cleanup() raised error!  ' + error)
    return
  }
}

async function testDatabaseAccessApi() {
  /* **************************************************************************************
  Initialization
  *************************************************************************************** */
  database_access.openDatabase()

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
  errorMessage = 'database-access.js test failure!  Stock stats table entry addition failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM ""stock stats"" WHERE ""Stats entry datetime"" = 1;"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM \\"stock stats\\" WHERE \\"Stats entry datetime\\" = 1;"` 
  errorMessage = 'database-access.js test failure!  Stock stats table entry query failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  console.log(sqlite3CliCommandExecutionResult)

  if (!sqlite3CliCommandExecutionResult.includes(
    "|4000000.0|40000|14000|14000|2000|100.0|200000.0|1")) {
    console.log('database-access.js test failure!  No added stock stats table entry!')
    cleanup()
    return    
  }
  
  regularExpressionMatchArray = reLatestStockStatsTableEntryPrimaryKeyExtractor.exec(sqlite3CliCommandExecutionResult)
  if (regularExpressionMatchArray == null || regularExpressionMatchArray.length !== 2) {
    console.log('database-access.js test failure!  reLatestStockStatsTableEntryPrimaryKeyExtractor returned invalid result!  ' + String(regularExpressionMatchArray))
    cleanup()
    return 
  }
  console.log(`regularExpressionMatchArray:  ${regularExpressionMatchArray}`)

  try {
    latestStockStatsTableEntryPrimaryKey = parseInt(regularExpressionMatchArray[1], 10)
  } catch (error) {
    console.log('database-access.js test failure!  Error on converting reLatestStockStatsTableEntryPrimaryKeyExtractor result to integer!  ' + String(regularExpressionMatchArray) + '  ' + error)
    cleanup()
    return     
  }

  if (isNaN(latestStockStatsTableEntryPrimaryKey)) {
    console.log('database-access.js test failure!  reLatestStockStatsTableEntryPrimaryKeyExtractor result converted to NaN!  ' + String(regularExpressionMatchArray))
  }

  console.log(`latestStockStatsTableEntryPrimaryKey:  ${latestStockStatsTableEntryPrimaryKey}`)

  /* **************************************************************************************
  User registration webpage database-access test
  *************************************************************************************** */

  //
  //addUserEntryInUsersTable() test
  //
  try {
    await database_access.addUserEntryInUsersTable('John', 'Doe', userEmailAddress, 
      '111-222-3333', '1234abcd')
  } catch(error) {
    console.log('database-access.js test failure!  addUserEntryInUsersTable() raised error!  ' + error)
    cleanup()
    return
  }

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM ""users"" WHERE ""Email address"" = '${userEmailAddress}';"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM \\"users\\" WHERE \\"Email address\\" = '${userEmailAddress}';"` 
  errorMessage = 'database-access.js test failure!  Added user query error!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  console.log(sqlite3CliCommandExecutionResult)

  if (!sqlite3CliCommandExecutionResult.includes(
    "|John|Doe|test@@test.com|false|111-222-3333|")) {
    console.log('database-access.js test failure!  No added user in the database!')
    cleanup()
    return    
  }

  //
  //assignNewAccessToken() test
  //
  //testAynchronousOutput()
  try {
    await database_access.assignNewAccessToken(userEmailAddress)
  } catch(error) {
    console.log('database-access.js test failure!  assignNewAccessToken() raised error!  ' + error)
    cleanup()
    return
  }

  console.log('================cliOutputErr start==================')
  console.log(cliOutputErr)
  console.log('================cliOutputErr end==================')
  regularExpressionMatchArray = reAssignNewAccessTokenFunctionOutputAccessTokenParser.exec(cliOutputErr)
  if (regularExpressionMatchArray == null || regularExpressionMatchArray.length !== 2) {
    console.log('database-access.js test failure!  reAssignNewAccessTokenFunctionOutputAccessTokenParser returned invalid result!  ' + String(regularExpressionMatchArray))
    cleanup()
    return    
  }
  accessToken = regularExpressionMatchArray[1]
  console.log(`regularExpressionMatchArray[1] (access token):  ${accessToken}`)

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM ""users"" WHERE ""Email address"" = '${userEmailAddress}';"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM \\"users\\" WHERE \\"Email address\\" = '${userEmailAddress}';"` 
  errorMessage = 'database-access.js test failure!  Added user query error!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  console.log(sqlite3CliCommandExecutionResult)

  if (!sqlite3CliCommandExecutionResult.includes(accessToken)) {
    console.log('database-access.js test failure!  New access token not assigned to the added user in the database!')
    cleanup()
    return    
  }


  //
  //setEmailAddressVerifiedInUsersTable() test
  //
  try {
    await database_access.setEmailAddressVerifiedInUsersTable(accessToken)
  } catch(error) {
    console.log('database-access.js test failure!  setEmailAddressVerifiedInUsersTable() raised error!  ' + error)
    cleanup()
    return
  }

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM ""users"" WHERE ""Email address"" = '${userEmailAddress}';"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM \\"users\\" WHERE \\"Email address\\" = '${userEmailAddress}';"` 
  errorMessage = 'database-access.js test failure!  setEmailAddressVerifiedInUsersTable() test added user query error!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  console.log(sqlite3CliCommandExecutionResult)

  if (!sqlite3CliCommandExecutionResult.includes(
    "|John|Doe|test@@test.com|true|111-222-3333|")) {
    console.log("database-access.js test failure!  setEmailAddressVerifiedInUsersTable() didn't update the email address verification to true in the database!")
    cleanup()
    return    
  }

  //
  //updatePasswordInUsersTable() test
  //
  password = 'abcdefg1234567890'
  try {
    await database_access.updatePasswordInUsersTable(accessToken, password)
  } catch(error) {
    console.log('database-access.js test failure!  updatePasswordInUsersTable() raised error!  ' + error)
    cleanup()
    return
  }

  regularExpressionMatchArray = 
    reUpdatePasswordInUsersTableFunctionPasswordSaltParser.exec(cliOutputErr)
  if (regularExpressionMatchArray == null || regularExpressionMatchArray.length !== 2) {
    console.log('database-access.js test failure!  reUpdatePasswordInUsersTableFunctionPasswordSaltParser returned invalid result!  ' + String(regularExpressionMatchArray))
    cleanup()
    return    
  }
  passwordSalt = regularExpressionMatchArray[1]
  console.log(`regularExpressionMatchArray[1] (password salt):  ${passwordSalt}`)

  regularExpressionMatchArray = 
  reUpdatePasswordInUsersTableFunctionSaltHashedPasswordParser.exec(cliOutputErr)
  if (regularExpressionMatchArray == null || regularExpressionMatchArray.length !== 2) {
    console.log('database-access.js test failure!  reUpdatePasswordInUsersTableFunctionSaltHashedPasswordParser returned invalid result!  ' + String(regularExpressionMatchArray))
    cleanup()
    return    
  }
  saltHashedPassword = regularExpressionMatchArray[1]
  console.log(`regularExpressionMatchArray[1] (salt-hashed password):  ${saltHashedPassword}`)

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM ""users"" WHERE ""Email address"" = '${userEmailAddress}';"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM \\"users\\" WHERE \\"Email address\\" = '${userEmailAddress}';"` 
  errorMessage = 'database-access.js test failure!  Added user query for updatePasswordInUsersTable() test error!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  console.log(sqlite3CliCommandExecutionResult)

  if (!sqlite3CliCommandExecutionResult.includes(saltHashedPassword + '|' + passwordSalt)) {
    console.log('database-access.js test failure!  New salt-hashed password and password salt not assigned to the added user in the database!')
    cleanup()
    return    
  }


  //
  //updateUserAccountSettings() test
  //
  console.log('==================updateUserAccountSettings() test start===================')

  //firstName update test
  firstName = 'Jane'; lastName = ''; emailAddress = ''; phoneNumber = ''; password = '';
  result = await performUpdateUserAccountSettingsTest(accessToken, firstName, lastName, 
    emailAddress, phoneNumber, password)
  if(result === null) {cleanup(); return;}

  //lastName update test
  firstName = ''; lastName = 'Dolly'; emailAddress = ''; phoneNumber = ''; password = '';
  result = await performUpdateUserAccountSettingsTest(accessToken, firstName, lastName, 
    emailAddress, phoneNumber, password)
  if(result === null) {cleanup(); return;}

  //emailAddress update test
  previousUserEmailAddress = userEmailAddress
  userEmailAddress = 'test2@@test.com'
  firstName = ''; lastName = ''; emailAddress = userEmailAddress; phoneNumber = ''; password = '';
  result = await performUpdateUserAccountSettingsTest(accessToken, firstName, lastName, 
    emailAddress, phoneNumber, password)
  if(result === null) {cleanup(); return;}

  //phoneNumber update test
  firstName = ''; lastName = ''; emailAddress = ''; phoneNumber = '222-222-2222'; password = '';
  result = await performUpdateUserAccountSettingsTest(accessToken, firstName, lastName, 
    emailAddress, phoneNumber, password)
  if(result === null) {cleanup(); return;}

  //password update test
  firstName = ''; lastName = ''; emailAddress = ''; phoneNumber = ''; password = '4444aaaa';
  result = await performUpdateUserAccountSettingsTest(accessToken, firstName, lastName, 
    emailAddress, phoneNumber, password)
  if(result === null) {cleanup(); return;}

  //firstName, emailAddress, password update test
  previousUserEmailAddress = userEmailAddress
  userEmailAddress = 'test3@@test.com'
  firstName = 'Jack'; lastName = ''; emailAddress = userEmailAddress; phoneNumber = ''; password = '6666bbbb';
  result = await performUpdateUserAccountSettingsTest(accessToken, firstName, lastName, 
    emailAddress, phoneNumber, password)
  if(result === null) {cleanup(); return;}

  //firstName, lastName, emailAddress, phoneNumber, password update test
  previousUserEmailAddress = userEmailAddress
  userEmailAddress = 'test@@test.com'
  firstName = 'Sara'; lastName = 'Brown'; emailAddress = userEmailAddress; phoneNumber = '999-999-9999'; password = '9999zzzz';
  result = await performUpdateUserAccountSettingsTest(accessToken, firstName, lastName, 
    emailAddress, phoneNumber, password)
  if(result === null) {cleanup(); return;}

  console.log('==================updateUserAccountSettings() test end===================')

  /* **************************************************************************************
  Login webpage database-access test
  *************************************************************************************** */

  //
  //checkUserEmailAddressInDatabase() test
  //
  try {
    result = await database_access.checkUserEmailAddressInDatabase(userEmailAddress)
  } catch(error) {
    console.log('database-access.js test failure!  checkUserEmailAddressInDatabase() raised error!  ' + error)
    cleanup()
    return
  }

  if (result === null) {
    console.log('database-access.js test failure!  checkUserEmailAddressInDatabase() returned null  (i.e. email address in database finding failure)!')
    cleanup()
    return    
  }

  [emailAddressVerifiedToCheck, saltHashedPasswordToCheck, passwordSaltToCheck, 
    adminStatusToCheck, accessTokenToCheck] = result
  if (emailAddressVerifiedToCheck !== true ||
    saltHashedPasswordToCheck !== saltHashedPassword ||
    passwordSaltToCheck !== passwordSalt ||
    adminStatusToCheck !== false) {
    console.log('database-access.js test failure!  checkUserEmailAddressInDatabase() returned one or more invalid values!')
    console.log(`emailAddressVerifiedToCheck:  ${emailAddressVerifiedToCheck}.`)
    console.log(`emailAddressVerified:  true.`)
    console.log(`saltHashedPasswordToCheck:  ${saltHashedPasswordToCheck}.`)
    console.log(`saltHashedPassword:  ${saltHashedPassword}.`)
    console.log(`passwordSaltToCheck:  ${passwordSaltToCheck}.`)
    console.log(`passwordSalt:  ${passwordSalt}.`)
    console.log(`adminStatusToCheck:  ${adminStatusToCheck}.`)
    console.log(`adminStatus:  false.`)
    cleanup()
    return  
  }

  //
  //storeAccessTokenInUsersTable() test
  //
  /*
  Separate testing of storeAccessTokenInUsersTable() is not required.
  assignNewAccessToken() calls storeAccessTokenInUsersTable();
  when assignNewAccessToken() was tested earlier, storeAccessTokenInUsersTable()
  was verified. 
  */
  /*
  try {
    await database_access.storeAccessTokenInUsersTable(userEmailAddress, accessToken)
  } catch(error) {
    console.log('database-access.js test failure!  storeAccessTokenInUsersTable() raised error!  ' + error)
    cleanup()
    return
  }
  */

  /* **************************************************************************************
  Buy checkout webpage database-access test, 
  updateTransactionsTableEntryForTransactionPaymentFailure() call first,
  updateTransactionsTableEntryForTransactionPaymentSuccess() call next.
  *************************************************************************************** */

  //
  //reserveSharesToBuy() test, attempting more than what's available for purchase.
  //
  console.log("======reserveSharesToBuy() test, attempting more than what's available for purchase=====")
  numberOfSharesToBuy = 5000
  errorGenerated = false
  try {
    await database_access.reserveSharesToBuy(latestStockStatsTableEntryPrimaryKey,
      numberOfSharesToBuy, accessToken)
  } catch(error) {
    errorGenerated = true
    console.log(`reserveSharesToBuy() error:  ${JSON.stringify(error)}`)
  }

  if (!errorGenerated) {
    console.log("database-access.js test failure!  reserveSharesToBuy() didn't raise error when attempting to reserve more shares than available!")
    cleanup()
    return
  }

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM ""stock stats"" WHERE ""Stats entry datetime"" = 1;"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM \\"stock stats\\" WHERE \\"Stats entry datetime\\" = 1;"` 
  errorMessage = 'database-access.js test failure!  Stock stats table entry query for reserveSharesToBuy() validation failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  console.log(sqlite3CliCommandExecutionResult)

  if (!sqlite3CliCommandExecutionResult.includes(
    "|4000000.0|40000|14000|14000|2000|100.0|200000.0|1")) {
    console.log('database-access.js test failure!  reserveSharesToBuy() did not rollback the test stock stats table entry!')
    cleanup()
    return    
  }

  //
  //reserveSharesToBuy() test, attempting less than what's available for purchase.
  //
  //await setTimeout(10000);
  console.log("======reserveSharesToBuy() test, attempting less than what's available for purchase=====")
  datetimeTest = Date.now();
  numberOfSharesToBuy = 1000
  try {
    await database_access.reserveSharesToBuy(latestStockStatsTableEntryPrimaryKey,
      numberOfSharesToBuy, accessToken)
  } catch(error) {
    console.log('database-access.js test failure!  reserveSharesToBuy() raised error when attempting to reserve less shares than available!  ' + JSON.stringify(error))
    cleanup()
    return
  }

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM ""stock stats"" WHERE ""Stats entry datetime"" = 1;"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM \\"stock stats\\" WHERE \\"Stats entry datetime\\" = 1;"` 
  errorMessage = 'database-access.js test failure!  Stock stats table entry query for reserveSharesToBuy() validation failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  console.log(sqlite3CliCommandExecutionResult)

  if (!sqlite3CliCommandExecutionResult.includes(
    "|4000000.0|40000|14000|14000|1000|100.0|100000.0|1")) {
    console.log('database-access.js test failure!  reserveSharesToBuy() did not correctly update the test stock stats table entry!')
    cleanup()
    return    
  }


  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM ""stock reservation"" WHERE ""Stock stats table entry primary key"" = ${latestStockStatsTableEntryPrimaryKey};"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM \\"stock reservation\\" WHERE \\"Stock stats table entry primary key\\" = ${latestStockStatsTableEntryPrimaryKey};"` 
  errorMessage = 'database-access.js test failure!  Stock reservation table entry query for reserveSharesToBuy() validation failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  console.log(sqlite3CliCommandExecutionResult)

  if (!sqlite3CliCommandExecutionResult.includes(
    '|' +String(latestStockStatsTableEntryPrimaryKey) + '|' + String(numberOfSharesToBuy) + '|')) {
    console.log('database-access.js test failure!  reserveSharesToBuy() did not correctly add the stock reservation table entry!')
    cleanup()
    return    
  }

  //
  //checkStockReservationTableEntry() test
  //
  try {
    result = await database_access.checkStockReservationTableEntry(accessToken)
  } catch(error) {
    console.log('database-access.js test failure!  checkStockReservationTableEntry() raised error!  ' + error)
    cleanup()
    return
  }

  if (result === null) {
    console.log('database-access.js test failure!  checkStockReservationTableEntry() returned null!')
    cleanup()
    return
  }

  if (result[1] !== latestStockStatsTableEntryPrimaryKey || result[2] !== numberOfSharesToBuy || 
    result[3] < datetimeTest || result[4] < datetimeTest || 
    result[4] !== result[3] + database_access.dbStockReservationTimeoutInMilliseconds) {
      console.log('database-access.js test failure!  checkStockReservationTableEntry() returned invalid result!')
      cleanup()
      return
  }

  //
  //checkAccessTokenInUsersTable() test
  //
  try {
    result = await database_access.checkAccessTokenInUsersTable(accessToken)
  } catch(error) {
    console.log('database-access.js test failure!  checkAccessTokenInUsersTable() raised error!  ' + error)
    cleanup()
    return
  }

  if (result === null) {
    console.log('database-access.js test failure!  checkAccessTokenInUsersTable() returned null!')
    cleanup()
    return
  }  

  userPrimaryKey = result[0]

  if (result[1] !== firstName || result[2] !== lastName || 
    result[3] !== userEmailAddress || result[4] !== true || 
    result[5] !== phoneNumber || result[6] !== false) {
      console.log('database-access.js test failure!  checkAccessTokenInUsersTable() returned invalid result!')
      cleanup()
      return
  }

  //
  //createTransactionInitiationEntry() test
  //
  payPalTransactionOrderId = 'paypal-order-0001'
  companyStockTransactionId = 'company-order-0001'
  try {
    await database_access.createTransactionInitiationEntry(userPrimaryKey, 
      latestStockStatsTableEntryPrimaryKey,
      payPalTransactionOrderId, companyStockTransactionId, numberOfSharesToBuy, accessToken)
  } catch(error) {
    console.log('database-access.js test failure!  createTransactionInitiationEntry() raised error!  ' + error)
    cleanup()
    return
  }

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM ""transactions"" WHERE ""PayPal transaction (order) ID"" = '${payPalTransactionOrderId}';"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM \\"transactions\\" WHERE \\"PayPal transaction (order) ID\\" = '${payPalTransactionOrderId}';"` 
  errorMessage = 'database-access.js test failure!  createTransactionInitiationEntry() test transactions table entry query failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  console.log(sqlite3CliCommandExecutionResult)

  if (!sqlite3CliCommandExecutionResult.includes(
    `|${userPrimaryKey}|${latestStockStatsTableEntryPrimaryKey}|`) ||
    !sqlite3CliCommandExecutionResult.includes(
      `|${payPalTransactionOrderId}|${companyStockTransactionId}|${numberOfSharesToBuy}|true|false||0`)) {
    console.log('database-access.js test failure!  createTransactionInitiationEntry() did not add a transactions table entry!')
    cleanup()
    return    
  }

  try {
    result = await database_access.checkStockReservationTableEntry(accessToken)
  } catch(error) {
    console.log('database-access.js test failure!  createTransactionInitiationEntry() test checkStockReservationTableEntry() raised error!  ' + error)
    cleanup()
    return
  }

  if (result !== null) {
    console.log('database-access.js test failure!  createTransactionInitiationEntry() test checkStockReservationTableEntry() did not return null!')
    cleanup()
    return
  }

  //
  //updateTransactionsTableEntryForTransactionPaymentFailure() test
  //
  try {
    await database_access.updateTransactionsTableEntryForTransactionPaymentFailure(
      payPalTransactionOrderId, latestStockStatsTableEntryPrimaryKey)
  } catch(error) {
    console.log('database-access.js test failure!  updateTransactionsTableEntryForTransactionPaymentFailure() raised error!  ' + error)
    cleanup()
    return
  }

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM ""transactions"" WHERE ""PayPal transaction (order) ID"" = '${payPalTransactionOrderId}';"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM \\"transactions\\" WHERE \\"PayPal transaction (order) ID\\" = '${payPalTransactionOrderId}';"` 
  errorMessage = 'database-access.js test failure!  createTransactionInitiationEntry() test transactions table entry query failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  console.log(sqlite3CliCommandExecutionResult)

  if (!sqlite3CliCommandExecutionResult.includes(
    `|${userPrimaryKey}|${latestStockStatsTableEntryPrimaryKey}|`) ||
    !sqlite3CliCommandExecutionResult.includes(
      `|${payPalTransactionOrderId}|${companyStockTransactionId}|${numberOfSharesToBuy}|true|true|payment decline|1`)) {
    console.log('database-access.js test failure!  updateTransactionsTableEntryForTransactionPaymentFailure() did not properly update the transactions table entry!')
    cleanup()
    return    
  }

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM ""stock stats"" WHERE ""Stats entry datetime"" = 1;"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM \\"stock stats\\" WHERE \\"Stats entry datetime\\" = 1;"` 
  errorMessage = 'database-access.js test failure!  updateTransactionsTableEntryForTransactionPaymentFailure() test stock stats table entry query failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  console.log(sqlite3CliCommandExecutionResult)

  if (!sqlite3CliCommandExecutionResult.includes(
    "|4000000.0|40000|14000|14000|2000|100.0|200000.0|1")) {
    console.log('database-access.js test failure!  updateTransactionsTableEntryForTransactionPaymentFailure() did not correctly update the stock stats table entry!')
    cleanup()
    return    
  }

  //
  //updateTransactionsTableEntryForTransactionPaymentSuccess() test
  //
  errorGenerated = false
  try {
    await database_access.updateTransactionsTableEntryForTransactionPaymentSuccess(payPalTransactionOrderId,
      latestStockStatsTableEntryPrimaryKey)
  } catch(error) {
    console.log('updateTransactionsTableEntryForTransactionPaymentSuccess() raised error as it should with "Entry update counter" column value already set to 1.  ' + JSON.stringify(error))
    errorGenerated = true
  }

  if (!errorGenerated) {
    console.log('database-access.js test failure!  updateTransactionsTableEntryForTransactionPaymentSuccess() did not raise error when it should with "Entry update counter" column value already set to 1!')
    cleanup()
    return 
  }

  //
  //getTransactionRecord() test
  //
  try {
    result = await database_access.getTransactionRecord(payPalTransactionOrderId)
  } catch(error) {
    console.log('database-access.js test failure!  getTransactionRecord() raised error!  ' + JSON.stringify(error))
    cleanup()
    return
  }

  if (result === null) {
    console.log("database-access.js test failure!  getTransactionRecord() returned null when it shouldn't.")
    cleanup()
    return    
  }

  if (result[1] !== userPrimaryKey || result[2] !== latestStockStatsTableEntryPrimaryKey || 
    result[5] !== payPalTransactionOrderId || result[6] !== companyStockTransactionId || 
    result[7] !== numberOfSharesToBuy || result[8] !== true || result[9] !== true || 
    result[10] !== 'payment decline' || result[11] !== 1) {
    console.log('database-access.js test failure!  getTransactionRecord() did not return proper values!  ' + result)
    cleanup()
    return    
  }


  /* **************************************************************************************
  Buy checkout webpage database-access test,
  updateTransactionsTableEntryForTransactionPaymentSuccess() call first,
  updateTransactionsTableEntryForTransactionPaymentFailure() call next.
  *************************************************************************************** */

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"UPDATE OR ROLLBACK ""transactions"" SET ""Entry update counter"" = 0 WHERE ""PayPal transaction (order) ID"" = '${payPalTransactionOrderId}';"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"UPDATE OR ROLLBACK \\"transactions\\" SET \\"Entry update counter\\" = 0 WHERE \\"PayPal transaction (order) ID\\" = '${payPalTransactionOrderId}';"` 
  errorMessage = 'database-access.js test failure!  updateTransactionsTableEntryForTransactionPaymentFailure() test transactions table entry update failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM ""transactions"" WHERE ""PayPal transaction (order) ID"" = '${payPalTransactionOrderId}';"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM \\"transactions\\" WHERE \\"PayPal transaction (order) ID\\" = '${payPalTransactionOrderId}';"` 
  errorMessage = 'database-access.js test failure!  Second buy checkout webpage database-access test transactions table entry query failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  console.log(sqlite3CliCommandExecutionResult)

  if (!sqlite3CliCommandExecutionResult.includes(
    `|${userPrimaryKey}|${latestStockStatsTableEntryPrimaryKey}|`) ||
    !sqlite3CliCommandExecutionResult.includes(
      `|${payPalTransactionOrderId}|${companyStockTransactionId}|${numberOfSharesToBuy}|true|true|payment decline|0`)) {
    console.log('database-access.js test failure!  Second buy checkout webpage database-access test, transactions table entry update failure!')
    cleanup()
    return    
  }

  //
  //updateTransactionsTableEntryForTransactionPaymentSuccess() test
  //
  try {
    await database_access.updateTransactionsTableEntryForTransactionPaymentSuccess(payPalTransactionOrderId,
      latestStockStatsTableEntryPrimaryKey)
  } catch(error) {
    console.log('database-access.js test failure!  updateTransactionsTableEntryForTransactionPaymentSuccess() raised error!  ' + error)
    cleanup()
    return
  }

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM ""transactions"" WHERE ""PayPal transaction (order) ID"" = '${payPalTransactionOrderId}';"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM \\"transactions\\" WHERE \\"PayPal transaction (order) ID\\" = '${payPalTransactionOrderId}';"` 
  errorMessage = 'database-access.js test failure!  Second buy checkout webpage database-access test transactions table entry query failure after updateTransactionsTableEntryForTransactionPaymentSuccess() call!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  console.log(sqlite3CliCommandExecutionResult)

  if (!sqlite3CliCommandExecutionResult.includes(
    `|${userPrimaryKey}|${latestStockStatsTableEntryPrimaryKey}|`) ||
    !sqlite3CliCommandExecutionResult.includes(
      `|${payPalTransactionOrderId}|${companyStockTransactionId}|${numberOfSharesToBuy}|true|true|success|1`)) {
    console.log('database-access.js test failure!  Second buy checkout webpage database-access test, transactions table entry update failure by updateTransactionsTableEntryForTransactionPaymentSuccess()!')
    cleanup()
    return    
  }

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM ""stock stats"" WHERE ""Stats entry datetime"" = 1;"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM \\"stock stats\\" WHERE \\"Stats entry datetime\\" = 1;"` 
  errorMessage = 'database-access.js test failure!  Stock stats table entry query for updateTransactionsTableEntryForTransactionPaymentSuccess() validation failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  console.log(sqlite3CliCommandExecutionResult)

  if (!sqlite3CliCommandExecutionResult.includes(
    "|4000000.0|40000|15000|15000|2000|100.0|200000.0|1")) {
    console.log('database-access.js test failure!  updateTransactionsTableEntryForTransactionPaymentSuccess() did not correctly update the test stock stats table entry!')
    cleanup()
    return    
  }

  //
  //updateTransactionsTableEntryForTransactionPaymentFailure() test
  //
  errorGenerated = false
  try {
    await database_access.updateTransactionsTableEntryForTransactionPaymentFailure(
      payPalTransactionOrderId, latestStockStatsTableEntryPrimaryKey)
  } catch(error) {
    console.log('updateTransactionsTableEntryForTransactionPaymentFailure() raised error as it should with "Entry update counter" column value already set to 1.  ' + JSON.stringify(error))
    errorGenerated = true
  }

  if (!errorGenerated) {
    console.log('database-access.js test failure!  updateTransactionsTableEntryForTransactionPaymentFailure() did not raise error when it should with "Entry update counter" column value already set to 1!')
    cleanup()
    return 
  }

  /* **************************************************************************************
  Stockmarket home webpage database-access test
  *************************************************************************************** */

  console.log("======removeAllApplicableEntriesInStockReservationTable() test without access token=====")
  numberOfSharesToBuy = 1000
  try {
    await database_access.reserveSharesToBuy(latestStockStatsTableEntryPrimaryKey,
      numberOfSharesToBuy, accessToken)
  } catch(error) {
    console.log('database-access.js test failure!  reserveSharesToBuy() raised error when attempting to reserve less shares than available!  ' + JSON.stringify(error))
    cleanup()
    return
  }

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM ""stock stats"" WHERE ""Stats entry datetime"" = 1;"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM \\"stock stats\\" WHERE \\"Stats entry datetime\\" = 1;"` 
  errorMessage = 'database-access.js test failure!  Stock stats table entry query for reserveSharesToBuy() validation failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  console.log(sqlite3CliCommandExecutionResult)

  if (!sqlite3CliCommandExecutionResult.includes(
    "|4000000.0|40000|15000|15000|1000|100.0|100000.0|1")) {
    console.log('database-access.js test failure!  reserveSharesToBuy() did not correctly update the test stock stats table entry!')
    cleanup()
    return    
  }
  
  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"UPDATE OR ROLLBACK ""stock reservation"" SET ""Stock reservation end datetime"" = 1 WHERE ""Reserving-user access token"" = '${accessToken}';"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"UPDATE OR ROLLBACK \\"stock reservation\\" SET \\"Stock reservation end datetime\\" = 1 WHERE \\"Reserving-user access token\\" = '${accessToken}';"` 
  errorMessage = 'database-access.js test failure!  removeAllApplicableEntriesInStockReservationTable() test stock reservation table entry update failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  //
  //removeAllApplicableEntriesInStockReservationTable() test without access token
  //
  try {
    await database_access.removeAllApplicableEntriesInStockReservationTable(
      latestStockStatsTableEntryPrimaryKey, '')
  } catch(error) {
    console.log('database-access.js test failure!  removeAllApplicableEntriesInStockReservationTable() raised error!  ' + JSON.stringify(error))
    cleanup()
    return
  }

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM ""stock stats"" WHERE ""Stats entry datetime"" = 1;"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM \\"stock stats\\" WHERE \\"Stats entry datetime\\" = 1;"` 
  errorMessage = 'database-access.js test failure!  Stock stats table entry query for reserveSharesToBuy() validation failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  console.log(sqlite3CliCommandExecutionResult)

  if (!sqlite3CliCommandExecutionResult.includes(
    "|4000000.0|40000|15000|15000|2000|100.0|200000.0|1")) {
    console.log('database-access.js test failure!  removeAllApplicableEntriesInStockReservationTable() did not correctly update the test stock stats table entry!')
    cleanup()
    return    
  }

  result = await database_access.checkStockReservationTableEntry(accessToken)
  if (result !== null) {
    console.log('database-access.js test failure!  removeAllApplicableEntriesInStockReservationTable() did not remove the applicable stock reservation entry!')
    cleanup()
    return
  }


  //
  //removeAllApplicableEntriesInStockReservationTable() test with access token
  //
  console.log("======removeAllApplicableEntriesInStockReservationTable() test without access token=====")
  numberOfSharesToBuy = 1000
  try {
    await database_access.reserveSharesToBuy(latestStockStatsTableEntryPrimaryKey,
      numberOfSharesToBuy, accessToken)
  } catch(error) {
    console.log('database-access.js test failure!  reserveSharesToBuy() raised error when attempting to reserve less shares than available!  ' + JSON.stringify(error))
    cleanup()
    return
  }

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM ""stock stats"" WHERE ""Stats entry datetime"" = 1;"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM \\"stock stats\\" WHERE \\"Stats entry datetime\\" = 1;"` 
  errorMessage = 'database-access.js test failure!  Stock stats table entry query for reserveSharesToBuy() validation failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  console.log(sqlite3CliCommandExecutionResult)

  if (!sqlite3CliCommandExecutionResult.includes(
    "|4000000.0|40000|15000|15000|1000|100.0|100000.0|1")) {
    console.log('database-access.js test failure!  reserveSharesToBuy() did not correctly update the test stock stats table entry!')
    cleanup()
    return    
  }

  try {
    await database_access.removeAllApplicableEntriesInStockReservationTable(
      latestStockStatsTableEntryPrimaryKey, accessToken)
  } catch(error) {
    console.log('database-access.js test failure!  removeAllApplicableEntriesInStockReservationTable() raised error!  ' + JSON.stringify(error))
    cleanup()
    return
  }

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM ""stock stats"" WHERE ""Stats entry datetime"" = 1;"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM \\"stock stats\\" WHERE \\"Stats entry datetime\\" = 1;"` 
  errorMessage = 'database-access.js test failure!  Stock stats table entry query for reserveSharesToBuy() validation failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  console.log(sqlite3CliCommandExecutionResult)

  if (!sqlite3CliCommandExecutionResult.includes(
    "|4000000.0|40000|15000|15000|2000|100.0|200000.0|1")) {
    console.log('database-access.js test failure!  removeAllApplicableEntriesInStockReservationTable() did not correctly update the test stock stats table entry!')
    cleanup()
    return    
  }

  result = await database_access.checkStockReservationTableEntry(accessToken)
  if (result !== null) {
    console.log('database-access.js test failure!  removeAllApplicableEntriesInStockReservationTable() did not remove the applicable stock reservation entry!')
    cleanup()
    return
  }

  //
  //getTotalNumberOfSharesInTimedOutUncompletedTransactions() test
  //
  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"UPDATE OR ROLLBACK ""transactions"" SET ""Transaction start datetime"" = 0, ""Payment processing completed"" = 'false' WHERE ""PayPal transaction (order) ID"" = '${payPalTransactionOrderId}';"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"UPDATE OR ROLLBACK \\"transactions\\" SET \\"Transaction start datetime\\" = 0, \\"Payment processing completed\\" = 'false' WHERE \\"PayPal transaction (order) ID\\" = '${payPalTransactionOrderId}';"` 
  errorMessage = 'database-access.js test failure!  getTotalNumberOfSharesInTimedOutUncompletedTransactions() test transactions table entry update failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  try {
    result = await database_access.getTotalNumberOfSharesInTimedOutUncompletedTransactions(
        latestStockStatsTableEntryPrimaryKey)
  } catch(error) {
    console.log('database-access.js test failure!  getTotalNumberOfSharesInTimedOutUncompletedTransactions() raised error!  ' + JSON.stringify(error))
    cleanup()
    return
  }

  console.log(`getTotalNumberOfSharesInTimedOutUncompletedTransactions() call result:  ${result}.`)

  if (result === null) {
    console.log('database-access.js test failure!  getTotalNumberOfSharesInTimedOutUncompletedTransactions() returned null when it shouldn\'t!')
    cleanup()
    return
  }


  //
  //updateNumberOfAvailableSharesInStockStatsTableWithUncompletedTransactions() test
  //
  try {
    await database_access.updateNumberOfAvailableSharesInStockStatsTableWithUncompletedTransactions(
      latestStockStatsTableEntryPrimaryKey)
  } catch(error) {
    console.log('database-access.js test failure!  updateNumberOfAvailableSharesInStockStatsTableWithUncompletedTransactions() raised error!  ' + error)
    cleanup()
    return
  }

  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM ""stock stats"" WHERE ""Stats entry datetime"" = 1;"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM \\"stock stats\\" WHERE \\"Stats entry datetime\\" = 1;"` 
  errorMessage = 'database-access.js test failure!  Stock stats table entry query failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  console.log(sqlite3CliCommandExecutionResult)

  if (!sqlite3CliCommandExecutionResult.includes(
    "|4000000.0|40000|15000|15000|3000|100.0|300000.0|1")) {
    console.log('database-access.js test failure!  updateNumberOfAvailableSharesInStockStatsTableWithUncompletedTransactions() didn\'t properly update stock stats table entry!')
    cleanup()
    return    
  }


  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM ""transactions"" WHERE ""PayPal transaction (order) ID"" = '${payPalTransactionOrderId}';"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"SELECT * FROM \\"transactions\\" WHERE \\"PayPal transaction (order) ID\\" = '${payPalTransactionOrderId}';"` 
  errorMessage = 'database-access.js test failure!  updateNumberOfAvailableSharesInStockStatsTableWithUncompletedTransactions() test transactions table entry query failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  console.log(sqlite3CliCommandExecutionResult)

  if (!sqlite3CliCommandExecutionResult.includes(
    `|${userPrimaryKey}|${latestStockStatsTableEntryPrimaryKey}|`) ||
    !sqlite3CliCommandExecutionResult.includes(
      `|${payPalTransactionOrderId}|${companyStockTransactionId}|${numberOfSharesToBuy}|true|false|payment timeout|1`)) {
    console.log('database-access.js test failure!  updateNumberOfAvailableSharesInStockStatsTableWithUncompletedTransactions() did not properly update the transactions table entry!')
    cleanup()
    return    
  }

  //
  //getLatestCompanyStockData() test
  //
  try {
    result = await database_access.getLatestCompanyStockData()
  } catch(error) {
    console.log('database-access.js test failure!  getLatestCompanyStockData() raised error!  ' + error)
    cleanup()
    return
  }

  console.log(`getLatestCompanyStockData() result:  ${result}.`)

  if (result[1] != 4000000.0 || result[2] != 40000 || result[3] != 15000 || result[4] != 15000 || 
    result[5] != 3000 || result[6] != 100.0 || result[7] != 300000.0 || result[8] != 1) {
    console.log('database-access.js test failure!  getLatestCompanyStockData() returned invalid result!')
    cleanup()
    return  
  }

  //
  //getNumberOfCompanySharesOwnedByUser() test
  //
  winSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"UPDATE OR ROLLBACK ""transactions"" SET ""Payment processing status"" = 'success' WHERE ""PayPal transaction (order) ID"" = '${payPalTransactionOrderId}';"`
  nixSqlite3CliCommand = `sqlite3 allen_young_stockmarket.db ` +
  `"UPDATE OR ROLLBACK \\"transactions\\" SET \\"Payment processing status\\" = 'success' WHERE \\"PayPal transaction (order) ID\\" = '${payPalTransactionOrderId}';"` 
  errorMessage = 'database-access.js test failure!  getTotalNumberOfSharesInTimedOutUncompletedTransactions() test transactions table entry update failure!'
  sqlite3CliCommandExecutionResult = executeSqlite3CliCommand(winSqlite3CliCommand, 
    nixSqlite3CliCommand, errorMessage)
  if (sqlite3CliCommandExecutionResult === null) {cleanup(); return;}

  try {
    result = await database_access.getNumberOfCompanySharesOwnedByUser(userPrimaryKey)
  } catch(error) {
    console.log('database-access.js test failure!  getNumberOfCompanySharesOwnedByUser() raised error!  ' + JSON.stringify(error))
    cleanup()
    return
  }

  console.log(`getNumberOfCompanySharesOwnedByUser() result:  ${JSON.stringify(result)}.`)

  if (result != 1000) {
      console.log('database-access.js test failure!  getNumberOfCompanySharesOwnedByUser() returned invalid result!')
      cleanup()
      return
  }


  /* **************************************************************************************
  User Account Webpage database-access test
  *************************************************************************************** */

  //
  //getUserStockTransactionHistoryPageContents() test
  //
  payPalTransactionOrderId2 = 'paypal-order-0002'
  companyStockTransactionId2 = 'company-order-0002'
  try {
    await database_access.createTransactionInitiationEntry(userPrimaryKey, 
      latestStockStatsTableEntryPrimaryKey,
      payPalTransactionOrderId2, companyStockTransactionId2, numberOfSharesToBuy, accessToken)
  } catch(error) {
    console.log('database-access.js test failure!  createTransactionInitiationEntry() raised error!  ' + error)
    cleanup()
    return
  }

  pageNumber = 1
  try {
    result = await database_access.getUserStockTransactionHistoryPageContents(userPrimaryKey, pageNumber)
  } catch(error) {
    console.log('database-access.js test failure!  getUserStockTransactionHistoryPageContents() raised error!  ' + JSON.stringify(error))
    cleanup()
    return
  }

  console.log(`getUserStockTransactionHistoryPageContents() result:  ${JSON.stringify(result)}.`)

  if (result[0]["PayPal transaction (order) ID"] != payPalTransactionOrderId ||
    result[1]["PayPal transaction (order) ID"] != payPalTransactionOrderId2) {
    console.log('database-access.js test failure!  getNumberOfCompanySharesOwnedByUser() returned invalid result!')
    cleanup()
    return
  }

  /* **************************************************************************************
  Admin Webpage database-access test
  *************************************************************************************** */

  //
  //getUserListPageContents() test
  //
  try {
    result = await database_access.getUserListPageContents(pageNumber)
  } catch(error) {
    console.log('database-access.js test failure!  getUserListPageContents() raised error!  ' + error)
    cleanup()
    return
  }

  console.log(`getUserListPageContents() result:  ${JSON.stringify(result)}.`)

  if (result[1]["First name"] != firstName || result[1]["Last name"] != lastName) {
    console.log('database-access.js test failure!  getUserListPageContents() returned invalid result!')
    cleanup()
    return
  }

  //
  //getStockTransactionHistoryPageContents() test
  //
  try {
    result = await database_access.getStockTransactionHistoryPageContents(pageNumber)
  } catch(error) {
    console.log('database-access.js test failure!  getStockTransactionHistoryPageContents() raised error!  ' + error)
    cleanup()
    return
  }

  console.log(`getStockTransactionHistoryPageContents() result:  ${JSON.stringify(result)}.`)

  if (result[0]["PayPal transaction (order) ID"] != payPalTransactionOrderId ||
    result[1]["PayPal transaction (order) ID"] != payPalTransactionOrderId2) {
    console.log('database-access.js test failure!  getNumberOfCompanySharesOwnedByUser() returned invalid result!')
    cleanup()
    return
  }

  /* **************************************************************************************
  Cleanup
  *************************************************************************************** */
  cleanup()

  console.log('database-access.js test success!')

  exitCode = 0
}

await testDatabaseAccessApi()

if (exitCode !== 0) {
  process.exitCode = exitCode
}
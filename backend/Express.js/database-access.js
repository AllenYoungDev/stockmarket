/*
NOTE
DO NOT delete the debug statements in this file.
The debug outputs from this file is used in test automation.
*/

import sqlite3 from "sqlite3";

import debugFactory from 'debug';
const debug = debugFactory('database-access');

import crypto from "crypto";

import {setTimeout} from "timers/promises";

const dbFileFullName = 'allen_young_stockmarket.db'
var db
sqlite3.verbose()

const dbQueryTimeoutInMilliseconds = 50
const dbTransactionTimeoutInMilliseconds = 300000 //5 minutes
export const dbStockReservationTimeoutInMilliseconds = 300000 //5 minutes
const dbMaximumNumberOfRowsReturned = 25

export class DatabaseOperationError {
	constructor(type, message) {
		this.type = type;
		this.message = message;
	}
}

export function outputSomethingToConsole() {
	console.log('outputSomethingToConsole() called!')
}

export function openDatabase() {
	db = new sqlite3.Database(dbFileFullName)
}

export function closeDatabase() {
	db.close()
}

export async function checkAccessTokenInUsersTable(accessToken) {
//For handling /CheckAccessTokenValidity route request.
//For handling /GetUserAccountSettings route request.

/*
If database access error, throw an appropriate error.

If the access token doesn't exist in the users table, return null;

If the access token exists in the users table, return 
[userPrimarykey, firstName, lastName, emailAddress, emailAddressVerified, 
phoneNumber, adminStatus].
*/
	debug("checkAccessTokenInUsersTable() start.")
	debug("checkAccessTokenInUsersTable() accessToken: " + accessToken)

	var callbackReturned = false
	var errResult
	var rowResult
	const sqlCommand = `SELECT * FROM "users" WHERE "Access token" = '${accessToken}';`
	debug(`checkAccessTokenInUsersTable() SQL command: ${sqlCommand}`)
	db.get(sqlCommand,
		(err, row) => {
			debug("checkAccessTokenInUsersTable() inside db.get() callback.")

			callbackReturned = true
			errResult = err
			rowResult = row
	})

	debug("checkAccessTokenInUsersTable() starting waiting.")
	while (!callbackReturned) {
		await setTimeout(dbQueryTimeoutInMilliseconds);
	}
	debug("checkAccessTokenInUsersTable() ending waiting.")

	debug("checkAccessTokenInUsersTable() callbackReturned: ", callbackReturned)
	debug("checkAccessTokenInUsersTable() errResult: ", errResult)
	debug("checkAccessTokenInUsersTable() rowResult: ", rowResult)

	debug("checkAccessTokenInUsersTable() end before return statements.")

	if (errResult !== null) {
		debug("checkAccessTokenInUsersTable() database access error.")
		throw new DatabaseOperationError("database access error", errResult);
	}

	if (rowResult === undefined) {
		debug("checkAccessTokenInUsersTable() no data with the given access token.")
		return null
	}
	
	return [rowResult['Primary key'],
		rowResult['First name'],
		rowResult['Last name'],
		rowResult['Email address'],
		rowResult['Email address verified'] === 'true' ? true : false,
		rowResult['Phone number'],
		rowResult['Admin'] === 'true' ? true : false]
}

export async function removeAllApplicableEntriesInStockReservationTable(
	latestStockStatsTableEntryPrimaryKey, accessToken) {
//For handling /GetCompanyStockData route request.
//For handling /Checkout route request.
	
/*
In an atomic database transaction, update 
"Number of Company shares available for purchase" in the stock stats table 
for the stock reservations to be removed (using a subquery); and
remove all the expired entries in the stock reservation table, and 
all the non-expired entry(ies) with the input access token
if the input access token is not ''.

If database access error, throw an error.
*/

	const datetimeNow = Date.now();

	var lastestStockStatsTableEntryUpdateSqlCommand
	var stockReservationTableEntriesRemovalSqlCommand

	//Execute the atomic database transaction.
	if (accessToken === '') {
		lastestStockStatsTableEntryUpdateSqlCommand = 
			`UPDATE OR ROLLBACK "stock stats" SET ` +
			`"Number of Company shares available for purchase" ` +
			`= "Number of Company shares available for purchase" ` +
			`+ (SELECT TOTAL("Number of reserved stocks") FROM "stock reservation" ` +
			`WHERE "Stock reservation end datetime" <= ${datetimeNow}), ` +
			`"Cash value of the shares available for purchase" ` +
			`= "Cash value of the shares available for purchase" ` +
			`+ (SELECT TOTAL("Number of reserved stocks") FROM "stock reservation" ` +
			`WHERE "Stock reservation end datetime" <= ${datetimeNow}) ` +
			`* (SELECT "Price per share" FROM "stock stats" ` +
			`WHERE "Primary key"=${latestStockStatsTableEntryPrimaryKey}) ` +
			`WHERE "Primary key"=${latestStockStatsTableEntryPrimaryKey};`			
		stockReservationTableEntriesRemovalSqlCommand = 
			`DELETE FROM "stock reservation" WHERE "Stock reservation end datetime" <= ${datetimeNow};`
	} else {
		lastestStockStatsTableEntryUpdateSqlCommand = 
			`UPDATE OR ROLLBACK "stock stats" SET ` +
			`"Number of Company shares available for purchase" ` +
			`= "Number of Company shares available for purchase" ` +
			`+ (SELECT TOTAL("Number of reserved stocks") FROM "stock reservation" ` +
			`WHERE "Stock reservation end datetime" <= ${datetimeNow} ` +
			`OR "Reserving-user access token" = '${accessToken}'), ` +
			`"Cash value of the shares available for purchase" = ` +
			`"Cash value of the shares available for purchase" ` +
			`+ (SELECT TOTAL("Number of reserved stocks") FROM "stock reservation" ` +
			`WHERE "Stock reservation end datetime" <= ${datetimeNow} ` +
			`OR "Reserving-user access token" = '${accessToken}') ` +
			`* (SELECT "Price per share" FROM "stock stats" ` +
			`WHERE "Primary key"=${latestStockStatsTableEntryPrimaryKey}) ` +
			`WHERE "Primary key"=${latestStockStatsTableEntryPrimaryKey};`
		stockReservationTableEntriesRemovalSqlCommand = 
			`DELETE FROM "stock reservation" WHERE "Stock reservation end datetime" <= ${datetimeNow} ` +
			`OR "Reserving-user access token" = '${accessToken}';`
	}

	debug(`removeAllApplicableEntriesInStockReservationTable() SQL command: ${lastestStockStatsTableEntryUpdateSqlCommand}`)
	debug(`removeAllApplicableEntriesInStockReservationTable() SQL command: ${stockReservationTableEntriesRemovalSqlCommand}`)

	var callbackReturned = false
	var errResult
	const sqlCommands = "BEGIN DEFERRED TRANSACTION;" +
		lastestStockStatsTableEntryUpdateSqlCommand +
		stockReservationTableEntriesRemovalSqlCommand +
		"END TRANSACTION;"
	db.exec(sqlCommands,
		function (err) { 
			callbackReturned = true
			errResult = err
		 }
	)

	while (!callbackReturned) {
		await setTimeout(dbQueryTimeoutInMilliseconds);
	}	

	if (errResult !== null) {
		throw new DatabaseOperationError( 
			'removeAllApplicableEntriesInStockReservationTable() database operation error',
			errResult);
	}	
}

export async function getTotalNumberOfSharesInTimedOutUncompletedTransactions(
	latestStockStatsTableEntryPrimaryKey) {
//For handling /GetCompanyStockData route request.
//For handling /Checkout route request.
	
/*
For performing the following.  
Ordinarily, there should be no initiated, but uncompleted transaction, 
so email the admin when such a transaction exists.

If database access error, throw an error.
*/

	const datetimeNow = Date.now();

	var callbackReturned = false
	var errResult
	var rowResult
	const sqlCommand = `SELECT SUM("Number of shares") FROM "transactions" ` +
		`WHERE "Payment processing completed" = 'false' ` +
		`AND "Transaction start datetime" + ${dbTransactionTimeoutInMilliseconds} <= ${datetimeNow} ` +
		`AND "Stock stats table entry primary key" = ${latestStockStatsTableEntryPrimaryKey};`
	debug(`getTotalNumberOfSharesInTimedOutUncompletedTransactions() SQL command: ${sqlCommand}`)
	db.get(sqlCommand,
		(err, row) => {
			callbackReturned = true
			errResult = err
			rowResult = row
	})

	while (!callbackReturned) {
		await setTimeout(dbQueryTimeoutInMilliseconds);
	}

	if (errResult !== null) {
		debug("getTotalNumberOfSharesInTimedOutUncompletedTransactions() database access error.")
		throw new DatabaseOperationError("database access error", errResult);
	}

	debug(`getTotalNumberOfSharesInTimedOutUncompletedTransactions() result:  ${JSON.stringify(rowResult)}.`)

	if (rowResult === undefined) {
		debug("getTotalNumberOfSharesInTimedOutUncompletedTransactions() no result.")
		return null
	}

	return rowResult['SUM("Number of shares")'] //This can be null if SUM() had only NULL input(s).
}

export async function updateNumberOfAvailableSharesInStockStatsTableWithUncompletedTransactions(
	latestStockStatsTableEntryPrimaryKey) {
//For handling /GetCompanyStockData route request.
//For handling /Checkout route request.
	
/*
In a pure write atomic database transaction, update 
the "Number of Company shares available for purchase" in the stock stats table 
for all the initiated, but uncompleted transaction after a timeout period 
(using a subquery); mark every initiated, but uncompleted transaction after 
a timeout period as 'payment timeout' in the "Payment processing status" field.  
Ordinarily, there should be no initiated, but uncompleted transaction, 
so email the admin when such a transaction exists.

If database access error, throw an error.
*/

	const datetimeNow = Date.now();

	//Execute the atomic database transaction.
	const lastestStockStatsTableEntryUpdateSqlCommand = 
		`UPDATE OR ROLLBACK "stock stats" SET ` +
		`"Number of Company shares available for purchase" = ` +
		`"Number of Company shares available for purchase" ` +
		`+ (SELECT TOTAL("Number of shares") FROM "transactions" ` +
		`WHERE "Payment processing completed" = 'false' ` +
		`AND "Transaction start datetime" + ${dbTransactionTimeoutInMilliseconds} <= ${datetimeNow} ` +
		`AND "Stock stats table entry primary key" = ${latestStockStatsTableEntryPrimaryKey}), ` +
		`"Cash value of the shares available for purchase" = ` +
		`"Cash value of the shares available for purchase" ` +
		`+ (SELECT TOTAL("Number of shares") FROM "transactions" ` +
		`WHERE "Payment processing completed" = 'false' ` +
		`AND "Transaction start datetime" + ${dbTransactionTimeoutInMilliseconds} <= ${datetimeNow} ` +
		`AND "Stock stats table entry primary key" = ${latestStockStatsTableEntryPrimaryKey}) ` +
		`* (SELECT "Price per share" FROM "stock stats" ` +
		`WHERE "Primary key"=${latestStockStatsTableEntryPrimaryKey}) ` +
		`WHERE "Primary key"=${latestStockStatsTableEntryPrimaryKey};`		
	const transactionsTableEntriesUpdateSqlCommand = 
		`UPDATE OR ROLLBACK "transactions" SET ` +
		`"Payment processing status" = 'payment timeout' ` +
		`WHERE "Payment processing completed" = 'false' ` +
		`AND "Transaction start datetime" + ${dbTransactionTimeoutInMilliseconds} <= ${datetimeNow} ` +
		`AND "Stock stats table entry primary key" = ${latestStockStatsTableEntryPrimaryKey};`
	
	debug(`updateNumberOfAvailableSharesInStockStatsTableWithUncompletedTransactions() SQL command: ${lastestStockStatsTableEntryUpdateSqlCommand}`)
	debug(`updateNumberOfAvailableSharesInStockStatsTableWithUncompletedTransactions() SQL command: ${transactionsTableEntriesUpdateSqlCommand}`)

	var callbackReturned = false
	var errResult
	const sqlCommands = "BEGIN DEFERRED TRANSACTION;" +
		lastestStockStatsTableEntryUpdateSqlCommand +
		transactionsTableEntriesUpdateSqlCommand +
		"END TRANSACTION;"
	db.exec(sqlCommands,
		function (err) { 
			callbackReturned = true
			errResult = err
		 }
	)

	while (!callbackReturned) {
		await setTimeout(dbQueryTimeoutInMilliseconds);
	}	

	if (errResult !== null) {
		throw new DatabaseOperationError( 
			'updateNumberOfAvailableSharesInStockStatsTableWithUncompletedTransactions() database operation error',
			errResult);
	}	
}

export async function getLatestCompanyStockData() {
//For handling /GetCompanyStockData route request.

/*
If database access error, throw an error.

Return null if 'stock stats' database query returned no result.

Return the latest company stock data using the latest entry in the stock stats table.
*/

	//
	//Get the latest entry in the stock stats table.
	//
	var callbackReturned = false
	var errResult
	var rowLatestStockStats
	db.get('SELECT * FROM "stock stats" ORDER BY "Stats entry datetime" DESC;',
		(err, row) => {
			callbackReturned = true
			errResult = err
			rowLatestStockStats = row
	})

	while (!callbackReturned) {
		await setTimeout(dbQueryTimeoutInMilliseconds);
	}

	if (errResult !== null) {
		throw new DatabaseOperationError(
			"getLatestCompanyStockData() 'stock stats' database access error", errResult);
	}

	if (rowLatestStockStats === undefined) {
		return null;
	}

	//
	//Return the latest company stock data.
	//	
	return [rowLatestStockStats['Primary key'], 
		rowLatestStockStats['Current Company valuation'],
		rowLatestStockStats['Number of authorized Company shares'],
		rowLatestStockStats['Number of issued Company shares'],
		rowLatestStockStats['Number of outstanding Company shares'],
		rowLatestStockStats['Number of Company shares available for purchase'],
		rowLatestStockStats['Price per share'],
		rowLatestStockStats['Cash value of the shares available for purchase'],		
		rowLatestStockStats['Stats entry datetime']
		]
}

export async function getNumberOfCompanySharesOwnedByUser(userPrimaryKey) {
//For handling /GetNumberOfCompanySharesOwnedByUser route request.

/*
If database access error, throw an error.

Using the user primary key, and the transactions table, add up all the numbers of 
purchased shares in all the completed transactions, with a single SQL command; 
return the total number of purchased shares.
*/

	var callbackReturned = false
	var errResult
	var rowResult
	const sqlCommand = `SELECT TOTAL("Number of shares") FROM "transactions" WHERE "User primary key" = ${userPrimaryKey} AND "Payment processing status" = 'success';`
	debug(`getNumberOfCompanySharesOwnedByUser() SQL command: ${sqlCommand}`)
	db.get(sqlCommand,
		(err, row) => {
			callbackReturned = true
			errResult = err
			rowResult = row
	})

	while (!callbackReturned) {
		await setTimeout(dbQueryTimeoutInMilliseconds)
	}

	if (errResult !== null) {
		throw new DatabaseOperationError(
			"getNumberOfCompanySharesOwnedByUser() database access error", 
			errResult);
	}

	if (rowResult === undefined) {
		return 0
	} else {
		return rowResult['TOTAL("Number of shares")']
	}
}

export async function checkUserEmailAddressInDatabase(userEmailAddress) {
//For handling /Login route request.
	
/*
If the user email address exists in the users table, return
the email address verification status, the salt-hashed password, the password salt,
and the admin status; otherwise, return null.

If database access error, throw an error.
*/

	var callbackReturned = false
	var errResult
	var rowResult
	const sqlCommand = `SELECT * FROM users WHERE "Email address" = '${userEmailAddress}';`
	debug(`checkUserEmailAddressInDatabase() SQL command:  ${sqlCommand}`)
	db.get(sqlCommand,
		(err, row) => {
			callbackReturned = true
			errResult = err
			rowResult = row
	})

	while (!callbackReturned) {
		await setTimeout(dbQueryTimeoutInMilliseconds)
	}

	if (errResult !== null) {
		debug(`checkUserEmailAddressInDatabase() errResult:  ${errResult}`)
		throw new DatabaseOperationError(
			"checkUserEmailAddressInDatabase() database access error", 
			errResult);
	}

	debug(`checkUserEmailAddressInDatabase() rowResult:  ${rowResult}`)
	debug(`checkUserEmailAddressInDatabase() typeof rowResult:  ${typeof rowResult}`)
	
	if (rowResult === undefined) {
		debug(`checkUserEmailAddressInDatabase() inside rowResult undefined check.`)
		return null;
	}

	debug(`checkUserEmailAddressInDatabase() rowResult:  ${rowResult}`)
	
	return [rowResult['Email address verified'] === 'true' ? true : false,
		rowResult['Salt-hashed password'],
		rowResult['Password salt'],
		rowResult['Admin'] === 'true' ? true : false,
		rowResult['Access token']
		]
}

export async function storeAccessTokenInUsersTable(userEmailAddress, accessToken) {
//For handling /Login route request.

/*
If the user email address doesn't exist in the users table, or database access error, 
throw an error.
*/

	var callbackReturned = false
	var errResult
	const sqlCommand = `UPDATE users SET "Access token" = '${accessToken}' WHERE "Email address" = '${userEmailAddress}';`
	debug(`storeAccessTokenInUsersTable() SQL command:  ${sqlCommand}`)
	db.run(sqlCommand,
		function (err) { 
			debug('storeAccessTokenInUsersTable() callback inside.')

			callbackReturned = true
			errResult = err
		}
	)

	debug('storeAccessTokenInUsersTable() before callback waiting.')

	while (!callbackReturned) {
		await setTimeout(dbQueryTimeoutInMilliseconds);
	}	

	debug('storeAccessTokenInUsersTable() after callback waiting.')

	if (errResult !== null) {
		throw new DatabaseOperationError(
			'storeAccessTokenInUsersTable() database access error', errResult);
	}
}

export async function reserveSharesToBuy(latestStockStatsTableEntryPrimaryKey,
	numberOfSharesToBuy, accessToken) {
//For handling /Checkout route request.
	
/*
Perform a pure write atomic database transaction for checking the available number of 
shares to buy using the stock stats table, and the 'total number of Company shares to buy' 
input, and adding an applicable entry to the stock reservation table, and updating 
the "Number of Company shares available for purchase" and 
"Cash value of the shares available for purchase" in the stock stats table, 
when enough number of shares are available for purchase.

If database access error, throw an error.
*/

	debug("reserveSharesToBuy() start.")

	const datetimeNow = Date.now();
	debug(`reserveSharesToBuy() datetimeNow:  ${datetimeNow}`)

	//Execute the atomic database transaction.
	const lastestStockStatsTableEntryUpdateSqlCommand = 
		`UPDATE OR ROLLBACK "stock stats" SET ` +
		`"Number of Company shares available for purchase" = "Number of Company shares available for purchase" ` +
		`- ${numberOfSharesToBuy}, ` +
		`"Cash value of the shares available for purchase" = "Cash value of the shares available for purchase" ` +
		`- ${numberOfSharesToBuy} * (SELECT "Price per share" FROM "stock stats" ` +
		`WHERE "Primary key"=${latestStockStatsTableEntryPrimaryKey}) ` +
		`WHERE "Primary key"=${latestStockStatsTableEntryPrimaryKey};`			
	const stockReservationTableEntryInsertionSqlCommand = 
		`INSERT OR ROLLBACK INTO "stock reservation" ('Stock stats table entry primary key', 'Number of reserved stocks', ` +
		`'Stock reservation start datetime', 'Stock reservation end datetime', 'Reserving-user access token') ` +
		`VALUES(${latestStockStatsTableEntryPrimaryKey}, ${numberOfSharesToBuy}, ${datetimeNow}, ` +
		`${datetimeNow + dbStockReservationTimeoutInMilliseconds}, '${accessToken}');`

	debug(`reserveSharesToBuy() lastestStockStatsTableEntryUpdateSqlCommand SQL command:  ${lastestStockStatsTableEntryUpdateSqlCommand}`)
	debug(`reserveSharesToBuy() stockReservationTableEntryInsertionSqlCommand SQL command:  ${stockReservationTableEntryInsertionSqlCommand}`)

	var callbackReturned = false
	var errResult
	const sqlCommands = "BEGIN DEFERRED TRANSACTION;" +
		lastestStockStatsTableEntryUpdateSqlCommand +
		stockReservationTableEntryInsertionSqlCommand +
		"END TRANSACTION;"
	db.exec(sqlCommands,
		function (err) { 
			callbackReturned = true
			errResult = err
		}
	)

	while (!callbackReturned) {
		await setTimeout(dbQueryTimeoutInMilliseconds);
	}	

	debug("reserveSharesToBuy() end.")

	if (errResult !== null) {
		throw new DatabaseOperationError( 
			'reserveSharesToBuy() database operation error',
			errResult);
	}	
}

export async function checkStockReservationTableEntry(accessToken) {
//For handling /Checkout/api/orders route request.
	
/*
If the stock reservation table entry with the reserving-user access token doesn't exist,
return null; otherwise, return all the stock reservation table entry fields in an array.

If database access error, throw an error.
*/

	var callbackReturned = false
	var errResult
	var rowResult
	const sqlCommand = `SELECT * FROM "Stock reservation" WHERE "Reserving-user access token" = '${accessToken}';`
	debug(`checkStockReservationTableEntry() SQL command:  ${sqlCommand}`)
	db.get(sqlCommand, 
		(err, row) => {
			callbackReturned = true
			errResult = err
			rowResult = row
	})

	while (!callbackReturned) {
		await setTimeout(dbQueryTimeoutInMilliseconds)
	}

	if (errResult !== null) {
		throw new DatabaseOperationError(
			"checkUserEmailAddressInDatabase() database access error", 
			errResult);
	}

	if (rowResult === undefined) {
		return null
	}

	debug(`checkStockReservationTableEntry() rowResult:  ${JSON.stringify(rowResult)}`)

	return [rowResult['Primary key'],
		rowResult['Stock stats table entry primary key'],
		rowResult['Number of reserved stocks'],
		rowResult['Stock reservation start datetime'],
		rowResult['Stock reservation end datetime']
		]
}

export async function createTransactionInitiationEntry(userPrimaryKey, 
	stockStatsTableEntryPrimaryKey,
	payPalTransactionOrderId, companyStockTransactionId, numberOfShares, accessToken) {
//For handling /Checkout/api/orders route request.
	
/*
Create a transactions table entry with the 'payment processing completed' set to 'false' and 
the 'payment processing failure' value unassigned.
Remove the stock reservation table entry with the reserving-user access token.

If database access error, throw an error.
*/

	const datetimeNow = Date.now();

	//Execute the atomic database transaction.
	const transactionsTableEntryInsertionSqlCommand = 
		`INSERT OR ROLLBACK INTO "Transactions" ('User primary key', 'Stock stats table entry primary key', ` +
		`'Transaction start datetime', 'Transaction end datetime', 'PayPal transaction (order) ID', ` +
		`'Company stock transaction ID', 'Number of shares', 'Payment processing initiated', ` +
		`'Payment processing completed', 'Entry update counter') VALUES(${userPrimaryKey}, ` +
		`${stockStatsTableEntryPrimaryKey}, ${datetimeNow}, ${datetimeNow}, '${payPalTransactionOrderId}', ` +
		`'${companyStockTransactionId}', ${numberOfShares}, 'true', 'false', 0);`
	const stockReservationTableEntryRemovalSqlCommand = 
		`DELETE FROM "stock reservation" WHERE "Reserving-user access token" = '${accessToken}';`

	debug(`createTransactionInitiationEntry() SQL command: ${transactionsTableEntryInsertionSqlCommand}`)
	debug(`createTransactionInitiationEntry() SQL command: ${stockReservationTableEntryRemovalSqlCommand}`)

	var callbackReturned = false
	var errResult
	const sqlCommands = "BEGIN DEFERRED TRANSACTION;" +
		transactionsTableEntryInsertionSqlCommand +
		stockReservationTableEntryRemovalSqlCommand +
		"END TRANSACTION;"
	db.exec(sqlCommands,
		function (err) { 
			callbackReturned = true
			errResult = err
		}
	)

	while (!callbackReturned) {
		await setTimeout(dbQueryTimeoutInMilliseconds);
	}	

	if (errResult !== null) {
		throw new DatabaseOperationError( 
			'createTransactionInitiationEntry() database operation error',
			errResult);
	}	
}

export async function updateTransactionsTableEntryForTransactionPaymentFailure(
	payPalTransactionOrderId, latestStockStatsTableEntryPrimaryKey) {
//For handling /Checkout/api/orders/:orderID/capture route request.

/*
If database access error, throw an error.
*/

	const datetimeNow = Date.now();

	//Execute the atomic database transaction.
	const transactionsTableEntryUpdateSqlCommand = 
		`UPDATE OR ROLLBACK "transactions" SET "Payment processing completed" = 'true', ` +
		`"Transaction end datetime" = ${datetimeNow}, ` +
		`"Payment processing status" = 'payment decline', ` +
		`"Entry update counter" = "Entry update counter" + 1 ` +
		`WHERE "PayPal transaction (order) ID" = '${payPalTransactionOrderId}';`
	const stockStatsTableEntryUpdateSqlCommand = 
		`UPDATE OR ROLLBACK "stock stats" SET ` +
		`"Number of Company shares available for purchase" = "Number of Company shares available for purchase" ` +
		`+ (SELECT "Number of shares" FROM "transactions" ` +
		`WHERE "PayPal transaction (order) ID" = '${payPalTransactionOrderId}'), ` +
		`"Cash value of the shares available for purchase" = "Cash value of the shares available for purchase" ` +
		`+ (SELECT "Number of shares" FROM "transactions" ` +
		`WHERE "PayPal transaction (order) ID" = '${payPalTransactionOrderId}') ` +
		`* (SELECT "Price per share" FROM "stock stats" ` +
		`WHERE "Primary key"=${latestStockStatsTableEntryPrimaryKey}) ` +
		`WHERE "Primary key"=${latestStockStatsTableEntryPrimaryKey};`		

	debug(`updateTransactionsTableEntryForTransactionPaymentFailure() transactionsTableEntryUpdateSqlCommand SQL command: ${transactionsTableEntryUpdateSqlCommand}`)
	debug(`updateTransactionsTableEntryForTransactionPaymentFailure() stockStatsTableEntryUpdateSqlCommand SQL command: ${stockStatsTableEntryUpdateSqlCommand}`)

	var callbackReturned = false
	var errResult
	const sqlCommands = "BEGIN DEFERRED TRANSACTION;" +
		transactionsTableEntryUpdateSqlCommand +
		stockStatsTableEntryUpdateSqlCommand +			
		"END TRANSACTION;"
	db.exec(sqlCommands,
		function (err) { 
			callbackReturned = true
			errResult = err
		}
	)

	while (!callbackReturned) {
		await setTimeout(dbQueryTimeoutInMilliseconds);
	}	

	if (errResult !== null) {
		throw new DatabaseOperationError( 
			'updateTransactionsTableEntryForTransactionPaymentFailure() database operation error',
			errResult);
	}	
}

export async function updateTransactionsTableEntryForTransactionPaymentSuccess(
	payPalTransactionOrderId, latestStockStatsTableEntryPrimaryKey) {
//For handling /Checkout/api/orders/:orderID/capture route request.

/*
If database access error, throw an error.
*/

	const datetimeNow = Date.now();

	//Execute the atomic database transaction.
	const transactionsTableEntryUpdateSqlCommand = 
		`UPDATE OR ROLLBACK "transactions" SET "Payment processing completed" = 'true', ` +
		`"Transaction end datetime" = ${datetimeNow}, ` +
		`"Payment processing status" = 'success', ` +
		`"Entry update counter" = "Entry update counter" + 1 ` +
		`WHERE "PayPal transaction (order) ID" = '${payPalTransactionOrderId}';`
	const stockStatsTableEntryUpdateSqlCommand = 
		`UPDATE OR ROLLBACK "stock stats" SET ` + 
		`"Number of issued Company shares" = "Number of issued Company shares" ` +
		`+ (SELECT "Number of shares" FROM "transactions" ` +
		`WHERE "PayPal transaction (order) ID" = '${payPalTransactionOrderId}'), ` +
		`"Number of outstanding Company shares" = "Number of outstanding Company shares" ` +
		`+ (SELECT "Number of shares" FROM "transactions" ` +
		`WHERE "PayPal transaction (order) ID" = '${payPalTransactionOrderId}') ` +
		`WHERE "Primary key"=${latestStockStatsTableEntryPrimaryKey};`			

	debug(`updateTransactionsTableEntryForTransactionPaymentSuccess() transactionsTableEntryUpdateSqlCommand SQL command: ${transactionsTableEntryUpdateSqlCommand}`)
	debug(`updateTransactionsTableEntryForTransactionPaymentSuccess() stockStatsTableEntryUpdateSqlCommand SQL command: ${stockStatsTableEntryUpdateSqlCommand}`)

	var callbackReturned = false
	var errResult
	const sqlCommands = "BEGIN DEFERRED TRANSACTION;" +
		transactionsTableEntryUpdateSqlCommand +
		stockStatsTableEntryUpdateSqlCommand +			
		"END TRANSACTION;"
	db.exec(sqlCommands,
		function (err) { 
			callbackReturned = true
			errResult = err
		}
	)

	while (!callbackReturned) {
		await setTimeout(dbQueryTimeoutInMilliseconds);
	}	

	if (errResult !== null) {
		throw new DatabaseOperationError( 
			'updateTransactionsTableEntryForTransactionPaymentSuccess() database operation error',
			errResult);
	}
}

export async function getTransactionRecord(paypalTransactionOrderId) {
//For handling /Receipt route request.
		
/*
If success, return the transaction data; otherwise, throw a proper error.
*/

	var callbackReturned = false
	var errResult
	var rowResult
	const sqlCommand = `SELECT * FROM "transactions" WHERE "PayPal transaction (order) ID" IS "${paypalTransactionOrderId}";`
	debug(`getTransactionRecord() SQL command: ${sqlCommand}`)
	db.get(sqlCommand, 
		(err, row) => {
			callbackReturned = true
			errResult = err
			rowResult = row
	})

	while (!callbackReturned) {
		await setTimeout(dbQueryTimeoutInMilliseconds)
	}

	if (errResult !== null) {
		throw new DatabaseOperationError(
			"getTransactionRecord() database access error", 
			errResult);
	}

	if (rowResult === undefined) {
		return null
	}

	debug(`getTransactionRecord() result:  ${JSON.stringify(rowResult)}.`)

	return [rowResult['Primary key'],
		rowResult['User primary key'],
		rowResult['Stock stats table entry primary key'],
		rowResult['Transaction start datetime'],
		rowResult['Transaction end datetime'],
		rowResult['PayPal transaction (order) ID'],
		rowResult['Company stock transaction ID'],
		rowResult['Number of shares'],
		rowResult['Payment processing initiated'] === 'true' ? true : false,
		rowResult['Payment processing completed'] === 'true' ? true : false,
		rowResult['Payment processing status'],
		rowResult['Entry update counter']
		]
}

export async function addUserEntryInUsersTable(firstName, lastName, emailAddress, 
	phoneNumber, password) {
//For handling /RegisterUser route request.
		
/*
If success, return the auto-generated access token; otherwise, throw a proper error.
*/
	const passwordSalt = crypto.randomBytes(32).toString('hex');
	const saltHashedPassword = 
		crypto.createHash('sha256').update(password+passwordSalt).digest('hex');
	do {
		var accessTokenToCheck = crypto.randomUUID();
		var accessTokenInDatabase = await checkAccessTokenInUsersTable(accessTokenToCheck);

		debug('addUserEntryInUsersTable() accessTokenToCheck: ' + accessTokenToCheck);
		debug('addUserEntryInUsersTable() accessTokenInDatabase: ' + accessTokenInDatabase);
	} while (accessTokenInDatabase !== null);	
	const accessToken = accessTokenToCheck;

	debug('addUserEntryInUsersTable() passwordSalt: ' + passwordSalt)
	debug('addUserEntryInUsersTable() saltHashedPassword: ' + saltHashedPassword)
	debug('addUserEntryInUsersTable() accessToken: ' + accessToken)

	var callbackReturned = false
	var errResult
	const sqlCommand = `INSERT INTO users ` + 
		`('First name', 'Last name', 'Email address', 'Email address verified', ` +
		`'Phone number', 'Salt-hashed password', 'Password salt', 'Admin', ` +
		`'Access token', 'User deleted') ` +
		`VALUES('${firstName}', '${lastName}', '${emailAddress}', 'false', '${phoneNumber}', '${saltHashedPassword}', '${passwordSalt}', 'false', '${accessToken}', 'false');`
	debug(`addUserEntryInUsersTable() SQL command: ${sqlCommand}`)
	db.run(sqlCommand,
		function (err) { 
			callbackReturned = true
			errResult = err
		 }
	)

	while (!callbackReturned) {
		await setTimeout(dbQueryTimeoutInMilliseconds);
	}	

	debug("addUserEntryInUsersTable() end before return statements.")

	if (errResult === null) {
		return accessToken
	} else {
		throw new DatabaseOperationError(
			'addUserEntryInUsersTable() database access error', errResult);
	}
}

export async function setEmailAddressVerifiedInUsersTable(accessToken) {
//For handling /GetEmailAddressVerificationSuccessPage route request.
	
/*
If the access token exists, set the 'email address verified' field value to
'true' in the users table entry.

Return 'success' or 'invalid access token' as appropriate.

If database access error, throw an error.
*/

	var callbackReturned = false
	var errResult
	const sqlCommand = `UPDATE users SET "Email address verified" = 'true' WHERE "Access token" IS '${accessToken}';`
	debug(`setEmailAddressVerifiedInUsersTable() SQL command: ${sqlCommand}`)
	db.run(sqlCommand,
		function (err) { 
			callbackReturned = true
			errResult = err
		}
	)

	while (!callbackReturned) {
		await setTimeout(dbQueryTimeoutInMilliseconds);
	}	

	if (errResult !== null) {
		throw new DatabaseOperationError(
			'setEmailAddressVerifiedInUsersTable() database access error', errResult);
	}

}

export async function assignNewAccessToken(userEmailAddress) {
//For handling /SendResetPasswordEmail route request.

/*
Update the user entry in the users table, with an auto-generated access token.
If the email address doesn't exist in the users table, raise an error.
If database update operation success, return the access token.

If database access error, throw an error.
*/

	do {
		var accessTokenToCheck = crypto.randomUUID();
		var accessTokenInDatabase = await checkAccessTokenInUsersTable(accessTokenToCheck);
	} while (accessTokenInDatabase !== null);	
	const accessToken = accessTokenToCheck;

	debug(`assignNewAccessToken() new access token:  ${accessToken}.`)

	await storeAccessTokenInUsersTable(userEmailAddress, accessToken);

	debug('assignNewAccessToken() end.')

	return accessToken
}

export async function updatePasswordInUsersTable(accessToken, password) {
//For handling /ResetPassword route request.
	
/*
If database access error, throw an error.
*/

	const passwordSalt = crypto.randomBytes(32).toString('hex');
	const saltHashedPassword = 
		crypto.createHash('sha256').update(password+passwordSalt).digest('hex');

	debug(`updatePasswordInUsersTable() passwordSalt:  ${passwordSalt}.`)
	debug(`updatePasswordInUsersTable() saltHashedPassword:  ${saltHashedPassword}.`)

	var callbackReturned = false
	var errResult
	const sqlCommand = `UPDATE users SET "Salt-hashed password" = '${saltHashedPassword}', "Password salt" = '${passwordSalt}' WHERE "Access token" = '${accessToken}';`
	debug(`updatePasswordInUsersTable() SQL command: ${sqlCommand}`)
	db.run(sqlCommand,
		function (err) { 
			callbackReturned = true
			errResult = err
		}
	)

	while (!callbackReturned) {
		await setTimeout(dbQueryTimeoutInMilliseconds);
	}	

	if (errResult !== null) {
		throw new DatabaseOperationError(
			'updatePasswordInUsersTable() database access error', errResult);
	}
}

export async function updateUserAccountSettings(accessToken, firstName, lastName, 
	emailAddress, phoneNumber, password) {
//For handling /UpdateUserAccountSettings route request.
	
/*
Update the user account settings in the users table.
If any value is blank, don't update it, including and especially password.

If database access error, throw an error.
*/
	if (firstName == '' && lastName == '' && emailAddress == '' &&
		phoneNumber == '' && password == '' ) {return;}

	const sqlCommandStart = `UPDATE users SET`
	var sqlCommand = sqlCommandStart

	if (firstName != '') {
		sqlCommand += ` "First name" = '${firstName}'`
	}

	if (lastName != '') {
		if (sqlCommand !== sqlCommandStart) {sqlCommand += ',';}
		sqlCommand += ` "Last name" = '${lastName}'`
	}

	if (emailAddress != '') {
		if (sqlCommand !== sqlCommandStart) {sqlCommand += ',';}
		sqlCommand += ` "Email address" = '${emailAddress}'`
	}

	if (phoneNumber != '') {
		if (sqlCommand !== sqlCommandStart) {sqlCommand += ',';}
		sqlCommand += ` "Phone number" = '${phoneNumber}'`
	}

	if (password != '') {
		const passwordSalt = crypto.randomBytes(32).toString('hex');
		const saltHashedPassword = 
			crypto.createHash('sha256').update(password+passwordSalt).digest('hex');	

		if (sqlCommand !== sqlCommandStart) {sqlCommand += ',';}
		sqlCommand += ` "Salt-hashed password" = '${saltHashedPassword}',`
		sqlCommand += ` "Password salt" = '${passwordSalt}'`

		debug(`updateUserAccountSettings() saltHashedPassword:  ${saltHashedPassword}.`)
		debug(`updateUserAccountSettings() passwordSalt:  ${passwordSalt}.`)
	}

	sqlCommand += ` WHERE "Access token" = '${accessToken}';`
	
	debug(`updateUserAccountSettings() SQL command:  ${sqlCommand}.`)

	var callbackReturned = false
	var errResult
	db.run(sqlCommand,
		function (err) { 
			callbackReturned = true
			errResult = err
		}
	)

	while (!callbackReturned) {
		await setTimeout(dbQueryTimeoutInMilliseconds);
	}	

	if (errResult !== null) {
		throw new DatabaseOperationError(
			'updateUserAccountSettings() database access error', errResult);
	}
}
	
export async function getNumberOfUserStockTransactions(userPrimaryKey) {
	//For handling /GetNumberOfUserStockTransactions route request.
			
	/*	
	If database access error, throw an error.
	*/
		
	var callbackReturned = false
	var errResult
	var rowResult
	const sqlCommand = `SELECT COUNT(1) FROM "transactions" WHERE "User primary key" = ${userPrimaryKey};`
	debug(`getNumberOfUserStockTransactions() SQL command: ${sqlCommand}`)
	db.get(sqlCommand,
		(err, row) => {
			callbackReturned = true
			errResult = err
			rowResult = row
	})

	while (!callbackReturned) {
		await setTimeout(dbQueryTimeoutInMilliseconds);
	}

	if (errResult !== null) {
		throw new DatabaseOperationError(
			"getNumberOfUserStockTransactions() database access error", errResult);
	}

	if (rowResult === undefined) {
		throw new DatabaseOperationError(
			"getNumberOfUserStockTransactions() database access error", 'rowResult is undefined');
	}

	debug(`getNumberOfUserStockTransactions() rowResult:  ${JSON.stringify(rowResult)}.`)

	return rowResult["COUNT(1)"]
}

export async function getUserStockTransactionHistoryPageContents(userPrimaryKey, pageNumber) {
//For handling /GetUserStockTransactionHistory route request.
		
/*
Generate and return the Company stock transaction history page contents (JSON [or HTML]) 
using the input page number; if no transaction history for the input page number, 
return null.

If database access error, throw an error.
*/

	pageNumber = parseInt(pageNumber, 10);
	if (isNaN(pageNumber) || pageNumber === 0) {
		return [];
	}

	const offset = (pageNumber - 1) * dbMaximumNumberOfRowsReturned

	var callbackReturned = false
	var errResult
	var rowsResult
	const sqlCommand = `SELECT * FROM "transactions" WHERE "User primary key" = ${userPrimaryKey} ORDER BY "Transaction start datetime" ASC LIMIT ${dbMaximumNumberOfRowsReturned} OFFSET ${offset};`
	debug(`getUserStockTransactionHistoryPageContents() SQL command: ${sqlCommand}`)
	db.all(sqlCommand,
		(err, rows) => {
			callbackReturned = true
			errResult = err
			rowsResult = rows
	})

	while (!callbackReturned) {
		await setTimeout(dbQueryTimeoutInMilliseconds);
	}

	if (errResult !== null) {
		throw new DatabaseOperationError(
			"getUserStockTransactionHistoryPageContents() database access error", errResult);
	}

	if (rowsResult === undefined) {
		return [];
	}

	debug(`getUserStockTransactionHistoryPageContents() rowsResult:  ${JSON.stringify(rowsResult)}.`);

	const resultToReturn = rowsResult.map(rowResult => {
		return {
			"ID": rowResult["Primary key"],
			"Transaction start datetime": rowResult["Transaction start datetime"],
			"PayPal transaction (order) ID": rowResult["PayPal transaction (order) ID"],
			"Number of shares": rowResult["Number of shares"],
			"Payment processing initiated": rowResult["Payment processing initiated"],
			"Payment processing completed": rowResult["Payment processing completed"],
			"Payment processing status": rowResult["Payment processing status"],
		}
	});

	return resultToReturn;
}

export async function getTotalNumberOfUsers() {
	//For handling GetTotalNumberOfUsers route request.
			
	/*	
	If database access error, throw an error.
	*/
		
	var callbackReturned = false
	var errResult
	var rowResult
	const sqlCommand = `SELECT COUNT(1) FROM "users";`
	debug(`getTotalNumberOfUsers() SQL command: ${sqlCommand}`)
	db.get(sqlCommand,
		(err, row) => {
			callbackReturned = true
			errResult = err
			rowResult = row
	})

	while (!callbackReturned) {
		await setTimeout(dbQueryTimeoutInMilliseconds);
	}

	if (errResult !== null) {
		throw new DatabaseOperationError(
			"getTotalNumberOfUsers() database access error", errResult);
	}

	if (rowResult === undefined) {
		throw new DatabaseOperationError(
			"getTotalNumberOfUsers() database access error", 'rowResult is undefined');
	}

	return rowResult["COUNT(1)"]
}

export async function getUserListPageContents(pageNumber) {
//For handling /GetUserList route request.

/*
Generate and return the User List page contents (JSON [or HTML]) using 
the input page number; if no transaction history for the input page number, return null.

If database access error, throw an error.
*/

	pageNumber = parseInt(pageNumber, 10);
	if (isNaN(pageNumber) || pageNumber === 0) {
		return [];
	}

	const offset = (pageNumber - 1) * dbMaximumNumberOfRowsReturned

	var callbackReturned = false
	var errResult
	var rowsResult
	const sqlCommand = `SELECT * FROM "users" ORDER BY "Primary key" ASC LIMIT ${dbMaximumNumberOfRowsReturned} OFFSET ${offset};`
	debug(`getUserListPageContents() SQL command: ${sqlCommand}`)
	db.all(sqlCommand,
		(err, rows) => {
			callbackReturned = true
			errResult = err
			rowsResult = rows
	})

	while (!callbackReturned) {
		await setTimeout(dbQueryTimeoutInMilliseconds);
	}

	if (errResult !== null) {
		throw new DatabaseOperationError(
			"getUserListPageContents() database access error", errResult);
	}

	if (rowsResult === undefined) {
		return [];
	}

	const resultToReturn = rowsResult.map(rowResult => {
		return {
			"ID": rowResult["Primary key"],
			"First name": rowResult["First name"],
			"Last name": rowResult["Last name"],
			"Email address": rowResult["Email address"],
			"Email address verified": rowResult["Email address verified"],
			"Phone number": rowResult["Phone number"],
			"Admin": rowResult["Admin"],
			"User deleted": rowResult["User deleted"],
		}
	});

	return resultToReturn;
}

export async function getTotalNumberOfTransactions() {
	//For handling GetTotalNumberOfTransactions route request.
			
	/*	
	If database access error, throw an error.
	*/
		
	var callbackReturned = false
	var errResult
	var rowResult
	const sqlCommand = `SELECT COUNT(1) FROM "transactions";`
	debug(`getTotalNumberOfTransactions() SQL command: ${sqlCommand}`)
	db.get(sqlCommand,
		(err, row) => {
			callbackReturned = true
			errResult = err
			rowResult = row
	})

	while (!callbackReturned) {
		await setTimeout(dbQueryTimeoutInMilliseconds);
	}

	if (errResult !== null) {
		throw new DatabaseOperationError(
			"getTotalNumberOfTransactions() database access error", errResult);
	}

	if (rowResult === undefined) {
		throw new DatabaseOperationError(
			"getTotalNumberOfTransactions() database access error", 'rowResult is undefined');
	}

	return rowResult["COUNT(1)"]
}

export async function getStockTransactionHistoryPageContents(pageNumber) {
//For handling /GetTransactionHistory route request.
		
/*
Generate and return the Transaction List page contents (JSON [or HTML])
using the input page number; if no transaction history for the input page number, 
return null.

If database access error, throw an error.
*/

	pageNumber = parseInt(pageNumber, 10);
	if (isNaN(pageNumber) || pageNumber === 0) {
		return [];
	}

	const offset = (pageNumber - 1) * dbMaximumNumberOfRowsReturned

	var callbackReturned = false
	var errResult
	var rowsResult
	const sqlCommand = `SELECT * FROM "transactions" ORDER BY "Transaction start datetime" ASC LIMIT ${dbMaximumNumberOfRowsReturned} OFFSET ${offset};`
	debug(`getStockTransactionHistoryPageContents() SQL command: ${sqlCommand}`)
	db.all(sqlCommand,
		(err, rows) => {
			callbackReturned = true
			errResult = err
			rowsResult = rows
	})

	while (!callbackReturned) {
		await setTimeout(dbQueryTimeoutInMilliseconds);
	}

	if (errResult !== null) {
		throw new DatabaseOperationError(
			"getStockTransactionHistoryPageContents() database access error", errResult);
	}

	if (rowsResult === undefined) {
		return [];
	}

	return rowsResult
}

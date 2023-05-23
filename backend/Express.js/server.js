import "dotenv/config";

import express from "express";
import cookieParser from 'cookie-parser';
import cors from 'cors';

import * as paypal from "./paypal-api.js";
import * as orderProcessor from "./order-processor.js";
import * as https from 'https';
import * as fs from 'fs';

import * as database_access from "./database-access.js";
export { database_access }

import process from 'node:process';

import {setTimeout} from "timers/promises";

import crypto from "crypto";

import debugFactory from 'debug';
const debug = debugFactory('server');

import { checkPasswordFormat } from './checkPasswordFormat.js';

const websiteHomeUrl = 'http://localhost/'
const backendApiBaseUrl = 'https://localhost:8888/'

const privateKeyFilePath = 'localhost-key.pem'
const certificateFilePath = 'localhost.pem'

const validateEmail = (email) => {
  return email.match(
    /[^@]+@[^@]+\.[^@]+/
  );
};

var latestStockStatsTableEntryPrimaryKey;
var latestCurrentValuation
var latestNumberOfAuthorizedShares
var latestPricePerShare;
var processingFeePercentage = 6;
var transactionFeeMultiplier = 1.06; //6% processing fee

var secureServer = false
var corsServer = false
var app = null
var server = null
export var serverRunning = false

export async function runServer() {
  app = express();
  app.set("view engine", "ejs");
  app.use(express.static("public"));
  app.use(cookieParser())
  app.use(express.json()) // for parsing application/json
  app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

  if(corsServer) {
    app.use(cors({origin:true,credentials: true}));
  }

  /* ******************************************************************************************
  Stockmarket home page routes
  ******************************************************************************************* */

  //
  // /CheckAccessTokenValidity route method
  //
  app.get('/CheckAccessTokenValidity', async (req, res) => {
    var result, accessToken

    res.set('Content-Type', 'text/html')

    debug(`/CheckAccessTokenValidity req.cookies:  ${JSON.stringify(req.cookies)}.`)
    debug(`/CheckAccessTokenValidity req.get('Cookie'):  ${JSON.stringify(req.get('Cookie'))}.`)
    
    if (!('accessToken' in req.cookies)) {
      res.status(400).send('No accessToken cookie')
      return
    } else {
      accessToken = req.cookies['accessToken']
    }
    
    try {
      result = await database_access.checkAccessTokenInUsersTable(accessToken)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/CheckAccessTokenValidity", 
        'database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    if (result === null) {
      if (secureServer) {
        res.clearCookie('accessToken', { sameSite: 'None', secure: true })
        res.clearCookie('admin', { sameSite: 'None', secure: true })
      } else {
        res.clearCookie('accessToken')
        res.clearCookie('admin')
      }      
      res.status(401).send('invalid')
    } else {
      res.send('valid')
    }
  })

  //
  // /GetCompanyStockData route method
  //
  app.get('/GetCompanyStockData', async (req, res) => {
    var result, accessToken = ''
    
    res.set('Content-Type', 'text/html')

    if ('accessToken' in req.cookies) {
      accessToken = req.cookies['accessToken']

      try {
        result = await database_access.checkAccessTokenInUsersTable(accessToken)
      } catch(error) {
        //Send an email to the server admin using AWS SES.
        orderProcessor.logAndEmailError("/GetCompanyStockData", 
          'checkAccessTokenInUsersTable() database access error\n' + JSON.stringify(error));

        res.status(500).send('database access error')
        return
      }

      if (result === null) {
        accessToken = ''
      }
    }
    
    try {
      await database_access.removeAllApplicableEntriesInStockReservationTable(
        latestStockStatsTableEntryPrimaryKey, accessToken)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/GetCompanyStockData", 
        'removeAllApplicableEntriesInStockReservationTable() database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    try {
      result = await database_access.getTotalNumberOfSharesInTimedOutUncompletedTransactions(
        latestStockStatsTableEntryPrimaryKey)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/GetCompanyStockData", 
        'getTotalNumberOfSharesInTimedOutUncompletedTransactions() database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    if(result !== null) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/GetCompanyStockData", 
        'getTotalNumberOfSharesInTimedOutUncompletedTransactions() returned non-null.');
    }

    try {
      await database_access.updateNumberOfAvailableSharesInStockStatsTableWithUncompletedTransactions(
        latestStockStatsTableEntryPrimaryKey)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/GetCompanyStockData", 
        'updateNumberOfAvailableSharesInStockStatsTableWithUncompletedTransactions() database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    try {
      result = await database_access.getLatestCompanyStockData()
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/GetCompanyStockData", 
        'getLatestCompanyStockData() database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    if(result === null) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/GetCompanyStockData", 
        'getLatestCompanyStockData() returned null.');

        try {
          res.status(500).send('database access error')
        } catch(error) {
          return
        }

        return
    }

    try {
      res.set('Content-Type', 'application/json')
      res.json(result.slice(1, 8))
    } catch(error) {
      return
    }
  })

  //
  // /GetNumberOfCompanySharesOwnedByUser route method
  //
  app.get('/GetNumberOfCompanySharesOwnedByUser', async (req, res) => {
    var result, accessToken, userPrimaryKey

    res.set('Content-Type', 'text/html')

    if (!('accessToken' in req.cookies)) {
      res.status(401).send('No accessToken cookie')
      return
    } else {
      accessToken = req.cookies['accessToken']
    }
    
    try {
      result = await database_access.checkAccessTokenInUsersTable(accessToken)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/GetNumberOfCompanySharesOwnedByUser", 
        'checkAccessTokenInUsersTable() database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    if (result === null) {
      res.status(401).send('invalid access token')
      return
    }

    userPrimaryKey = result[0]

    try {
      result = await database_access.getNumberOfCompanySharesOwnedByUser(userPrimaryKey)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/GetNumberOfCompanySharesOwnedByUser", 
        'getNumberOfCompanySharesOwnedByUser() database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    res.send(String(result))
  })


  /* ******************************************************************************************
  Login webpage routes
  ******************************************************************************************* */

  //
  // /Login route method
  //
  app.post('/Login', async (req, res) => {
    var result
    var userEmailAddress, password
    var saltHashedInputPassword
    var emailAddressVerified, databaseSaltHashedPassword, databasePasswordSalt, admin
    var accessToken

    var accessTokenToCheck
    var accessTokenInDatabase

    userEmailAddress = req.body['emailAddress']
    password = req.body['password']

    res.set('Content-Type', 'text/html')

    try {
      result = await database_access.checkUserEmailAddressInDatabase(userEmailAddress)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/Login", 
        'checkUserEmailAddressInDatabase() database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    if (result === null) {
      res.status(400).send('invalid email address')
      return
    }

    emailAddressVerified = result[0]

    if (emailAddressVerified === false) {
      res.status(400).send('unverified email address')
      return
    }
    
    databaseSaltHashedPassword = result[1]
    databasePasswordSalt = result[2]
    admin = result[3]

    saltHashedInputPassword = 
      crypto.createHash('sha256').update(password+databasePasswordSalt).digest('hex');

    if (saltHashedInputPassword !== databaseSaltHashedPassword) {
      res.status(400).send('invalid password')
      return
    }

    try {
      do {
        accessTokenToCheck = crypto.randomUUID();
        accessTokenInDatabase = await database_access.checkAccessTokenInUsersTable(accessTokenToCheck);
      } while (accessTokenInDatabase !== null);	
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/Login", 
        'checkAccessTokenInUsersTable() database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    accessToken = accessTokenToCheck;

    try {
      await database_access.storeAccessTokenInUsersTable(userEmailAddress, accessToken)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/Login", 
        'storeAccessTokenInUsersTable() database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    try {
      if (secureServer) {
        res.cookie('accessToken', accessToken, { sameSite: 'None', secure: true })
        res.cookie('admin', admin, { sameSite: 'None', secure: true })
      } else {
        res.cookie('accessToken', accessToken)
        res.cookie('admin', admin)
      }
      //res.set('Set-Cookie', `accessToken=${accessToken}; admin=${admin}`);
      //res.set('Content-Type', 'text/plain')
    } catch(error) {
      debug("/Login cookie setting error:  " + JSON.stringify(error));
      res.status(500).end()
      return
    }

    try {
      res.send('success')
    } catch(error) {
      debug("/Login success status sending error:  " + JSON.stringify(error));
      return
    }
  })


  //
  // /Logout route method
  //
  app.delete('/Logout', async (req, res) => { 
    try {
      if (secureServer) {
        res.clearCookie('accessToken', { sameSite: 'None', secure: true })
        res.clearCookie('admin', { sameSite: 'None', secure: true })
      } else {
        res.clearCookie('accessToken')
        res.clearCookie('admin')
      }
      res.send('success')
    } catch(error) {
      debug(JSON.stringify(error));
      //res.status(500).send('error')
    }
  })

  /* ******************************************************************************************
  Buy checkout page routes
  ******************************************************************************************* */

  //
  // /Checkout route method
  //
  app.post('/Checkout', async (req, res) => {
    /* **************************************************************************************
    Input validation
    ************************************************************************************** */
    var result
    var numberOfSharesToBuy
    var result, accessToken
    var userPrimaryKey
    var databaseAdminStatus
    var totalOrderAmountInUsDollars
    var totalNumberOfSharesToBuy
    var totalPriceOfSharesToBuy
    var pricePerShare

    debug('/Checkout route method start.  ' + Date.now())

    //res.set('Cache-Control', 'no-store');

    res.set('Content-Type', 'text/html')

    if (!('numberOfSharesToBuy' in req.body)) {
      res.status(400).send('No number of shares to buy')
      return
    } else {
      debug(`/Checkout route method req.body['numberOfSharesToBuy']:  ${req.body['numberOfSharesToBuy']}.`)
      numberOfSharesToBuy = req.body['numberOfSharesToBuy']
      if (typeof numberOfSharesToBuy === 'string' || numberOfSharesToBuy instanceof String) {
        numberOfSharesToBuy = numberOfSharesToBuy.trim()
      }
      debug(`/Checkout route method numberOfSharesToBuy value:  ${numberOfSharesToBuy}.`)
    }

    numberOfSharesToBuy = parseInt(numberOfSharesToBuy, 10)
    if(isNaN(numberOfSharesToBuy) || numberOfSharesToBuy < '1') {
      res.status(400).render('Checkout_invalid-number-of-shares-to-buy')
      return
    }

    if (!('accessToken' in req.cookies)) {
      res.status(400).send('No accessToken cookie')
      return
    } else {
      accessToken = req.cookies['accessToken']
    }
    
    try {
      result = await database_access.checkAccessTokenInUsersTable(accessToken)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/Checkout", 
        'checkAccessTokenInUsersTable() database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    if (result === null) {
      res.status(400).send('invalid access token')
      return
    }

    userPrimaryKey = result[0]
    databaseAdminStatus = result[6]
    debug(`/Checkout route method databaseAdminStatus:  ${databaseAdminStatus}`)
    if (!('admin' in req.cookies) || databaseAdminStatus !== (req.cookies['admin'] === 'true' ? true : false)) {
      if (secureServer) {res.cookie('admin', databaseAdminStatus, { sameSite: 'None', secure: true });}
      else {res.cookie('admin', databaseAdminStatus);}
    }

    if (databaseAdminStatus) {
      debug(`/Checkout route method inside 'if (databaseAdminStatus)'.`)
      res.status(400).render("Checkout_no-admin-stock-purchase");
      return
    }

    /* **************************************************************************************
    "Number of Company shares available for purchase" update
    ************************************************************************************** */
    try {
      await database_access.removeAllApplicableEntriesInStockReservationTable(
        latestStockStatsTableEntryPrimaryKey, accessToken)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/Checkout", 
        'removeAllApplicableEntriesInStockReservationTable() database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    try {
      result = await database_access.getTotalNumberOfSharesInTimedOutUncompletedTransactions(
        latestStockStatsTableEntryPrimaryKey)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/Checkout", 
        'getTotalNumberOfSharesInTimedOutUncompletedTransactions() database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    if (result !== null) {
      orderProcessor.logAndEmailError("/Checkout", 
        'getTotalNumberOfSharesInTimedOutUncompletedTransactions() returned non-null value.  ' + result);    
    }

    try {
      result = await database_access.updateNumberOfAvailableSharesInStockStatsTableWithUncompletedTransactions(
        latestStockStatsTableEntryPrimaryKey)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/Checkout", 
        'updateNumberOfAvailableSharesInStockStatsTableWithUncompletedTransactions() database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }
    
    /* **************************************************************************************
    Stock reservation
    ************************************************************************************** */
    try {
      await database_access.reserveSharesToBuy(
        latestStockStatsTableEntryPrimaryKey, numberOfSharesToBuy, accessToken)
    } catch(error) {
      res.status(400).render('Checkout_not-enough-shares-for-purchase')
      return
    }

    // render checkout page with client id & unique client token
    // app.get("/", async (req, res) => { ... }); (This is the original PayPal route method signature.)
    const clientId = process.env.CLIENT_ID;
    totalOrderAmountInUsDollars = numberOfSharesToBuy * latestPricePerShare * transactionFeeMultiplier
    totalNumberOfSharesToBuy = numberOfSharesToBuy.toLocaleString()
    totalPriceOfSharesToBuy = totalOrderAmountInUsDollars.toLocaleString()
    pricePerShare = latestPricePerShare.toLocaleString()
    try {
      //debug('checkout page rendering start on backend.');
      const clientToken = await paypal.generateClientToken();

      res.render("checkout", { clientId, clientToken, totalNumberOfSharesToBuy, totalPriceOfSharesToBuy,
        pricePerShare, processingFeePercentage });
      debug(`/Checkout route method clientId:  ${clientId}.`)
      debug(`/Checkout route method clientToken:  ${clientToken}.`)
      //debug('checkout page rendering end on backend.');
    } catch (err) {	
      res.status(500).send(err.message);
      orderProcessor.logAndEmailError("/Checkout", err);
    }
  })

  //
  // /Checkout/:numberOfSharesToBuy route method
  //
  app.get('/Checkout/:numberOfSharesToBuy', async (req, res) => {
    /* **************************************************************************************
    Input validation
    ************************************************************************************** */
    var result
    var result, accessToken
    var userPrimaryKey
    var databaseAdminStatus
    var totalOrderAmountInUsDollars
    var totalNumberOfSharesToBuy
    var totalPriceOfSharesToBuy
    var pricePerShare

    debug('/Checkout/:numberOfSharesToBuy route method start.  ' + Date.now())

    //res.set('Cache-Control', 'no-store');

    res.set('Content-Type', 'text/html')

    const { numberOfSharesToBuy } = req.params;
    
    const numberOfSharesToBuyTrimmedString = numberOfSharesToBuy.trim()
    const numberOfSharesToBuyInt = parseInt(numberOfSharesToBuyTrimmedString, 10)

    if(isNaN(numberOfSharesToBuyInt) || numberOfSharesToBuyInt < '1') {
      res.status(400).render('Checkout_invalid-number-of-shares-to-buy')
      return
    }

    if (!('accessToken' in req.cookies)) {
      res.status(400).send('No accessToken cookie')
      return
    } else {
      accessToken = req.cookies['accessToken']
    }
    
    try {
      result = await database_access.checkAccessTokenInUsersTable(accessToken)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/Checkout", 
        'checkAccessTokenInUsersTable() database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    if (result === null) {
      res.status(400).send('invalid access token')
      return
    }

    userPrimaryKey = result[0]
    databaseAdminStatus = result[6]
    debug(`/Checkout/:numberOfSharesToBuy route method databaseAdminStatus:  ${databaseAdminStatus}`)
    if (!('admin' in req.cookies) || databaseAdminStatus !== (req.cookies['admin'] === 'true' ? true : false)) {
      if (secureServer) {res.cookie('admin', databaseAdminStatus, { sameSite: 'None', secure: true });}
      else {res.cookie('admin', databaseAdminStatus);}
    }

    if (databaseAdminStatus) {
      debug(`/Checkout/:numberOfSharesToBuy route method inside 'if (databaseAdminStatus)'.`)
      res.status(400).render("Checkout_no-admin-stock-purchase");
      return
    }

    /* **************************************************************************************
    "Number of Company shares available for purchase" update
    ************************************************************************************** */
    try {
      await database_access.removeAllApplicableEntriesInStockReservationTable(
        latestStockStatsTableEntryPrimaryKey, accessToken)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/Checkout", 
        'removeAllApplicableEntriesInStockReservationTable() database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    try {
      result = await database_access.getTotalNumberOfSharesInTimedOutUncompletedTransactions(
        latestStockStatsTableEntryPrimaryKey)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/Checkout", 
        'getTotalNumberOfSharesInTimedOutUncompletedTransactions() database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    if (result !== null) {
      orderProcessor.logAndEmailError("/Checkout", 
        'getTotalNumberOfSharesInTimedOutUncompletedTransactions() returned non-null value.  ' + result);    
    }

    try {
      result = await database_access.updateNumberOfAvailableSharesInStockStatsTableWithUncompletedTransactions(
        latestStockStatsTableEntryPrimaryKey)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/Checkout", 
        'updateNumberOfAvailableSharesInStockStatsTableWithUncompletedTransactions() database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }
    
    /* **************************************************************************************
    Stock reservation
    ************************************************************************************** */
    try {
      await database_access.reserveSharesToBuy(
        latestStockStatsTableEntryPrimaryKey, numberOfSharesToBuyInt, accessToken)
    } catch(error) {
      res.status(400).render('Checkout_not-enough-shares-for-purchase')
      return
    }

    // render checkout page with client id & unique client token
    // app.get("/", async (req, res) => { ... }); (This is the original PayPal route method signature.)
    const clientId = process.env.CLIENT_ID;
    totalOrderAmountInUsDollars = numberOfSharesToBuyInt * latestPricePerShare * transactionFeeMultiplier
    totalNumberOfSharesToBuy = numberOfSharesToBuyInt.toLocaleString()
    totalPriceOfSharesToBuy = totalOrderAmountInUsDollars.toLocaleString()
    pricePerShare = latestPricePerShare.toLocaleString()
    try {
      //debug('checkout page rendering start on backend.');
      const clientToken = await paypal.generateClientToken();

      res.render("checkout", { clientId, clientToken, totalNumberOfSharesToBuy, totalPriceOfSharesToBuy,
        pricePerShare, processingFeePercentage });
      debug(`/Checkout/:numberOfSharesToBuy route method clientId:  ${clientId}.`)
      debug(`/Checkout/:numberOfSharesToBuy route method clientToken:  ${clientToken}.`)
      //debug('checkout page rendering end on backend.');
    } catch (err) {	
      res.status(500).send(err.message);
      orderProcessor.logAndEmailError("/Checkout", err);
    }
  })

  //
  // /Checkout/api/orders route method
  //
  app.post('/Checkout/api/orders', async (req, res) => {
    /* **************************************************************************************
    Input validation
    ************************************************************************************** */
    var result, accessToken
    var databaseAdminStatus

    var userPrimaryKey
    var payPalTransactionOrderId
    var companyStockTransactionId
    var numberOfSharesToBuy
    var totalOrderAmountInUsDollars
    
    debug('/Checkout/api/orders route method start.')

    res.set('Content-Type', 'text/html')

    if (!('accessToken' in req.cookies)) {
      res.status(400).send('No accessToken cookie')
      return
    } else {
      accessToken = req.cookies['accessToken']
    }
    
    try {
      result = await database_access.checkAccessTokenInUsersTable(accessToken)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/Checkout/api/orders", 
        'checkAccessTokenInUsersTable() database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    if (result === null) {
      res.status(400).send('invalid access token')
      return
    }

    databaseAdminStatus = result[6];
    if (!('admin' in req.cookies) || databaseAdminStatus !== req.cookies['admin'] === 'true' ? true : false) {
      if (secureServer) {res.cookie('admin', databaseAdminStatus, { sameSite: 'None', secure: true });}
      else {res.cookie('admin', databaseAdminStatus);}
    }

    if (databaseAdminStatus) {
      res.status(400).render("Checkout_no-admin-stock-purchase");
      return
    }

    userPrimaryKey = result[0]

    /* **************************************************************************************
    Retrieve the stock reservation table entry with the reserving-user access token
    ************************************************************************************** */
    try {
      result = await database_access.checkStockReservationTableEntry(accessToken)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/Checkout/api/orders", 
        'checkStockReservationTableEntry() database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    if (result === null) {
      res.status(400).render('Checkout_api_orders_stock-reservation-table-entry-error')
      return   
    }

    if (result[4] <= Date.now()) {
      res.status(400).render('Checkout_api_orders_stock-reservation-expiration')
      return   
    }

    numberOfSharesToBuy = result[2]

    /* **************************************************************************************
    Create a PayPal order
    ************************************************************************************** */
    // create order
    // app.post("/api/orders", async (req, res) => { ... }); (This is the original PayPal route method signature.)
    try {
      //debug('order creation start on backend.');
      totalOrderAmountInUsDollars = numberOfSharesToBuy * latestPricePerShare * transactionFeeMultiplier    
      const order = await paypal.createOrder(totalOrderAmountInUsDollars);
      debug(`PayPal order:  ${JSON.stringify(order)}`)
      debug(`/Checkout/api/orders route method orderId:  ${order.id}.`)

      payPalTransactionOrderId = order.id
      companyStockTransactionId = payPalTransactionOrderId + '-' + Date.now()     

      await database_access.createTransactionInitiationEntry(userPrimaryKey, 
        latestStockStatsTableEntryPrimaryKey,
        payPalTransactionOrderId, companyStockTransactionId, numberOfSharesToBuy, accessToken)

      res.set('Content-Type', 'application/json')
      res.json(order);
      //debug('order creation end on backend.');
    } catch (err) {
      res.status(500).send(err.message);
      orderProcessor.logAndEmailError("/Checkout/api/orders", err);	
    }
  })

  //
  // /Checkout/api/orders/:orderID/capture route method
  //
  app.post('/Checkout/api/orders/:orderID/capture', async (req, res) => {
    /* **************************************************************************************
    Input validation
    ************************************************************************************** */
    var result, accessToken
    var databaseAdminStatus
    var userPrimaryKey

    debug('/Checkout/api/orders/:orderID/capture route method start.')

    res.set('Content-Type', 'text/html')

    if (!('accessToken' in req.cookies)) {
      res.status(400).send('No accessToken cookie')
      return
    } else {
      accessToken = req.cookies['accessToken']
    }
    
    try {
      result = await database_access.checkAccessTokenInUsersTable(accessToken)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/Checkout/api/orders", 
        'checkAccessTokenInUsersTable() database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    if (result === null) {
      res.status(400).send('invalid access token')
      return
    }

    databaseAdminStatus = result[6];
    if (!('admin' in req.cookies) || databaseAdminStatus !== req.cookies['admin'] === 'true' ? true : false) {
      if (secureServer) {res.cookie('admin', databaseAdminStatus, { sameSite: 'None', secure: true });}
      else {res.cookie('admin', databaseAdminStatus);}
    }

    if (databaseAdminStatus) {
      res.status(400).render("Checkout_no-admin-stock-purchase");
      return
    }

    userPrimaryKey = result[0]

    /* **************************************************************************************
    Capture payment
    ************************************************************************************** */
    const { orderID } = req.params;
    try {
      //debug('Payment capture start on backend.');
      const captureData = await paypal.capturePayment(orderID);

      const paymentType = Object.keys(captureData.payment_source)[0];
      const transaction = captureData.purchase_units[0].payments.captures[0];
      const paymentSource = captureData.payment_source;

      /*
      Future update
      Instead of getting paymentType and paymentSource from the client when generating the receipt page,
      save them in the database here, and use the database-stored data in the receipt page.

      Also, instead of logging error to a file, log errors to a separate database on a separate server,
      to enable scaling error logging.  When traffic volume is high, writing every error
      to a file isn't a good solution, when there are thousands or more transactions per second.
      */

      debug(`/Checkout/api/orders/:orderID/capture transaction.status:  ${transaction.status}`);

      if (transaction.status == 'COMPLETED') {
        orderProcessor.savePaymentRecordInFile(captureData, orderID, transaction, paymentType, paymentSource);

        try {
          await database_access.updateTransactionsTableEntryForTransactionPaymentSuccess(
            orderID, latestStockStatsTableEntryPrimaryKey)
            //What to do, if this errors, for something other than SQL_CONSTRAINT?
            //ANSWER:  Return an appropriate HTML page with a support email address,
            //PayPal order ID, PayPal transaction ID, paymentType, paymentSource,
            //and log and email the error to admin.
            //Requesting transaction cancellation and refund to PayPal here is an option,
            //but I don't think that is a good option; 
            //a human work process with a web UI for handling this case, is also
            //an option.  Automating to the maximum extent is the best option;
            //so, a separate database for logging and handling this main database
            //failure case should be implemented.
            //Note that if the user cancels payment after successful transaction,
            //that must be handled properly as well, preferably in a fully
            //automated fashion by getting API or hook notice from PayPal.
            //For now, since this is a demo, I'll implement the minimal error handling
            //of logging and emailing the error to admin.
        } catch (error) {
          res.status(500).send('Successful payment, but failure to record in database.  You may have already made successful payment for this order, or a database access error occurred.  Please contact us for support.');
          orderProcessor.logAndEmailError(`/Checkout/api/orders/:orderID/capture, updateTransactionsTableEntryForTransactionPaymentSuccess() error, PayPal order ID:  ${orderID}, PayPal transaction ID:  ${transaction.id}`, error);
          return
        }

        orderProcessor.logAndEmailPaymentCapture("/Checkout/api/orders/:orderID/capture COMPLETED", captureData);
      } else {
        //database_access.updateTransactionsTableEntryForTransactionPaymentFailure()
          //what to do, if this errors? ANSWER:  Log and email the error to admin.
          //Wait, wait.  Is calling this function needed at all?  Think about it.  The user can make another payment attempt.
          //I don't think calling this is required.
    
        orderProcessor.logAndEmailPaymentCapture("/Checkout/api/orders/:orderID/capture INCOMPLETE.  Payment decline.  Payment not completed.", captureData);
      }

      res.set('Content-Type', 'application/json')
      res.json(captureData);
      //debug('Payment capture end on backend.');
    } catch (err) {
      res.status(500).send(err.message);
      orderProcessor.logAndEmailError("/Checkout/api/orders/:orderID/capture", err.message);	

      debug(`/Checkout/api/orders/:orderID/capture typeof error:  ${typeof err}`);
      debug(`/Checkout/api/orders/:orderID/capture Error in error:  ${'Error' in err}`);
      debug(`/Checkout/api/orders/:orderID/capture err['Error']:  ${err['Error']}`);
      debug(`/Checkout/api/orders/:orderID/capture error:  ${err}`);
      debug('/Checkout/api/orders/:orderID/capture error (string concat):  ' + err);
      debug(`/Checkout/api/orders/:orderID/capture error:  ${JSON.stringify(err)}`);
      debug(`/Checkout/api/orders/:orderID/capture error type:  ${JSON.stringify(err.type)}`);
      debug(`/Checkout/api/orders/:orderID/capture error message:  ${JSON.stringify(err.message)}`);

      //database_access.updateTransactionsTableEntryForTransactionPaymentFailure()
        //what to do, if this errors? ANSWER:  Email the admin.
        //Wait, wait.  Is calling this function needed at all?  Think about it.  The user can make another payment attempt.
        //I don't think calling this is required.
    }
  })


  //
  // /Receipt route method
  //
  app.get('/Receipt/:orderID', async (req, res) => {
    var result, accessToken

    var accessTokenUserPrimaryKey
    var userFirstName
    var userLastName
    var userEmailAddress
    var userPhoneNumber

    var transactionUserPrimaryKey
    var stockStatsTableEntryPrimaryKey
    var transactionStartDatetime
    var companyStockTransactionId
    var numberOfShares
    var paymentProcessingCompleted

    var dateTime
    var currentValuation
    var numberOfAuthorizedShares
    var totalNumberOfSharesBought
    var percentageOfAuthorizedShares
    var totalPriceOfSharesBought
    var paypalTransactionId
    var companyTransactionId
    var paymentType
    var paymentSource
    var fullName
    var emailAddress
    var phoneNumber

    const { orderID } = req.params;

    res.set('Content-Type', 'text/html')

    if (!('accessToken' in req.cookies)) {
      res.status(400).send('No accessToken cookie')
      return
    } else {
      accessToken = req.cookies['accessToken']
    }
    
    try {
      result = await database_access.checkAccessTokenInUsersTable(accessToken)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/Receipt/:orderID checkAccessTokenInUsersTable()", 
        'database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    if (result === null) {
      res.status(400).send('Invalid access token')
      return
    }

    accessTokenUserPrimaryKey = result[0]
    userFirstName = result[1]
    userLastName = result[2]
    userEmailAddress = result[3]
    userPhoneNumber = result[5]


    try {
      result = await database_access.getTransactionRecord(orderID)

      if (result === null) {
        res.status(400).render("Receipt_no_transaction_record_error")
        return
      }
    } catch (err) {
      res.status(500).send(err.message);
      orderProcessor.logAndEmailError("/Receipt/:orderID getTransactionRecord()", err);
      return;
    }

    transactionUserPrimaryKey = result[1]
    stockStatsTableEntryPrimaryKey = result[2]
    transactionStartDatetime = result[3]
    companyStockTransactionId = result[6]
    numberOfShares = result[7]
    paymentProcessingCompleted = result[9]

    if(accessTokenUserPrimaryKey !== transactionUserPrimaryKey) {
      res.status(400).send('unauthorized request')
      return
    }

    if(!paymentProcessingCompleted) {
      res.status(400).send('incomplete transaction')
      return
    }

    /*
    Future update
    Instead of using database_access.getLatestCompanyStockData(),
    create database_access.getCompanyStockData(stockStatsTableEntryPrimaryKey), and use it here.
    */

    var date = new Date(transactionStartDatetime);

    dateTime = date.toLocaleDateString("en-US") + ' ' + date.toLocaleTimeString("en-US")
    currentValuation = latestCurrentValuation.toLocaleString()
    numberOfAuthorizedShares = latestNumberOfAuthorizedShares.toLocaleString()
    totalNumberOfSharesBought = numberOfShares.toLocaleString()
    percentageOfAuthorizedShares = Number(numberOfShares) / Number(latestNumberOfAuthorizedShares) * 100.0
    totalPriceOfSharesBought = (Number(numberOfShares) * Number(latestPricePerShare)).toLocaleString()
    paypalTransactionId = orderID
    companyTransactionId = companyStockTransactionId
    paymentType = ''
    paymentSource = ''
    fullName = userFirstName + ' ' + userLastName
    emailAddress = userEmailAddress
    phoneNumber = userPhoneNumber

    try {
      // if a callback is specified, the rendered HTML string has to be sent explicitly
      //https://expressjs.com/en/4x/api.html#res.render
      res.render("Receipt", { dateTime, currentValuation, numberOfAuthorizedShares, totalNumberOfSharesBought, percentageOfAuthorizedShares, totalPriceOfSharesBought, paypalTransactionId, companyTransactionId, paymentType, paymentSource, fullName, emailAddress, phoneNumber }, function (err, html) {
        debug(`/Receipt/:orderID res.render("Receipt") callback err:  ${err}`)
        if (err === null) {
          res.send(html)
          orderProcessor.emailReceiptToUser(emailAddress, html, html)
          orderProcessor.savePaymentReceiptInFile(orderID, html)
        }
      });
    } catch (err) {
      res.status(500).send(err.message);
      orderProcessor.logAndEmailError('/Receipt/:orderID res.render("Receipt")', err);
      return;
    }
  })


  /* ******************************************************************************************
  User registration webpage routes
  ******************************************************************************************* */

  //
  // /CheckEmailAddress route method
  //
  app.get('/CheckEmailAddress', async (req, res) => {
    var result, userEmailAddress

    userEmailAddress = req.body['emailAddress']

    if (!validateEmail(userEmailAddress)) {
      res.status(400).send('invalid email address format')
      return
    }

    debug('/CheckEmailAddress before checkUserEmailAddressInDatabase() call.')

    try {
      result = await database_access.checkUserEmailAddressInDatabase(userEmailAddress)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/CheckEmailAddress", 
        "checkUserEmailAddressInDatabase() database access error.\n" + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    debug('/CheckEmailAddress after checkUserEmailAddressInDatabase() call.')

    if (result === null) {
      res.send('available for registration')
      return
    }

    if (result[0]) {
      res.send('already registered')
    } else {
      res.send('waiting verification')
    }
  })

  //
  // /RegisterUser route method
  //
  app.post('/RegisterUser', async (req, res) => {
    var result

    try {
      var firstName = req.body['firstName'].trim()
      var lastName = req.body['lastName'].trim()
      var emailAddress = req.body['emailAddress'].trim()
      var phoneNumber = req.body['phoneNumber'].trim()
      var password = req.body['password'].trim()
    } catch(error1) {
      try {
        res.status(400).send('Invalid input');
      } catch(error2) {
        debug(`/RegisterUser invalid input error1:  ${error1}`)
        debug(`/RegisterUser invalid input error2:  ${error2}`)
      }
      return
    }

    res.set('Content-Type', 'text/html')

    if( firstName === '' || lastName === '' || emailAddress === '' || 
      phoneNumber === '' || password === '') {
      res.status(400).send('blank input')
      return
    }

    if (!validateEmail(emailAddress)) {
      res.status(400).send('invalid email address format')
      return
    }    

    if (!checkPasswordFormat(password)) {
      res.status(400).send('invalid password format')
      return
    }  

    try {
      result = await database_access.checkUserEmailAddressInDatabase(emailAddress)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/RegisterUser", 
        "checkUserEmailAddressInDatabase() database access error.\n" + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    if (result !== null) {
      res.status(400).send('unavailable email address')
      return
    }

    try {
      result = await database_access.addUserEntryInUsersTable(firstName, lastName, emailAddress, 
        phoneNumber, password)
      res.send(result)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/RegisterUser addUserEntryInUsersTable() error", 
        'database access error\n' + JSON.stringify(error));
      res.status(500).send('database access error')
      //TO DO need to separate database error and res.send() error.
    }
  })

  //
  // /SendEmailAddressVerificationEmail/:accessToken/:emailAddress route method
  //
  app.get('/SendEmailAddressVerificationEmail/:accessToken/:emailAddress', async (req, res) => {
    var result
    var userAccessToken
    var userEmailAddress
    var emailAddressVerified

    /*
    TO IMPLEMENT
    cybersecurity measure

    Allow sending an email verification email to an email address only three times per hour.
    Limit an IP address to request sending an email verification emails only six times per hour.
    */

    const { accessToken, emailAddress } = req.params;

    if (accessToken !== 'null') {
      userAccessToken = accessToken;

      try {
        result = await database_access.checkAccessTokenInUsersTable(accessToken)
      } catch(error) {
        //Send an email to the server admin using AWS SES.
        orderProcessor.logAndEmailError("/SendEmailAddressVerificationEmail checkAccessTokenInUsersTable()", 
          'database access error\n' + JSON.stringify(error));
  
        res.status(500).send('database access error')
        return
      }
  
      if (result === null) {
        res.status(400).send('invalid access token')
        return
      }
  
      userEmailAddress = result[3]      
    } else {
      if (emailAddress !== 'null') {
        userEmailAddress = emailAddress

        try {
          result = await database_access.checkUserEmailAddressInDatabase(userEmailAddress)
        } catch(error) {
          //Send an email to the server admin using AWS SES.
          orderProcessor.logAndEmailError("/SendEmailAddressVerificationEmail", 
            'checkUserEmailAddressInDatabase() database access error\n' + JSON.stringify(error));
    
          res.status(500).send('database access error')
          return
        }
    
        if (result === null) {
          res.status(400).send('invalid email address')
          return
        }
    
        emailAddressVerified = result[0]
    
        if (emailAddressVerified === true) {
          res.status(400).send('verified email address')
          return
        }

        userAccessToken = result[4]
      } else {
        res.status(400).send('email address required')
        return
      }
    }
 
    try {
      result = await orderProcessor.sendEmailAddressVerificationEmail(userEmailAddress, userAccessToken)
      res.send('success')
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/SendEmailAddressVerificationEmail sendEmailAddressVerificationEmail()", 
        "emailing error\n" + JSON.stringify(error));

      res.status(500).send('emailing error')
    }
  })

  //
  // /GetEmailAddressVerificationSuccessPage route method
  //
  app.get('/GetEmailAddressVerificationSuccessPage/:accessToken', async (req, res) => {
    var result
    var accessToken = req.params.accessToken

    try {
      result = await database_access.checkAccessTokenInUsersTable(accessToken)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/GetEmailAddressVerificationSuccessPage checkAccessTokenInUsersTable()", 
        'database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    if (result === null) {
      res.status(400).send('invalid access token')
      return
    }

    var emailAddress = result[3]

    try {
      await database_access.setEmailAddressVerifiedInUsersTable(accessToken)
      res.render("GetEmailAddressVerificationSuccessPage_success_notification", { emailAddress })
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/GetEmailAddressVerificationSuccessPage setEmailAddressVerifiedInUsersTable()", 
        "emailing error\n" + JSON.stringify(error));

      res.status(500).send('database access error')
    }
  })

  //
  // /SendResetPasswordEmail route method
  //
  app.get('/SendResetPasswordEmail/:emailAddress', async (req, res) => {
    var result
    const { emailAddress } = req.params;
    var userEmailAddress = emailAddress

    if (!validateEmail(userEmailAddress)) {
      res.status(400).send('invalid email address format')
      return
    }

    try {
      result = await database_access.checkUserEmailAddressInDatabase(userEmailAddress)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/SendResetPasswordEmail", 
        'checkUserEmailAddressInDatabase() database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    if (result === null) {
      res.status(400).send('invalid email address')
      return
    }

    if (!result[0]) {
      res.status(400).send('unverified email address')
      return
    }
    
    try {
      var accessToken = await database_access.assignNewAccessToken(userEmailAddress)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/SendResetPasswordEmail", 
        'assignNewAccessToken() database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    try {
      await orderProcessor.sendResetPasswordEmail(userEmailAddress, accessToken)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/SendEmailAddressVerificationEmail sendResetPasswordEmail()", 
        'emailing error\n' + JSON.stringify(error));

      res.status(500).send('emailing error')
      return
    }

    try {
      res.render('ResetPassword_check-your-email-for-password-reset', {emailAddress})
      return
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/SendEmailAddressVerificationEmail success notification", 
        'response error\n' + JSON.stringify(error));
    }
  })

  //
  // /ResetPassword route method
  //
  app.post('/ResetPassword', async (req, res) => {
    var result

    var accessToken = req.body['accessToken']

    try {
      result = await database_access.checkAccessTokenInUsersTable(accessToken)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/ResetPassword checkAccessTokenInUsersTable()", 
        'database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    if (result === null) {
      res.status(400).render('invalid_access_token_error')
      return
    }

    var emailAddress = result[3]

    var password = req.body['password']

    if (!checkPasswordFormat(password)) {
      res.status(400).send('invalid password format')
      return
    }  

    try {
      await database_access.updatePasswordInUsersTable(accessToken, password)
      res.render('ResetPassword_password-reset-success-notification', {emailAddress})
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/ResetPassword updatePasswordInUsersTable()", 
        'database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }
  })


  /* ******************************************************************************************
  User Account Webpage routes
  ******************************************************************************************* */

  //
  // /GetUserAccountSettings route method
  //
  app.get('/GetUserAccountSettings', async (req, res) => {
    var result, accessToken

    res.set('Content-Type', 'text/html')

    if (!('accessToken' in req.cookies)) {
      res.status(400).send('No accessToken cookie')
      return
    } else {
      accessToken = req.cookies['accessToken']
    }

    try {
      result = await database_access.checkAccessTokenInUsersTable(accessToken)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/GetUserAccountSettings checkAccessTokenInUsersTable()", 
        'database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    if (result === null) {
      res.status(400).send('invalid access token')
      return
    }

    var userFirstName = result[1]
    var userLastName = result[2]
    var userEmailAddress = result[3]
    var userPhoneNumber = result[5]

    res.set('Content-Type', 'application/json')
    res.json({ 'userFirstName': userFirstName, 'userLastName': userLastName, 'userEmailAddress': userEmailAddress, 'userPhoneNumber': userPhoneNumber })
  })

  //
  // /UpdateUserAccountSettings route method
  //
  app.post('/UpdateUserAccountSettings', async (req, res) => {
    var result, accessToken

    res.set('Content-Type', 'text/html')

    if (!('accessToken' in req.cookies)) {
      res.status(400).send('No accessToken cookie')
      return
    } else {
      accessToken = req.cookies['accessToken']
    }

    try {
      result = await database_access.checkAccessTokenInUsersTable(accessToken)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/UpdateUserAccountSettings checkAccessTokenInUsersTable()", 
        'database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    if (result === null) {
      res.status(400).send('invalid access token')
      return
    }

    var userFirstName = req.body['firstName']
    var userLastName = req.body['lastName']
    var userEmailAddress = req.body['emailAddress']
    var userPhoneNumber = req.body['phoneNumber']
    var userPassword = req.body['password']

    if (userFirstName == '' && userLastName == '' && userEmailAddress == '' &&
    userPhoneNumber == '' && userPassword == '' ) {
      res.status(400).send('all inputs are empty')
      return
    }

    if (userEmailAddress !== '' && !validateEmail(userEmailAddress)) {
      res.status(400).send('invalid email address format')
      return
    }

    if (userPassword !== '' && !checkPasswordFormat(userPassword)) {
      res.status(400).send('invalid password format')
      return
    }

    try {
      await database_access.updateUserAccountSettings(accessToken, 
        userFirstName, userLastName, userEmailAddress, userPhoneNumber, userPassword)
      res.send('success')
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/UpdateUserAccountSettings updateUserAccountSettings()", 
        'database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
    }
  })

  //
  // /GetNumberOfUserStockTransactions route method
  //
  app.get('/GetNumberOfUserStockTransactions', async (req, res) => {
    var result, accessToken

    res.set('Content-Type', 'text/html')

    if (!('accessToken' in req.cookies)) {
      res.status(400).send('No accessToken cookie')
      return
    } else {
      accessToken = req.cookies['accessToken']
    }

    try {
      result = await database_access.checkAccessTokenInUsersTable(accessToken)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/GetNumberOfUserStockTransactions checkAccessTokenInUsersTable()", 
        'database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    if (result === null) {
      res.status(400).send('invalid access token')
      return
    }

    var userPrimaryKey = result[0]
    var admin = result[6]

    if (admin) {
      res.status(400).send('invalid user')
      return
    }

    try {
      result = await database_access.getNumberOfUserStockTransactions(userPrimaryKey)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/GetNumberOfUserStockTransactions getNumberOfUserStockTransactions()", 
        'database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    try {
      debug(`GetNumberOfUserStockTransactions res.status:  ${res.statusCode}.`)
      debug(`GetNumberOfUserStockTransactions result:  ${result}.`)
      res.send(result.toString());
      return
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/GetNumberOfUserStockTransactions res.send(result)", 
        'successful result send error\n' + JSON.stringify(error));

      res.status(500).send('successful result send error')
      return
    }
  })

  //
  // /GetUserStockTransactionHistory route method
  //
  app.get('/GetUserStockTransactionHistory/:pageNumber', async (req, res) => {
    var result, accessToken

    const { pageNumber } = req.params;

    res.set('Content-Type', 'text/html')

    if (!('accessToken' in req.cookies)) {
      res.status(400).send('No accessToken cookie')
      return
    } else {
      accessToken = req.cookies['accessToken']
    }

    try {
      result = await database_access.checkAccessTokenInUsersTable(accessToken)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/GetUserStockTransactionHistory checkAccessTokenInUsersTable()", 
        'database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    if (result === null) {
      res.status(400).send('invalid access token')
      return
    }

    var userPrimaryKey = result[0]  

    try {
      result = await database_access.getUserStockTransactionHistoryPageContents(
        userPrimaryKey, pageNumber)
        res.set('Content-Type', 'application/json')
        res.json(result)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/GetUserStockTransactionHistory getUserStockTransactionHistoryPageContents()", 
        'database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }
  })


  /* ******************************************************************************************
  Admin Webpage routes
  ******************************************************************************************* */

  //
  // /GetTotalNumberOfUsers route method
  //
  app.get('/GetTotalNumberOfUsers', async (req, res) => {
    var result, accessToken

    res.set('Content-Type', 'text/html')

    if (!('accessToken' in req.cookies)) {
      res.status(400).send('No accessToken cookie')
      return
    } else {
      accessToken = req.cookies['accessToken']
    }

    try {
      result = await database_access.checkAccessTokenInUsersTable(accessToken)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/GetTotalNumberOfUsers checkAccessTokenInUsersTable()", 
        'database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    if (result === null) {
      res.status(400).send('invalid access token')
      return
    }

    var admin = result[6]

    if (!admin) {
      res.status(400).send('invalid user')
      return
    }

    try {
      result = await database_access.getTotalNumberOfUsers()
      res.send(result.toString())
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/GetTotalNumberOfUsers getTotalNumberOfUsers()", 
        'database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }
  })

  //
  // /GetUserList route method
  //
  app.get('/GetUserList/:pageNumber', async (req, res) => {
    var result, accessToken

    const { pageNumber } = req.params;

    res.set('Content-Type', 'text/html')

    if (!('accessToken' in req.cookies)) {
      res.status(400).send('No accessToken cookie')
      return
    } else {
      accessToken = req.cookies['accessToken']
    }

    try {
      result = await database_access.checkAccessTokenInUsersTable(accessToken)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/GetUserList checkAccessTokenInUsersTable()", 
        'database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    if (result === null) {
      res.status(400).send('invalid access token')
      return
    }

    var admin = result[6]
    debug(`/GetUserList route method admin status:  ${admin}.`)
    if (!admin) {
      res.status(400).send('access prohibited')
      return
    }

    try {
      result = await database_access.getUserListPageContents(pageNumber)
      res.set('Content-Type', 'application/json')
      res.json(result)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/GetUserList getUserListPageContents()", 
        'database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }
  })

  //
  // /GetTotalNumberOfTransactions route method
  //
  app.get('/GetTotalNumberOfTransactions', async (req, res) => {
    var result, accessToken

    res.set('Content-Type', 'text/html')

    if (!('accessToken' in req.cookies)) {
      res.status(400).send('No accessToken cookie')
      return
    } else {
      accessToken = req.cookies['accessToken']
    }

    try {
      result = await database_access.checkAccessTokenInUsersTable(accessToken)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/GetTotalNumberOfTransactions checkAccessTokenInUsersTable()", 
        'database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    if (result === null) {
      res.status(400).send('invalid access token')
      return
    }

    var admin = result[6]

    if (!admin) {
      res.status(400).send('invalid user')
      return
    }

    try {
      result = await database_access.getTotalNumberOfTransactions()
      res.send(result.toString())
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/GetTotalNumberOfTransactions getTotalNumberOfTransactions()", 
        'database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }
  })

  //
  // /GetTransactionHistory route method
  //
  app.get('/GetTransactionHistory/:pageNumber', async (req, res) => {
    var result, accessToken

    const { pageNumber } = req.params;

    res.set('Content-Type', 'text/html')

    if (!('accessToken' in req.cookies)) {
      res.status(400).send('No accessToken cookie')
      return
    } else {
      accessToken = req.cookies['accessToken']
    }

    try {
      result = await database_access.checkAccessTokenInUsersTable(accessToken)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/GetUserList checkAccessTokenInUsersTable()", 
        'database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }

    if (result === null) {
      res.status(400).send('invalid access token')
      return
    }

    var admin = result[6]
    if (!admin) {
      res.status(400).send('access prohibited')
      return
    }

    try {
      result = await database_access.getStockTransactionHistoryPageContents(pageNumber)
      res.set('Content-Type', 'application/json')
      res.json(result)
    } catch(error) {
      //Send an email to the server admin using AWS SES.
      orderProcessor.logAndEmailError("/GetUserList getUserListPageContents()", 
        'database access error\n' + JSON.stringify(error));

      res.status(500).send('database access error')
      return
    }
  })


  /* ******************************************************************************************
  Server start code
  ******************************************************************************************* */
  var databaseOperationResult;

  database_access.openDatabase()

  try {
    databaseOperationResult = await database_access.getLatestCompanyStockData()
  } catch(error) {
    console.error(`getLatestCompanyStockData() error:  ${JSON.stringify(error)}`)
    return
  }

  if (databaseOperationResult !== null) {
    latestStockStatsTableEntryPrimaryKey = databaseOperationResult[0]
    latestCurrentValuation = databaseOperationResult[1]
    latestNumberOfAuthorizedShares = databaseOperationResult[2]
    latestPricePerShare = databaseOperationResult[6]

    await orderProcessor.loadAwsConfig();

    //TO TRY
    //Try running Express.js on Node.js process cluster for work distribution.
    //https://nodejs.org/docs/latest/api/cluster.html

    try {
      if (secureServer) {
        var privateKey = fs.readFileSync( privateKeyFilePath );
        var certificate = fs.readFileSync( certificateFilePath );

        server = https.createServer({
            key: privateKey,
            cert: certificate
        }, app).listen(8888);
        console.log('HTTPS server started.')
      } else {
        server = app.listen(8888);
        console.log('HTTP server started.')
      }
    } catch (error) {
      console.error(`app.listen() error:  ${error}`)
      database_access.closeDatabase()
      return
    }

    serverRunning = true

    //Add the graceful shutdown code.
    process.on('SIGTERM', () => {
      debug('SIGTERM signal received: closing HTTP server')
      server.close(() => {
        database_access.closeDatabase()
        serverRunning = false        
        debug('HTTP server closed')
      })
    })
  } else {
    console.error('getLatestCompanyStockData() returned null.  Not starting the server.')
    database_access.closeDatabase()
  }
}

export async function closeServer() {
  await server.close(() => {
    database_access.closeDatabase()
    serverRunning = false    
    console.log('HTTP server closed')
  })
}

if (process.argv.length > 2) {
  console.log(`More than two arguments in process.argv.  process.argv[2]:  ${process.argv[2]}.  Server start condition met.`)
  secureServer = process.argv[2] === 'true' ? true : false

  if (process.argv.length > 3) {
    corsServer = process.argv[3] === 'true' ? true : false
    console.log(`corsServer:  ${corsServer}.`)
  }

  runServer()
}
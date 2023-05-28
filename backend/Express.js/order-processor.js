import "dotenv/config";

import * as fs_promises from 'fs/promises';
import * as path from 'path';

import { fileURLToPath } from 'url';
//import { dirname } from 'path';

import crypto from "crypto";

//import AWS from 'aws-sdk'
import { S3Client } from "@aws-sdk/client-s3";
import { SESClient } from "@aws-sdk/client-ses";
import * as aws_access from "./aws-access.js";

//import awsConfig from './aws_config.json' assert { type: "json" }; //experimental feature

import debugFactory from 'debug';
const debug = debugFactory('order-processor');

const awsConfigFileFullName = "aws_config.json";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const senderEmailAddress = process.env.ALLEN_YOUNG_STOCKMARKET_SENDER_EMAIL_ADDRESS;
const webAdminEmailAddress = process.env.ALLEN_YOUNG_STOCKMARKET_WEB_ADMIN_EMAIL_ADDRESS;

const websiteHomeUrl = process.env.ALLEN_YOUNG_STOCKMARKET_WEBSITE_HOME_URL;
const backendApiBaseUrl = process.env.ALLEN_YOUNG_STOCKMARKET_BACKEND_API_BASE_URL;


var aws_s3_client;
var aws_ses_client;

export async function loadAwsConfig() {
	let awsConfigFileFullPath = path.join(__dirname, awsConfigFileFullName);
	//debug(awsConfigFileFullPath);
	
	const awsConfig = await fs_promises.readFile(awsConfigFileFullPath).then(json => JSON.parse(json)).catch(() => null);
	//debug(awsConfig);
	
	aws_s3_client = new S3Client({ region: awsConfig.region, credentials: {accessKeyId: awsConfig.accessKeyId, secretAccessKey: awsConfig.secretAccessKey }});
	aws_ses_client = new SESClient({ region: awsConfig.region, credentials: {accessKeyId: awsConfig.accessKeyId, secretAccessKey: awsConfig.secretAccessKey }});
}

export async function savePaymentRecordInFile(captureData, orderId, transaction, paymentType, paymentSource) {

	const transactionId = transaction.id;
	const transactionStatus = transaction.status;

	const filenameSafeOrderId = orderId.replace(/[^a-z0-9]/gi, '_');
	const filenameSafetransactionId = transactionId.replace(/[^a-z0-9]/gi, '_');	
	
	const orderDateTime = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })
		+ " (America/Chicago)";
		
	var paymentRecordFileContent = "orderDateTime: " + orderDateTime + "\n\n"
		+ "orderId: " + orderId + "\n\n"
		+ "transactionId: " + transactionId + "\n"
		+ "transactionStatus: " + transactionStatus + "\n\n"
		+ "paymentType: " + paymentType + "\n"
		+ "paymentSource: " + JSON.stringify(paymentSource) + "\n\n"
		
	if (paymentType == 'paypal') {
		var emailAddress = paymentSource['paypal']['email_address'];
		const accountId = paymentSource['paypal']['account_id'];
		const givenName = paymentSource['paypal']['name']['given_name'];
		const Surname = paymentSource['paypal']['name']['surname'];
				
		paymentRecordFileContent += "PayPal emailAddress: " + emailAddress + "\n"
			+ "PayPal accountId: " + accountId + "\n"
			+ "PayPal givenName: " + givenName + "\n"
			+ "PayPal Surname: " + Surname + "\n\n"
	} else if (paymentType == 'card') {
		const cardLastDigits = paymentSource['card']['last_digits'];
		const cardBrand = paymentSource['card']['brand'];
		const cardType = paymentSource['card']['type'];
				
		paymentRecordFileContent += "cardLastDigits: " + cardLastDigits + "\n"
			+ "cardBrand: " + cardBrand + "\n"
			+ "cardType: " + cardType + "\n\n"
	} else {
		//debug('Not PayPal, not card!');
	}	

	paymentRecordFileContent += "transaction" + "\n"
		+ "-----------" + "\n"
		+ JSON.stringify(transaction) + "\n\n"

		paymentRecordFileContent += "captureData" + "\n"
		+ "-----------" + "\n"
		+ JSON.stringify(captureData) + "\n\n"

	var paymentRecordFileFullName = filenameSafeOrderId + '_' +
		filenameSafetransactionId + '_archive.html';
	var paymentRecordFileFullPath = path.join(__dirname, paymentRecordFileFullName);
	//debug(paymentRecordFileFullPath);	
			
	try {
		fs_promises.writeFile(paymentRecordFileFullPath, paymentRecordFileContent);
		
		//asynchronously upload the payment-record HTML page file to AWS S3.
		aws_access.uploadFileToAwsS3(aws_s3_client, paymentRecordFileContent, 
			paymentRecordFileFullName);
		
		emailPaymentRecord(paymentRecordFileContent, paymentRecordFileContent);
	} catch (err) {
		debug(err);
		logAndEmailError('savePaymentRecordInFile() payment record file write error', err);
	}
}

export async function emailPaymentRecord(htmlEmailContent, textEmailContent) {
	var emailSubject = "Allen Young's Stockmarket Demo payment record";
	aws_access.sendEmail(aws_ses_client, senderEmailAddress, webAdminEmailAddress, emailSubject, 
		htmlEmailContent, textEmailContent);	
}

export async function savePaymentReceiptInFile(paypalOrderId, receiptHtml) {

	const filenameSafeOrderId = paypalOrderId.replace(/[^a-z0-9]/gi, '_');
	
	const orderDateTime = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })
		+ " (America/Chicago)";
		
	var paymentReceiptFileFullName = filenameSafeOrderId + '_' +
		String(Date.now()) + crypto.randomUUID() + '_receipt.html';
	var paymentReceiptFileFullPath = path.join(__dirname, paymentReceiptFileFullName);
	//debug(paymentReceiptFileFullPath);	
			
	try {
		fs_promises.writeFile(paymentReceiptFileFullPath, receiptHtml);
		
		//asynchronously upload the payment-receipt HTML page file to AWS S3.
		aws_access.uploadFileToAwsS3(aws_s3_client, receiptHtml, 
			paymentReceiptFileFullName);
		
		emailReceiptToAdmin(receiptHtml, receiptHtml);
	} catch (err) {
		debug(err);
		logAndEmailError('savePaymentReceiptInFile() payment record file write error', err);
	}
}

export async function emailReceiptToAdmin(htmlEmailContent, textEmailContent) {
	var emailSubject = "Allen Young's Stockmarket Demo payment receipt";
	aws_access.sendEmail(aws_ses_client, senderEmailAddress, webAdminEmailAddress, emailSubject, 
		htmlEmailContent, textEmailContent);	
}

export async function emailReceiptToUser(userEmailAddress, htmlEmailContent, textEmailContent) {
	var emailSubject = "Allen Young's Stockmarket Demo payment receipt";
	aws_access.sendEmail(aws_ses_client, senderEmailAddress, userEmailAddress, emailSubject, 
		htmlEmailContent, textEmailContent);	
}

export async function logAndEmailError(errApiName, err) {
	//debug('logAndEmailError() started');
	
	let errorDateTime = new Date();
		
	var errorLogFileFullName = 'error_log_' + 
		errorDateTime.getFullYear() + (errorDateTime.getMonth()+1) + errorDateTime.getDate() + "_" +
		errorDateTime.getHours() + errorDateTime.getMinutes() + errorDateTime.getSeconds() + "_" +
		Date.now().toString(36) + Math.random().toString(36).substr(2) + '.txt';
	var errorLogFileFullPath = path.join(__dirname, errorLogFileFullName);	
	
	var errorLogFileContent = errApiName + '\n' + `${err}`;
	
	try {
		fs_promises.writeFile(errorLogFileFullPath, errorLogFileContent);
		
		//asynchronously upload the error file to AWS S3.
		aws_access.uploadFileToAwsS3(aws_s3_client, errorLogFileContent, errorLogFileFullName);
	} catch (err) {
		debug(`logAndEmailError() fs_promises.writeFile() error:  ${err}`);
	}
	
	var emailSubject = "Allen Young's Stockmarket error";
	aws_access.sendEmail(aws_ses_client, senderEmailAddress, webAdminEmailAddress, emailSubject, 
		errorLogFileContent, errorLogFileContent);
	//debug('logAndEmailError() finished');
}

export async function logAndEmailPaymentCapture(paymentCaptureApiName, captureData) {
	//debug('logAndEmailPaymentCapture() started');
	
	let paymentCaptureDateTime = new Date();
		
	var paymentCaptureLogFileFullName = 'payment_capture_log_' + 
		paymentCaptureDateTime.getFullYear() + (paymentCaptureDateTime.getMonth()+1) + paymentCaptureDateTime.getDate() + "_" +
		paymentCaptureDateTime.getHours() + paymentCaptureDateTime.getMinutes() + paymentCaptureDateTime.getSeconds() + "_" +
		Date.now().toString(36) + Math.random().toString(36).substr(2) + '.txt';
	var paymentCaptureLogFileFullPath = path.join(__dirname, paymentCaptureLogFileFullName);	
	
	var paymentCaptureLogFileContent = paymentCaptureApiName + '\n' + `${JSON.stringify(captureData)}`;
	
	try {
		fs_promises.writeFile(paymentCaptureLogFileFullPath, paymentCaptureLogFileContent);
		
		//asynchronously upload the payment-capture file to AWS S3.
		aws_access.uploadFileToAwsS3(aws_s3_client, paymentCaptureLogFileContent, paymentCaptureLogFileFullName);
	} catch (err) {
		debug(`logAndEmailPaymentCapture() fs_promises.writeFile() payment capture:  ${captureData}`);
	}
	
	var emailSubject = "Allen Young's Stockmarket payment capture" + paymentCaptureApiName;
	aws_access.sendEmail(aws_ses_client, senderEmailAddress, webAdminEmailAddress, emailSubject, 
		paymentCaptureLogFileContent, paymentCaptureLogFileContent);
	//debug('logAndEmailPaymentCapture() finished');
}

export async function sendEmailAddressVerificationEmail(userEmailAddress, accessToken) {
	var htmlEmailContent = ''
	var textEmailContent = ''

	htmlEmailContent = '<html><head></head>' +
		'<body style="margin: 0;">' +
		'<div style="margin: 0; padding: 1% 0.5% 1% 0; background: rgb(0,0,0); color: rgb(255,255,255); text-align: left; font-family: Arial, Helvetica, sans-serif;">' +
		`<a href="${websiteHomeUrl}" target="_blank" style="color: white">Allen Young's Stockmarket Demo</a>` +
		'</div>' +
		'<section>' +
		'<h1 style="text-align: left; font-size: 300%; font-family: Arial, Helvetica, sans-serif; font-weight: bold; margin: 0;">Verify Your Email Address</h1>' +
		'<div style="font-size: 125%; font-family: Tahoma;text-align: center;">' +
		'<p>Welcome to Allen Young\'s Stockmarket Demo.</p>' +
		'<p style="margin-bottom: 2em;">Thank you for being a part of building the future!</p>' +
		'<p>Email address:  ' + userEmailAddress + '</p>' +
		'<p>You cannot log into your account until you verify your email address.</p>' +
		'<p style="margin-bottom: 0.5%;">Please click the link below to verify your email address.</p>' +
		'</div>' +
		'<div style="text-align: center;">' +
		'<button type="button" style="margin: 0.5% 0 1.25% 0; padding: 0.5%; font-size: 150%; font-weight: 900; border-radius: 0px;"><a href=" ' + 
			backendApiBaseUrl + 'GetEmailAddressVerificationSuccessPage/' + accessToken + 
			'">Verify my email address</a></button>' +
		'</div>' +
		'</section>' +
		"<footer style='margin: 0; padding: 0.25% 0.5% 0.1% 0; background: rgb(0,0,0); color: rgb(255,255,255); font-family: Arial, Helvetica, sans-serif; text-align: center;'>" +
		"<p>Allen Young's Stockmarket Demo by Allen Young.</p>" +
		"<p>For demonstrating Allen Young's full-stack web app development skills to potential employers.</p>" +
		"<p>For more of Allen Young's software development skills demonstration, visit <a href='https://AllenYoung.dev' target='_blank'  style='color: white'>AllenYoung.dev</a> and <a href='https://GitHub.com/AllenYoungDev' target='_blank' style='color: white'>GitHub.com/AllenYoungDev</a>.</p>" +
		"<p>© 2023 Allen Young.  All rights reserved.</p>" +
		'</footer>' +
		'</body>' +
		'</html>'

	textEmailContent = 'Allen Young\'s Stockmarket Demo\n\n' +
		'Verify Your Email Address\n\n' +
		'Email address:  ' + userEmailAddress + '\n\n' +
		'You cannot log in until you verify your email address.\n\n' +
		'Please visit the verification link to verify your email address.\n\n' +
		backendApiBaseUrl + 'GetEmailAddressVerificationSuccessPage/' + accessToken

	var emailSubject = "Verify your email address for Allen Young's Stockmarket";
	aws_access.sendEmail(aws_ses_client, senderEmailAddress, userEmailAddress, emailSubject, 
		htmlEmailContent, textEmailContent);
}

export async function sendResetPasswordEmail(userEmailAddress, accessToken) {
	var htmlEmailContent = ''
	var textEmailContent = ''

	htmlEmailContent = '<html><head></head>' +
		'<body style="margin: 0;">' +
		'<div style="margin: 0; padding: 1% 0.5% 1% 0; background: rgb(0,0,0); color: rgb(255,255,255); text-align: left; font-family: Arial, Helvetica, sans-serif;">' +
		`<a href="${websiteHomeUrl}" target="_blank" style="color: white">Allen Young's Stockmarket Demo</a>` +
		'</div>' +
		'<section>' +
		'<h1 style="text-align: left; font-size: 300%; font-family: Arial, Helvetica, sans-serif; font-weight: bold; margin: 0;">Password reset</h1>' +
		'<div style="font-size: 125%; font-family: Tahoma;text-align: center;">' +
		'<p>We sent you this password reset email, because you or someone else requested it on our website.</p>' +
		'<p style="margin-bottom: 2em;">If you have not requested password reset, you can disregard this message.</p>' +
		'<p>Email address:  ' + userEmailAddress + '</p>' +
		'<p>Click the button below to reset your password.</p>' +
		'</div>' +
		'<div style="text-align: center;">' +
		'<button type="button" style="margin: 0.5% 0 1.25% 0; padding: 0.5%; font-size: 150%; font-weight: 900; border-radius: 0px;"><a href=" ' + 
			websiteHomeUrl + 'PasswordReset.html?accessToken=' + accessToken + '&emailAddress=' + userEmailAddress +
			'">Reset password</a></button>' +
		'</div>' +
		'</section>' +
		"<footer style='margin: 0; padding: 0.25% 0.5% 0.1% 0; background: rgb(0,0,0); color: rgb(255,255,255); font-family: Arial, Helvetica, sans-serif; text-align: center;'>" +
		"<p>Allen Young's Stockmarket Demo by Allen Young.</p>" +
		"<p>For demonstrating Allen Young's full-stack web app development skills to potential employers.</p>" +
		"<p>For more of Allen Young's software development skills demonstration, visit <a href='https://AllenYoung.dev' target='_blank'  style='color: white'>AllenYoung.dev</a> and <a href='https://GitHub.com/AllenYoungDev' target='_blank' style='color: white'>GitHub.com/AllenYoungDev</a>.</p>" +
		"<p>© 2023 Allen Young.  All rights reserved.</p>" +
		'</footer>' +		
		'</body>' +
		'</html>'

	textEmailContent = 'Allen Young\'s Stockmarket Demo\n\n' +
		'Reset Your Password\n\n' +
		'Email address:  ' + userEmailAddress + '\n\n' +
		'Visit the link below to reset your password.\n\n' +
		websiteHomeUrl + 'PasswordReset.html?accessToken=' + accessToken

	var emailSubject = "Password reset for Allen Young's Stockmarket";
	aws_access.sendEmail(aws_ses_client, senderEmailAddress, userEmailAddress, emailSubject, 
		htmlEmailContent, textEmailContent);
}
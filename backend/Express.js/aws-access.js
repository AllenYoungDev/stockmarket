/* References
https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html

*/

import debugFactory from 'debug';
const debug = debugFactory('aws-access');

import {
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fetch from "node-fetch";

import { SendEmailCommand } from "@aws-sdk/client-ses";


const awsS3BucketName = 'ay-ocm-data-private'
const awsS3BucketFolder = 'allen-young-stockmarket/'

const emailSenderName = "Allen Young's Stockmarket";


export async function createPresignedUrl(aws_s3_client) {
	
	const bucketParams = {
	  Bucket: awsS3BucketName,
	  Key: 'digital-products/Transhumanism_Plans_test.zip',
	  Body: "BODY",
	};	
	
  try {
    // Create the command.
    const command = new GetObjectCommand(bucketParams);

    // Create the presigned URL.
    var signedUrl = await getSignedUrl(aws_s3_client, command, {
      expiresIn: 18000,
    });
    //debug(`\nGetting "${bucketParams.Key}" using signedUrl with body "${bucketParams.Body}" in v3`);
    //debug(signedUrl);
    const response = await fetch(signedUrl);
    //debug(`\nResponse returned by signed URL: ${await response.text()}\n`);
  } catch (err) {
    debug("Error creating presigned URL", err);
	return '';
  }	
	
	return signedUrl;
}

export async function uploadFileToAwsS3(aws_s3_client, localFileContent, localFileFullName) {
	const bucketParams = {
	  Bucket: awsS3BucketName,
	  Key: awsS3BucketFolder + localFileFullName,
	  Body: localFileContent,
	};	
	
  try {
    //debug(`Putting object "${bucketParams.Key}" in bucket`);
    const data = await aws_s3_client.send(
      new PutObjectCommand({
        Bucket: bucketParams.Bucket,
        Key: bucketParams.Key,
        Body: bucketParams.Body,
      })
    );
  } catch (err) {
    debug("uploadFileToAwsS3() error putting object.  ", err);
	//debug("uploadFileToAwsS3() error putting object.  ");
	throw err;
  }	
}

export async function sendEmail(aws_ses_client, senderEmailAddress, recipientEmailAddress, 
	emailSubject, htmlEmailContent, textEmailContent) {
	const createSendEmailCommand = (toAddress, fromAddress, htmlContent, textContent, emailSubject) => {
	  return new SendEmailCommand({
		Destination: {
		  /* required */
		  CcAddresses: [
			/* more items */
		  ],
		  ToAddresses: [
			toAddress,
			/* more To-email addresses */
		  ],
		},
		Message: {
		  /* required */
		  Body: {
			/* required */
			Html: {
			  Charset: "UTF-8",
			  Data: htmlContent,
			},
			Text: {
			  Charset: "UTF-8",
			  Data: textContent,
			},
		  },
		  Subject: {
			Charset: "UTF-8",
			Data: emailSubject,
		  },
		},
		Source: emailSenderName + '<' + fromAddress + '>',
		ReplyToAddresses: [
		  /* more items */
		],
	  });
	};

  const sendEmailCommand = createSendEmailCommand(
	recipientEmailAddress,
	senderEmailAddress,
	htmlEmailContent,
	textEmailContent,
	emailSubject
  );

  
  try {
	aws_ses_client.send(sendEmailCommand);
  } catch (e) {
	debug("Failed to send email.", e);
	throw e;
  }
	
  return null
	//debug('Email has been sent!');
}


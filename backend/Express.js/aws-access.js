/* References
https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html

*/

import "dotenv/config";

import debugFactory from 'debug';
const debug = debugFactory('aws-access');

import {
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fetch from "node-fetch";

import { SendEmailCommand } from "@aws-sdk/client-ses";


const awsS3BucketName = process.env.ALLEN_YOUNG_STOCKMARKET_AWS_S3_BUCKET_NAME;
const awsS3BucketFolder = process.env.ALLEN_YOUNG_STOCKMARKET_AWS_S3_BUCKET_FOLDER;

const emailSenderName = process.env.ALLEN_YOUNG_STOCKMARKET_EMAIL_SENDER_NAME;


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


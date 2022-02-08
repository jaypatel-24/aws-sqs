const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');

const SESConfig = {
	apiVersion: '2012-11-05',
	region: 'us-east-2',
};
AWS.config.update(SESConfig);

// Create SQS service object
const sqs = new AWS.SQS();

const queueUrl = `https://sqs.us-east-2.amazonaws.com/136438254269/practiceStandardQueue`;

router.get('/', (req, res) => {
	return res.send('hi');
});

router.get('/read-message', (req, res) => {
	try {
		const params = {
			QueueUrl: queueUrl,
			MaxNumberOfMessages: 1,
		};
		sqs.receiveMessage(params, (err, data) => {
			if (err) {
				console.log(err, err.stack);
				return res.send(err.message);
			} else {
				if (!data || !data.Messages || data.Messages.length === 0) {
					console.log('Nothing to process');
					return res.send('Nothing to process');
				}
				const receipt = data.Messages[0].ReceiptHandle;

				const deleteParams = {
					QueueUrl: queueUrl,
					ReceiptHandle: receipt,
				};
				sqs.deleteMessage(deleteParams, (err, data) => {
					if (err) {
						console.log(err, err.stack);
					} else {
						console.log('Successfully deleted message from queue');
					}
					//return res.send(data);
				});
				return res.send(data);
			}
		});
	} catch (err) {
		return res.send(err.message);
	}
});

router.post('/send-message', (req, res) => {
	let messageData = req.body;
	let sqsMessageData = {
		MessageBody: JSON.stringify(messageData),
		QueueUrl: queueUrl,
	};

	// Send the order data to the SQS queue
	let sendSqsMessage = sqs.sendMessage(sqsMessageData).promise();

	sendSqsMessage
		.then((data) => {
			console.log(`MessageService | SUCCESS: ${data.MessageId}`);
			res.send('Your message has been sent');
		})
		.catch((err) => {
			console.log(`MessageService | ERROR: ${err}`);

			// Send email to emails API
			res.send('We ran into an error. Please try again.');
		});
});

module.exports = router;

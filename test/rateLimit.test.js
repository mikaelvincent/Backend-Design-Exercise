/**
 * Test Suite for Rate Limiting Middleware.
 * 
 * This file defines test cases for the rate limiting functionality provided
 * by the Node.js application. It verifies that the rate limiting middleware
 * correctly restricts the number of requests from a single IP address within
 * a defined time window and returns appropriate responses when the limit is exceeded.
 * 
 * The tests are implemented using Chai and Mocha, with Chai-HTTP used to
 * simulate HTTP requests.
 */

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); // Import the application to test
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

chai.use(chaiHttp);
chai.should(); // Enables 'should' style assertions in tests

// Path to the mock user data JSON file for testing
const testUsersFilePath = path.join(__dirname, '../data/test_users.json');

// JWT secret key used for testing (from environment or default value)
const secretKey = process.env.SECRET_KEY || 'default_secret_key';

describe('Rate Limiting', () => {
	let validToken;

	/**
	 * Before the rate limit test, ensure that a test user exists in the mock database
	 * and generate a valid JWT token for that user.
	 */
	before((done) => {
		const testUser = {
			id: 1,
			username: 'testuser',
			email: 'test@example.com',
			password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456', // Mock hashed password
		};
		// Write the test user to the test_users.json file
		fs.writeFileSync(testUsersFilePath, JSON.stringify([testUser]), 'utf8');

		// Generate a valid JWT token for the test user
		validToken = jwt.sign({
				id: testUser.id
			},
			secretKey, {
				expiresIn: '1h'
			}
		);
		done();
	});

	/**
	 * After the rate limit test, clean up the mock database.
	 */
	after(() => {
		fs.writeFileSync(testUsersFilePath, '[]', 'utf8');  // Reset the test_users.json file
		delete process.env.RATE_LIMIT_MAX;                  // Reset rate limit configuration after test
	});

	it('should return 429 when rate limit is exceeded', (done) => {
		let completedRequests = 0;
		const totalRequests = 6; // Assuming RATE_LIMIT_MAX is set to 5 in test environment

		// Function to handle the completion of each request
		const checkDone = (err, res) => {
			completedRequests++;
			if (completedRequests === totalRequests) {
				res.should.have.status(429); // Too many requests
				res.body.should.have.property('message').eql('Too many requests from this IP, please try again after 15 minutes.');
				done();
			}
		};

		// Send multiple requests to exceed the rate limit
		for (let i = 0; i < totalRequests; i++) {
			chai.request(app)
				.get('/api/profile')
				.set('Authorization', `Bearer ${validToken}`)
				.set('x-enable-rate-limit', 'true') // Ensure rate limiting is enabled
				.end(checkDone);
		}
	});
});
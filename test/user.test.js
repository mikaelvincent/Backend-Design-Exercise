/**
 * Test Suite for User API Endpoints.
 * 
 * This file defines test cases for the user-related operations provided
 * by the Node.js application. It covers tests for registration, login,
 * profile retrieval, password change, and rate limiting functionality.
 * 
 * The tests are implemented using Chai and Mocha, with Chai-HTTP used to
 * simulate HTTP requests. JWT is also tested for authentication.
 */

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); // Import the application to test
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Path to the mock user data JSON file
const usersFilePath = path.join(__dirname, '../data/users.json');

// JWT secret key used for testing (from environment or default value)
const secretKey = process.env.SECRET_KEY || 'default_secret_key';

chai.use(chaiHttp);
chai.should(); // Enables 'should' style assertions in tests

describe('User API', () => {
	/**
	 * Before each test, reset the user data file to an empty array.
	 * This ensures that no users from previous tests remain in the mock database.
	 */
	beforeEach(() => {
		fs.writeFileSync(usersFilePath, '[]', 'utf8');
	});

	/**
	 * Test: POST /api/register
	 * 
	 * Verifies that a new user can be registered successfully.
	 * Also tests for edge cases such as missing fields and duplicate usernames.
	 */
	describe('POST /api/register', () => {
		it('should register a new user', (done) => {
			const user = {
				username: 'testuser',
				email: 'test@example.com',
				password: 'password123',
			};

			chai.request(app)
				.post('/api/register')
				.send(user)
				.end((err, res) => {
					res.should.have.status(201);
					res.body.should.have.property('message').eql('User registered successfully.');
					res.body.user.should.have.property('id');
					res.body.user.should.have.property('username').eql('testuser');
					done();
				});
		});

		it('should not register a user with missing fields', (done) => {
			const user = {
				username: 'testuser',
				email: 'test@example.com',
			};

			chai.request(app)
				.post('/api/register')
				.send(user)
				.end((err, res) => {
					res.should.have.status(400); // Bad request due to missing password
					res.body.should.have.property('message');
					done();
				});
		});

		it('should not register a user with an existing username', (done) => {
			const user = {
				username: 'testuser',
				email: 'test@example.com',
				password: 'password123',
			};

			// Simulate a user already existing in the system
			fs.writeFileSync(usersFilePath, JSON.stringify([{
				id: 1,
				username: 'testuser',
				email: 'test@example.com',
				password: 'hashedpassword',
			}]), 'utf8');

			chai.request(app)
				.post('/api/register')
				.send(user)
				.end((err, res) => {
					res.should.have.status(409); // Conflict due to duplicate username
					res.body.should.have.property('message').eql('Username already exists.');
					done();
				});
		});
	});

	/**
	 * Test: POST /api/login
	 * 
	 * Verifies the user login process, including valid credentials and handling invalid login attempts.
	 */
	describe('POST /api/login', () => {
		it('should login a user and return a token', (done) => {
			const user = {
				username: 'testuser',
				email: 'test@example.com',
				password: 'password123',
			};

			// First register the user
			chai.request(app)
				.post('/api/register')
				.send(user)
				.end(() => {
					// Then login with valid credentials
					chai.request(app)
						.post('/api/login')
						.send({
							username: 'testuser',
							password: 'password123',
						})
						.end((err, res) => {
							res.should.have.status(200);
							res.body.should.have.property('token');
							done();
						});
				});
		});

		it('should not login with incorrect credentials', (done) => {
			chai.request(app)
				.post('/api/login')
				.send({
					username: 'wronguser',
					password: 'wrongpassword',
				})
				.end((err, res) => {
					res.should.have.status(401); // Unauthorized due to incorrect credentials
					res.body.should.have.property('message').eql('Invalid credentials.');
					done();
				});
		});
	});

	/**
	 * Test: GET /api/profile
	 * 
	 * Verifies that the authenticated user can retrieve their profile.
	 * Also tests unauthorized access attempts without or with invalid tokens.
	 */
	describe('GET /api/profile', () => {
		it('should get the user profile when authenticated', (done) => {
			const user = {
				username: 'testuser',
				email: 'test@example.com',
				password: 'password123',
			};

			// First register the user
			chai.request(app)
				.post('/api/register')
				.send(user)
				.end(() => {
					// Then login to get the token
					chai.request(app)
						.post('/api/login')
						.send({
							username: 'testuser',
							password: 'password123',
						})
						.end((err, res) => {
							const token = res.body.token;
							// Use the token to request the profile
							chai.request(app)
								.get('/api/profile')
								.set('Authorization', `Bearer ${token}`)
								.end((err, res) => {
									res.should.have.status(200);
									res.body.should.have.property('user');
									res.body.user.should.have.property('username').eql('testuser');
									done();
								});
						});
				});
		});

		it('should not get the user profile without a token', (done) => {
			chai.request(app)
				.get('/api/profile')
				.end((err, res) => {
					res.should.have.status(403); // Forbidden due to missing token
					res.body.should.have.property('message').eql('No token provided.');
					done();
				});
		});

		it('should not get the user profile with an invalid token', (done) => {
			chai.request(app)
				.get('/api/profile')
				.set('Authorization', 'Bearer invalidtoken')
				.end((err, res) => {
					res.should.have.status(401); // Unauthorized due to invalid token
					res.body.should.have.property('message').eql('Failed to authenticate token.');
					done();
				});
		});
	});

	/**
	 * Test: PUT /api/change-password
	 * 
	 * Verifies that an authenticated user can change their password.
	 * Tests both successful password changes and cases where the old password is incorrect.
	 */
	describe('PUT /api/change-password', () => {
		let token;

		/**
		 * Before each password change test, register a user and log them in to obtain a token.
		 */
		beforeEach((done) => {
			const user = {
				username: 'testuser',
				email: 'test@example.com',
				password: 'password123',
			};

			chai.request(app)
				.post('/api/register')
				.send(user)
				.end(() => {
					chai.request(app)
						.post('/api/login')
						.send({
							username: 'testuser',
							password: 'password123',
						})
						.end((err, res) => {
							token = res.body.token; // Save the token for future requests
							done();
						});
				});
		});

		it('should change the user password when valid', (done) => {
			const passwordData = {
				oldPassword: 'password123',
				newPassword: 'newpass123',
			};

			chai.request(app)
				.put('/api/change-password')
				.set('Authorization', `Bearer ${token}`)
				.send(passwordData)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property('message').eql('Password changed successfully.');
					done();
				});
		});

		it('should not change the password with invalid old password', (done) => {
			const passwordData = {
				oldPassword: 'wrongpass',
				newPassword: 'newpass123',
			};

			chai.request(app)
				.put('/api/change-password')
				.set('Authorization', `Bearer ${token}`)
				.send(passwordData)
				.end((err, res) => {
					res.should.have.status(400); // Bad request due to incorrect old password
					res.body.should.have.property('message').eql('Invalid old password.');
					done();
				});
		});
	});

	/**
	 * Test: Rate Limiting
	 * 
	 * Verifies that rate limiting is applied after exceeding the maximum number of requests.
	 */
	describe('Rate Limiting', () => {
		let validToken;

		/**
		 * Before the rate limit test, generate a valid JWT token for an existing user.
		 */
		before(() => {
			const testUser = {
				id: 1,
				username: 'testuser',
				email: 'test@example.com',
			};
			validToken = jwt.sign({
				id: testUser.id,
			}, secretKey, {
				expiresIn: '1h',
			});
		});

		/**
		 * After the rate limit test, restore the default rate limit settings.
		 */
		after(() => {
			delete process.env.RATE_LIMIT_MAX; // Reset rate limit configuration after test
		});

		it('should return 429 when rate limit is exceeded', (done) => {
			let completedRequests = 0;
			const totalRequests = 6;

			// Send multiple requests to exceed the rate limit
			for (let i = 0; i < totalRequests; i++) {
				chai.request(app)
					.get('/api/profile')
					.set('Authorization', `Bearer ${validToken}`)
					.set('x-enable-rate-limit', 'true')
					.end((err, res) => {
						completedRequests++;
						if (completedRequests === totalRequests) {
							res.should.have.status(429); // Too many requests
							res.body.should.have.property('message').eql('Too many requests from this IP, please try again after 15 minutes.');
							done();
						}
					});
			}
		});
	});
});

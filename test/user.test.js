const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const users = require('../models/userModel');

// Configure chai
chai.use(chaiHttp);
chai.should();

describe('User API', () => {
  // Before each test, clear the users array
  beforeEach(() => {
    users.length = 0; // Reset the user array
  });

  /**
   * Test the POST /register route
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
          res.body.should.be.a('object');
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
          res.should.have.status(400);
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

      users.push({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
      });

      chai.request(app)
        .post('/api/register')
        .send(user)
        .end((err, res) => {
          res.should.have.status(409);
          res.body.should.have.property('message').eql('Username already exists.');
          done();
        });
    });
  });

  /**
   * Test the POST /login route
   */
  describe('POST /api/login', () => {
    it('should login a user and return a token', (done) => {
      // First, register a user
      const user = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };
      chai.request(app)
        .post('/api/register')
        .send(user)
        .end((err, res) => {
          // Then, attempt to login
          chai.request(app)
            .post('/api/login')
            .send({ username: 'testuser', password: 'password123' })
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
        .send({ username: 'wronguser', password: 'wrongpassword' })
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.have.property('message').eql('Invalid credentials.');
          done();
        });
    });
  });

  /**
   * Test the GET /profile route
   */
  describe('GET /api/profile', () => {
    it('should get the user profile when authenticated', (done) => {
      // First, register and login a user to get a token
      const user = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };
      chai.request(app)
        .post('/api/register')
        .send(user)
        .end((err, res) => {
          chai.request(app)
            .post('/api/login')
            .send({ username: 'testuser', password: 'password123' })
            .end((err, res) => {
              const token = res.body.token;
              // Access the protected route
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
          res.should.have.status(403);
          res.body.should.have.property('message').eql('No token provided.');
          done();
        });
    });

    it('should not get the user profile with an invalid token', (done) => {
      chai.request(app)
        .get('/api/profile')
        .set('Authorization', 'Bearer invalidtoken')
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.have.property('message').eql('Failed to authenticate token.');
          done();
        });
    });
  });
});

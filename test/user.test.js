const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY || 'default_secret_key';
const fs = require('fs');
const path = require('path');
const usersFilePath = path.join(__dirname, '../data/users.json');

chai.use(chaiHttp);
chai.should();

describe('User API', () => {
  beforeEach(() => {
    fs.writeFileSync(usersFilePath, '[]', 'utf8');
  });

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
          res.should.have.status(409);
          res.body.should.have.property('message').eql('Username already exists.');
          done();
        });
    });
  });

  describe('POST /api/login', () => {
    it('should login a user and return a token', (done) => {
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

  describe('GET /api/profile', () => {
    it('should get the user profile when authenticated', (done) => {
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
            .send({ username: 'testuser', password: 'password123' })
            .end((err, res) => {
              const token = res.body.token;
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

  describe('PUT /api/change-password', () => {
    let token;

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
            .send({ username: 'testuser', password: 'password123' })
            .end((err, res) => {
              token = res.body.token;
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
          res.should.have.status(400);
          res.body.should.have.property('message').eql('Invalid old password.');
          done();
        });
    });
  });

  describe('Rate Limiting', () => {
    let validToken;

    before(() => {
      const testUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
      };
      validToken = jwt.sign({ id: testUser.id }, secretKey, { expiresIn: '1h' });
    });

    after(() => {
      delete process.env.RATE_LIMIT_MAX;
    });

    it('should return 429 when rate limit is exceeded', (done) => {
      let completedRequests = 0;
      const totalRequests = 6;

      for (let i = 0; i < totalRequests; i++) {
        chai.request(app)
          .get('/api/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .set('x-enable-rate-limit', 'true')
          .end((err, res) => {
            completedRequests++;
            if (completedRequests === totalRequests) {
              res.should.have.status(429);
              res.body.should.have.property('message').eql('Too many requests from this IP, please try again after 15 minutes.');
              done();
            }
          });
      }
    });
  });
});

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server'); 

chai.use(chaiHttp);
const expect = chai.expect;

describe('Book Library API', () => {
  describe('POST /books', () => {
    it('should handle book entry', (done) => {
      chai.request(app)
        .post('/books')
        .send({ title: 'testTitle', author: 'testAuthor',genre: 'testGenre' })
        .end((err, res) => {
          if (err) {
            expect(res).to.have.status(500);
            expect(res.body).to.have.property('message').that.is.equal('An error occurred!!');
          } else {
            expect(res).to.have.status(201);
            expect(res.body).to.have.property('message').equal('Book registered successfully');
          }

          done();
        });
    });
  });
});
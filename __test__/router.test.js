const request = require('supertest')
const server = require('../src/app')

beforeAll(() => {
  jest.setTimeout(100*1000)
})

describe('Route /api/v1', () => {
  it("Should return a HTTP status code 200 in endpoint / with response Hello World", (done) => {
    request(server)
      .get('/api/v1/')
      .then(res => {
        expect(res.status).toEqual(200)
        expect(res.body).toMatchObject({message: 'Hello world!'})
        expect(res.body.message).toEqual('Hello world!')
        done()
      })
  })
  
  it("Should return a HTTP status code 200 in endpoint /contributors", (done) => {
    request(server)
      .get('/contributors')
      .then(res => {
        expect(res.status).toEqual(200)
        done()
      })
  })
})

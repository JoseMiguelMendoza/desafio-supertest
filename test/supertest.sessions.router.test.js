import chai from 'chai'
import supertest from 'supertest'
import { fakerES as faker } from '@faker-js/faker'

const expect = chai.expect
const requester = supertest('http://localhost:8080')

describe('Register', () => {
    let mockingUser = {
        name: faker.person.firstName(),
        surname: faker.person.lastName(),
        age: faker.number.int({ min: 18, max: 65 }),
        email: faker.internet.email(),
        password: faker.internet.password(),
    }
    it('Debe poder registrar un usuario', async() => {
        const response = await requester.post('/register').send(mockingUser)
        expect(response.status).to.equal(302)
    })
})
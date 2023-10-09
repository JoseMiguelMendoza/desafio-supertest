import chai from 'chai'
import supertest from 'supertest'

const expect = chai.expect
const requester = supertest('http://localhost:8080')

describe('Testing E-Commerce - Ruta /api/carts - Method POST', () => {
    it('Debería devolver status 201, si se muestran con éxito los productos.', async() => {
        const { status, _body } = await requester.post('/api/carts')
        expect(status).to.equal(201);
        console.log(_body.payload)
    })
})
import chai from 'chai'
import supertest from 'supertest'
import { fakerES as faker } from '@faker-js/faker'

const expect = chai.expect
const requester = supertest('http://localhost:8080')

describe('Testing E-Commerce - Ruta /api/products - Method GET', () => {
    it('Debería devolver status 200, si se muestran con éxito los productos.', async() => {
        const { status, _body } = await requester.get('/api/products')
        expect(status).to.equal(200);
        console.log(_body.payload)
    })
})

describe('Testing E-Commerce - Ruta /api/products - Method POST', () => {
    it('Para crear un producto, debe tener obligatoriamente los campos:\n\tcategory,\n\tprice,\n\tstock,\n\ttitle,\n\tdescription,\n\tcode', async() => {
        let newProduct = {
            title: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            price: faker.number.int({ min: 1, max: 9000 }),
            code: faker.number.int({ min: 0, max: 10000 }),
            stock: faker.number.int({ min: 10000, max: 1000000 }),
            category: faker.commerce.department()
        }

        const { status, _body } = await requester.post('/api/products').send(newProduct)
        expect(status).to.equal(201);
        console.log(_body.payload)
    })
})
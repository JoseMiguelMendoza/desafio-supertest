import express from 'express'
import cors from 'cors'
import { Server } from 'socket.io'
import handlebars from 'express-handlebars'
import ProductManager from './dao/mongo/productManager.js'
import MongoStore from 'connect-mongo'
import mongoose from 'mongoose'
import session from 'express-session'
import config from './config/config.js'
import passport from 'passport'
import initializePassport from './config/passport.config.js'
import errorHandler from './middlewares/error.middleware.js'
import logger from './utils/logger.js'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUiExpress from 'swagger-ui-express'

import messageModel from './models/message.model.js'
import cartModel from './models/cart.model.js'

import productRouter from './routes/product.router.js'
import viewsRouter from './routes/views.router.js'
import cartRouter from './routes/cart.router.js'
import chatRouter from './routes/chat.router.js'
import sessionRouter from './routes/session.router.js'
import mockingRouter from './routes/mock.router.js'
import loggerRouter from './routes/logger.router.js'

const app = express()
export const PORT = config.apiserver.port

app.use(session({
    store: MongoStore.create({
        mongoUrl: config.mongo.uri,
        collectionName: config.mongo.collectionName,
        mongoOptions: {
            useNewUrlPArser: true,
            useUnifiedTopology: true
        }
    }),
    secret: config.mongo.secret,
    resave: true,
    saveUninitialized: true
}))
initializePassport()
app.use(passport.initialize())
app.use(passport.session())

const productManager = new ProductManager()
const httpServer = app.listen(PORT, () =>  logger.info(`Server Express Puerto ${PORT}`))
const io = new Server(httpServer)

const swaggerOptions = {
    definition: {
        openapi: '3.1.0',
        info: {
            title: 'Proyecto Final de E-commerce para Coderhouse',
            description: 'Documentación de los modelos de productos y carritos.',
            version: '1.0.0'
        }
    },
    apis: ['./docs/**/*.yaml']
}
const specs = swaggerJSDoc(swaggerOptions)

app.engine('handlebars', handlebars.engine())
app.set('views', './src/views')
app.set('view engine', 'handlebars')

app.use(express.static('./src/public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.use((req, res, next) => {
    req.io = io
    next()
})

app.use('/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs))
app.use('/api/products', productRouter)
app.use('/api/carts', cartRouter)
app.use('/', viewsRouter)
app.use('/chat', chatRouter)
app.use('/', sessionRouter)
app.use('/mockingproducts', mockingRouter)
app.use('/loggerTest', loggerRouter)
app.use(errorHandler)

mongoose.set('strictQuery', false)
try{
    await mongoose.connect(config.mongo.uri)
    logger.info('DB connected!')
} catch(err){
    logger.error(err.message)
}

io.on("connection", socket => {
    socket.on('productList', async(data) => {
        await productManager.addProducts(data)
            .then(data => {
                io.emit('updatedProducts', data)
            })
            .catch(err => {
                logger.error(`Error: ${err}`)
            })
    });

    messageModel.find().lean().exec()
        .then(messages => {
            socket.emit('logs', messages);
        })
        .catch(error => {
            logger.error(`Error al obtener los mensajes: ${error}`)
        });

    socket.on('message', async (data) => {
        await messageModel.create(data)
            .catch(error => {
                logger.error(`Error al guardar el mensaje: ${error}`)
            });

        messageModel.find().lean().exec()
            .then(messages => {
                io.emit('logs', messages);
            })
            .catch(error => {
                logger.error(`Error al obtener los mensajes: ${error}`)
            });
    });

    socket.on('eliminarProductoDelCarrito', async({cartId}) => {
        try {
            let updatedCart = await cartModel.findById(cartId).populate('products.product').lean()
            socket.emit('productoEliminado', updatedCart);
        } catch (error) {
            logger.error(`Error al eliminar el producto del carrito: ${error}`)
        }
    })
});
import CustomError from "../services/errors/custom_error.js"
import EErros from "../services/errors/enums.js"
import { generateAddingProductInfo } from "../services/errors/info.js"
import { CartService, ProductService, TicketService, UserService } from "../services/index.js"
import logger from "../utils/logger.js"


export const getCartsController = async(req, res) => {
    logger.http('Someone made a GET request to the endpoint /api/carts')
    let result = await CartService.getAllCarts()
    res.status(201).json({ status: 'success', payload: result })
}

export const getCartsWithIdController = async(req, res) => {
    logger.http('Someone made a GET request to the endpoint /api/carts/:cid')
    let result = await CartService.getProductsFromCart(req, res)
    if (result === null) return res.status(404).json({ status: 'error', error: 'Not Found'})
    return res.status(200).json({ status: 'success', payload: result })
}


export const createCartController = async(req, res) => {
    let addingCart = await CartService.createCart()
    logger.http('Someone made a POST request to the endpoint /api/carts')
    return res.status(201).json({ status: 'success', payload: addingCart })
}

export const addProductInCartWithCidAndPidController = async(req, res, next) => {
    try{
        let cartId = req.params.cid
        let productId = req.params.pid
        let result = await CartService.addProductInCart(cartId, productId)
        if(typeof result === 'string'){
            CustomError.createError({
                name: 'Product or cart not found.',
                cause: generateAddingProductInfo(),
                message: 'Error trying to add product in cart.',
                code: EErros.NON_EXISTENT_ID
            })
        }
        logger.http('Someone made a POST request to the endpoint /api/carts/:cid/product/:pid')
        return res.status(201).json({ status: 'success', payload: result })
    }catch(err){
        next(err)
    }
}

export const generateTicketController = async(req, res) => {
    try{
        let cartId = req.params.cid
        const user = await UserService.findUserById(req.session.passport.user)
        let productsInCart = await CartService.getProductsFromCart(req, res)
        let totalCartPrice = 0;
        let totalPrice = 0;
        let productsToPurchase = [];
        let productsUnavailable = []
    
        productsInCart.products.map(item => {
            const isAvailable = item.product.stock - item.quantity > 0;
            if(isAvailable){
                totalPrice = item.product.price * item.quantity;
                totalCartPrice  += totalPrice;
                productsToPurchase.push({
                    product: item.product._id,
                    quantity: item.quantity,
                });
            }
            else{
                totalPrice = item.product.price * item.quantity
                productsUnavailable.push({
                    product: item.product._id,
                    quantity: item.quantity
                })
            }
            if (productsToPurchase.length === 0) {
                return res.status(400).json({ status: 'error', error: 'No hay productos disponibles para comprar' });
            }
            return {
                ...item,
                isAvailable: isAvailable,
                totalPrice: totalPrice
            };
        });
        
        for (const productData of productsToPurchase) {
            const product = await ProductService.getProductById(productData.product);
            if (product) {
                product.stock -= productData.quantity;
                await product.save();
            }
        }
        
        let newTicket = {
            ammount: totalCartPrice,
            purchaser: user.email,
            products: productsToPurchase
        }
        
        let ticketGenerated = await TicketService.createTicket(newTicket)
        let userCart = await CartService.getCartByIdMongooseObj(cartId)
        
        userCart.products = productsUnavailable
        await userCart.save()
        logger.http('Someone made a POST request to the endpoint /api/carts/:cid/purchase')
        res.status(200).json({ status: 'success', payload: ticketGenerated })
    }catch(err){
        res.status(500).json({ status: 'error', error: err.message })
    }
}

export const updateCartWithIdController = async(req, res) => {
    try {
        const cid = req.params.cid;
        const products = req.body.products;
        const updatedCart = await CartService.updateCart(cid, products)
        if (!updatedCart) {
            return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
        }
        logger.http('Someone made a PUT request to the endpoint /api/carts/:cid')
        res.status(200).json({ status: 'success', message: 'Carrito actualizado con éxito', cart: updatedCart });
    } catch (err) {
        res.status(500).json({ status: 'error', error: err.message });
    }
}

export const updateQuantityProductInCartController = async(req, res) => {
    try {
        const cid = req.params.cid;
        const pid = req.params.pid;
        const quantity = req.body.quantity;
        const cart = await CartService.getCartByIdMongooseObj(cid)
        if (!cart) {
            return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' })
        }

        const product = cart.products.find(product => product.product == pid);
        if (!product) {
            return res.status(404).json({ status: 'error', error: 'Producto no encontrado en el carrito' })
        }
        product.quantity = quantity;
        await cart.save()
        logger.http('Someone made a PUT request to the endpoint /api/carts/:cid/products/:pid')
        res.status(200).json({ status: 'success', message: 'Cantidad de ejemplares actualizada' })
    } catch (err) {
        res.status(500).json({ status: 'error', error: err.message })
    }
}

export const deleteAllProductsFromCartController = async(req, res) => {
    try {
        const cid = req.params.cid;
        const cart = await CartService.getCartByIdMongooseObj(cid)
        if (!cart) {
            return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' })
        }
        cart.products = []
        await cart.save()
        
        let productsPopulated = await CartService.productsPopulated(cid)
        req.io.emit('productoEliminado', productsPopulated)

        logger.http('Someone made a DELETE request to the endpoint /api/carts/:cid')
        res.status(200).json({ status: 'success', message: 'Todos los productos del carrito han sido eliminados' })
    } catch (err) {
        res.status(500).json({ status: 'error', error: err.message })
    }
}

export const deleteProductFromCartController = async(req, res) => {
    try {
        const cid = req.params.cid;
        const pid = req.params.pid;
        let result = await CartService.deleteProductFromCart(cid, pid)
        if(typeof result == 'string') return res.status(400).json({ status: 'error', error: result })
        let productsPopulated = await CartService.productsPopulated(cid)
        req.io.emit('productoEliminado', productsPopulated)

        logger.http('Someone made a DELETE request to the endpoint /api/carts/:cid/products/:pid')
        return res.status(200).json({ status: 'success', message: 'Producto eliminado del carrito' });
    } catch (err) {
        res.status(500).json({ status: 'error', error: err.message });
    }
}
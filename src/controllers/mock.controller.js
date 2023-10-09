import { generateProduct } from "../utils.js";
import logger from "../utils/logger.js";

export const mockingProductsController = async(req, res) => {
    const mockProducts = [];
    for (let i = 1; i <= 100; i++) {
        mockProducts.push(generateProduct());
    }
    logger.http('Someone made a GET request to the endpoint /mockingproducts')
    return res.status(200).json({ status: 'sucess', payload: mockProducts});
}
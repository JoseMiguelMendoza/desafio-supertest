import EErros from "../services/errors/enums.js";
import logger from "../utils/logger.js";

export default (error, req, res, next) => {
    logger.info(error.cause)

    switch(error.code){
        case EErros.PRODUCT_INCOMPLETE:
            res.status(400).json({ status: 'error', error: error.name })
            break;
        case EErros.NON_EXISTENT_ID:
            res.status(400).send({ status: 'error', error: error.name })
            break;
        default:
            res.send({ status: 'error', error: 'Unhandled error'})
            break;
    }
}
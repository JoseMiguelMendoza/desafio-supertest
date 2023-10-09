import { UserService } from '../services/index.js'
import UserDTO from '../dto/Users.js'
import logger from '../utils/logger.js'

export const redirectionRegisterController = async(req, res) => {
    res.redirect('/login')
    logger.info('An user has been redirected to the view LOGIN')
} 

export const redirectionLoginController = async (req, res) => {
    const userId = req.session.passport.user
    const user = await UserService.findUserById(userId)
    if(user.role === 'Administrador/a'){
        logger.info('The user has been redirected to the view REALTIMEPRODUCTS for being an Administrator.')
        return res.redirect('/realTimeProducts')

    }
    if(user.role === 'Usuario/a'){
        logger.info('The user has been redirected to the view PRODUCTS for being a User.')
        return res.redirect('/products')
    }
}

export const destroyingSessionController = (req, res) => {
    req.session.destroy(err => {
        if(err) {
            logger.error(`Error: ${err}`)
            return res.redirect('/userError')
        } else{
            logger.info('A user has logged out.')
            return res.redirect('/login')
        } 
    })
}

export const redirectionGithubController = async(req, res) => {
    req.session.user = req.user
    logger.info('An user has been redirected to the view PRODUCTS for being a User.')
    return res.redirect('/products')
}

export const userCompleteInfoController = async(req, res) => {
    if(!req.session.passport){
        logger.info('Someone is trying to access the endpoint /api/sessions/current without logging in.')
        return res.status(401).json({
            status: 'error',
            error: 'No session detected.'
        })
    } 
    let user_data = await UserService.findUserById(req.session.passport.user)
    return res.status(200).json({ status: 'success', 
    payload: new UserDTO(user_data)
})
}
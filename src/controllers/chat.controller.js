import logger from "../utils/logger.js"
import { UserService } from "../services/index.js"

export const chatRenderController = async(req, res) => {
    logger.http('Someone made a GET request to the endpoint /chat')
    const user = await UserService.findUserById(req.session.passport.user)
    res.render('chat', {
        title: 'Chat público',
        role: user.role,
        name: user.name,
        cid: user.cart
    })
}
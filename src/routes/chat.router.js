import { Router } from 'express'
import { chatRenderController } from '../controllers/chat.controller.js'

const router = Router()

router.get('/', chatRenderController)

export default router
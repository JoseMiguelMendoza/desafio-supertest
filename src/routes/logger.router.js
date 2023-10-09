import { Router } from "express";
import { getLogsController } from "../controllers/logger.controller.js";

const router = Router()

router.get('/', getLogsController)

export default router
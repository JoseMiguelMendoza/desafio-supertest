import fs from 'fs'
import logger from '../utils/logger.js';

export const getLogsController = (req, res) => {
    fs.readFile('./src/logs/errors.log', 'utf-8', (err, data) => {
        if (err) {
            logger.error(`Error al leer el archivo de registro: ${err}`);
            return res.status(500).json({ message: 'Error al leer el archivo de registro' });
        }
        res.json({logs: data});
    })
}
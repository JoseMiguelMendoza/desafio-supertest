import winston from "winston";
import dotenv from 'dotenv'
dotenv.config()

const colors = {
    debug: 'white',
    http: 'green',
    info: 'blue',
    warning: 'yellow',
    error: 'magenta',
    fatal: 'red'
}

winston.addColors(colors)

const createLogger = env => {
    if(env == 'DES'){
        return winston.createLogger({
            levels: {
                debug: 0,
                http: 1,
                info: 2,
                warning: 3,
                error: 4,
                fatal: 5
            },
            transports: [
                new winston.transports.Console({
                    level: 'debug',
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.colorize(),
                        winston.format.simple()
                    )
                })
            ]
        })
    }else{
        return winston.createLogger({
            levels: {
                debug: 0,
                http: 1,
                info: 2,
                warning: 3,
                error: 4,
                fatal: 5
            },
            transports: [
                new winston.transports.Console({
                    level: 'info',
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.colorize(),
                        winston.format.simple()
                    )
                }),
                new winston.transports.File({
                    filename: './src/logs/errors.log',
                    level: 'error',
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.simple()
                    )
                })
            ]
        })
    }
}

const logger = createLogger(process.env.ENVIROMENT)

export default logger
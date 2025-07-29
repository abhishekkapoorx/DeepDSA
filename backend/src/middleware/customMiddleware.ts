import chalk from 'chalk';
import { Request, Response, NextFunction } from 'express';

// Extend the Request interface to include timeStamp
declare global {
    namespace Express {
        interface Request {
            timeStamp?: string;
        }
    }
}

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
   const timeStamp = new Date().toISOString();
   const method = req.method;
   const url = req.url;
   const userAgent = req.get("User-Agent");
   
   // Color-code different HTTP methods with background colors
   const coloredMethod = (() => {
       switch (method) {
           case 'GET':
               return chalk.black.bgGreen(` ${method} `);
           case 'POST':
               return chalk.black.bgYellow(` ${method} `);
           case 'PUT':
               return chalk.white.bgBlue(` ${method} `);
           case 'DELETE':
               return chalk.white.bgRed(` ${method} `);
           case 'PATCH':
               return chalk.black.bgMagenta(` ${method} `);
           default:
               return chalk.white.bgGray(` ${method} `);
       }
   })();

   console.log(
       `${coloredMethod} ${chalk.white.bgCyan(` ${url} `)} - ` 
    //    +`${chalk.black.bgWhite(` ${userAgent} `)}`
   );
   next();
};

const addTimeStamp = (req: Request, res: Response, next: NextFunction) => {
   req.timeStamp = new Date().toISOString();
   console.log(
       `${chalk.white.bgBlue(' TIMESTAMP ')} ` +
       `${chalk.black.bgWhite(` Added: ${req.timeStamp} `)}`
   );
   next();
};

export { requestLogger, addTimeStamp };
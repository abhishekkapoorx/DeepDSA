import { Request, Response, NextFunction } from 'express';

const urlVersioning = (version: string) => (req: Request, res: Response, next: NextFunction) => {
    if (req.baseUrl.includes(`/${version}`)) {
      next();
    } else {
      res.status(404).json({
        success: false,
        error: "API version is not supported",
      });
    }
  };
  
    
    const headerVersioning = (version: string) => (req: Request, res: Response, next: NextFunction) => {
      if (req.get("Accept-Version") === version) {
        next();
      } else {
        res.status(404).json({
          success: false,
          error: "API version is not supported",
        });
      }
    };
    
    const contentTypeVersioning = (version: string) => (req: Request, res: Response, next: NextFunction) => {
      const contentType = req.get("Content-Type");
    
      if (
        contentType &&
        contentType.includes(`application/vnd.api.${version}+json`)
      ) {
        next();
      } else {
        res.status(404).json({
          success: false,
          error: "API version is not supported",
        });
      }
    };
    
  export { urlVersioning, headerVersioning, contentTypeVersioning };
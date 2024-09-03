import { Injectable, Next, Req, Res } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { AdminService } from '../admin/admin.service';

@Injectable()
export class AuthMiddleware {
  constructor(private readonly adminService: AdminService) {}

  async use(@Req() req: any, @Res() res: Response, @Next() next: NextFunction) {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        status: 401,
        error: 'Token not found!',
      });
    }

    try {
      const admin = this.adminService.verifyToken(token);

      if (!admin) {
        return res.status(401).json({
          success: false,
          status: 401,
          error: 'Invalid token!',
        });
      }

      req.user = admin._doc;

      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        status: 401,
        error: 'Invalid token!',
      });
    }
  }
}

import { Controller, Get, Post, Body, Req, Res } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Request, Response } from 'express';

@Controller('server/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('profile')
  async profile(@Req() req: any, @Res() res: Response) {
    const { _id } = req.user;

    try {
      const user = await this.adminService.getLoggedInUser(_id);
      return res.status(200).json({
        success: true,
        status: 200,
        data: user,
        message: 'Profile data successfully acquired!',
      });
    } catch (err) {
      return res.status(err.getStatus()).json({
        success: false,
        status: err.getStatus(),
        error: err.message,
      });
    }
  }
  @Post('signup')
  async googleSignup(
    @Req() req: Request,
    @Res() res: Response,
    @Body() userData: { email: string; username: string; profilePic: string },
  ) {
    try {
      const user = await this.adminService.register(userData);
      return res.status(201).json({
        success: true,
        status: 201,
        data: user,
        message: 'You have successfully registered!',
      });
    } catch (err) {
      return res.status(err.getStatus()).json({
        success: false,
        status: err.getStatus(),
        error: err.message,
      });
    }
  }

  @Post('login')
  async googleLogin(
    @Req() req: Request,
    @Res() res: Response,
    @Body() userData: { email: string },
  ) {
    const { email } = userData;

    try {
      const user = await this.adminService.login(email);

      // Generate Token
      const token = await this.adminService.generateToken({ ...user });

      return res
        .status(200)
        .cookie('token', token, {
          maxAge: 30 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          sameSite: 'none',
          secure: true,
        })
        .json({
          success: true,
          status: 200,
          data: user,
          message: 'You have successfully LoggedIn!',
        });
    } catch (err) {
      return res.status(err.getStatus?.() || 500).json({
        success: false,
        status: err.getStatus?.() || 500,
        error: err.message,
      });
    }
  }

  @Get('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    return res
      .status(200)
      .clearCookie('token', {
        sameSite: 'none',
        secure: true,
      })
      .json({
        success: true,
        status: 200,
        message: 'You have successfully LoggedOut!',
      });
  }
}

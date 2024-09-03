import { Controller, Delete, Get, Patch, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserService } from './user.service';

@Controller('server/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('find')
  async getUsers(@Req() req: Request, @Res() res: Response) {
    try {
      const users = await this.userService.getUsers();
      return res.status(200).json({
        success: true,
        status: 200,
        data: users,
        message: 'All users fetched successfully',
      });
    } catch (err) {
      return res.status(err.getStatus()).json({
        success: false,
        status: err.getStatus(),
        error: err.message,
      });
    }
  }

  @Get('delete/:id')
  async deleteUser(@Req() req: Request, @Res() res: Response) {
    const { id } = req.params;
    try {
      const deletedUser = await this.userService.deleteUser(id);
      return res.status(200).json({
        success: true,
        status: 200,
        data: deletedUser,
        message: 'User deleted successfully',
      });
    } catch (err) {
      return res.status(err.getStatus()).json({
        success: false,
        status: err.getStatus(),
        error: err.message,
      });
    }
  }

  @Get('block/:id')
  async blockUser(@Req() req: Request, @Res() res: Response) {
    const { id } = req.params;
    try {
      const blockedUser = await this.userService.blockUser(id);
      return res.status(200).json({
        success: true,
        status: 200,
        data: blockedUser,
        message: 'User blocked successfully',
      });
    } catch (err) {
      return res.status(err.getStatus()).json({
        success: false,
        status: err.getStatus(),
        error: err.message,
      });
    }
  }

  @Get('unblock/:id')
  async unblockUser(@Req() req: Request, @Res() res: Response) {
    const { id } = req.params;
    try {
      const unblockedUser = await this.userService.unblockUser(id);
      return res.status(200).json({
        success: true,
        status: 200,
        data: unblockedUser,
        message: 'User unblocked successfully',
      });
    } catch (err) {
      return res.status(err.getStatus()).json({
        success: false,
        status: err.getStatus(),
        error: err.message,
      });
    }
  }
}

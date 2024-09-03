import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Admin, AdminDocument } from './admin.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private AdminModel: Model<AdminDocument>,
  ) {}
  // register
  async register(userData: {
    username: string;
    email: string;
    profilePic: string;
  }): Promise<Admin> {
    const { username, email, profilePic } = userData;

    if (!username || !email || !profilePic) {
      throw new BadRequestException('All fields are required.');
    }

    try {
      const admin = await this.AdminModel.findOne({ email });

      if (admin) {
        throw new ConflictException('Email already registered!');
      }

      const newAdmin = new this.AdminModel(userData);
      await newAdmin.save();

      return newAdmin;
    } catch (err) {
      if (err instanceof ConflictException) {
        throw err;
      }

      throw new InternalServerErrorException('Internal server error!');
    }
  }

  // login
  async login(email: string): Promise<Admin> {
    if (!email) {
      throw new BadRequestException('Email is required to login!');
    }

    try {
      const admin = await this.AdminModel.findOne({ email });
      if (!admin) {
        throw new NotFoundException('Email is not registered!');
      }

      return admin;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new InternalServerErrorException('Internal server error!');
    }
  }

  // user Log in
  async getLoggedInUser(userId: string) {
    if (!userId) {
      throw new BadRequestException('User id is required!');
    }

    try {
      const user = await this.AdminModel.findById(userId).select('-password');
      if (!user) {
        throw new NotFoundException('User not found!');
      }
      return user;
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      throw new InternalServerErrorException('Internal server error!');
    }
  }
  // for generating token
  generateToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
  }

  // for verifying token
  verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
}

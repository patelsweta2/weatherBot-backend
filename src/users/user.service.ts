import {
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(userData: {
    name: string;
    chatId: string;
    city: string;
  }): Promise<User> {
    const { name, chatId, city } = userData;
    try {
      const newUser = new this.userModel({ name, chatId, city });
      await newUser.save();
      return newUser;
    } catch (error) {
      throw new InternalServerErrorException('Subscription failed');
    }
  }

  async userExists(chatId: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ chatId });
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Something went wrong!');
    }
  }
  // admin will controll this service
  async deleteUser(id: string): Promise<User> {
    if (!id) {
      throw new BadRequestException('Id is required to delete user.');
    }
    try {
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new NotFoundException('User not found !!');
      }
      const deletedUser = await this.userModel.findByIdAndDelete(id);
      return deletedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error!');
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      const users = await this.userModel.find();
      return users;
    } catch (error) {
      throw new InternalServerErrorException('Internal server error !');
    }
  }

  async subscribeUser(chatId: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ chatId });

      if (user.isBlocked) {
        throw new ForbiddenException(
          'Oops You are blocked. Yon can contact with admin',
        );
      }
      if (user.isSubscribed) {
        throw new ConflictException('Hey, You already a member of this bot');
      }
      user.isSubscribed = true;
      await user.save();
      return user;
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Subscription failed!');
    }
  }

  async unsubscribeUser(chatId: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ chatId });

      // Already blocked
      if (user.isBlocked) {
        throw new ForbiddenException(
          'Oops You are blocked. Yon can contact with admin',
        );
      }

      // Already unsubscribed
      if (!user.isSubscribed) {
        throw new ConflictException('Hey, You have already unsubscribed.');
      }

      user.isSubscribed = false;
      const unsubscribedUser = await user.save();
      return unsubscribedUser;
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Unsubscription failed!');
    }
  }

  async getUserByChatId(chatId: number): Promise<User | null> {
    return this.userModel.findOne({ chatId }).exec();
  }

  async blockUser(id: string): Promise<User> {
    if (!id) {
      throw new BadRequestException('Oop , Id is missing');
    }

    try {
      const user = await this.userModel.findById(id);

      if (!user) {
        throw new NotFoundException('User not found!');
      }

      if (user.isBlocked) {
        throw new ConflictException('User is already blocked!');
      }

      user.isBlocked = true;
      const blockedUser = await user.save();
      return blockedUser;
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof ConflictException
      ) {
        throw err;
      }

      throw new InternalServerErrorException('Internal server error!');
    }
  }

  async unblockUser(id: string): Promise<User> {
    if (!id) {
      throw new BadRequestException('Oop , Id is missing');
    }

    try {
      const user = await this.userModel.findById(id);

      if (!user) {
        throw new NotFoundException('User not found!');
      }

      if (!user.isBlocked) {
        throw new ConflictException('User is already unblocked!');
      }

      user.isBlocked = false;
      const unblockedUser = await user.save();
      return unblockedUser;
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof ConflictException
      ) {
        throw err;
      }

      throw new InternalServerErrorException('Internal server error!');
    }
  }
}

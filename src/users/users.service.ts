import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDTO, UpdateUserDTO, UserDTO } from './dto/users.dto';
import { prisma } from 'prisma/client';
import { AuthenticationService } from 'src/authentication/authentication.service';

@Injectable()
export class UsersService {
  constructor(private authenticationService: AuthenticationService) {}
  async createUser(createUserDTO: CreateUserDTO): Promise<UserDTO> {
    const user = await prisma.user.create({
      data: createUserDTO,
    });

    const tokenPair = this.authenticationService.generateTokenPair({
      name: user.name,
      email: user.email,
    });

    const userWithToken: UserDTO = {
      ...user,
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
    };

    return userWithToken;
  }

  async findUserById(userId: number): Promise<UserDTO> {
    return await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
  }

  async findUserByEmail(email: string): Promise<UserDTO> {
    return await prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async updateUser(
    userId: number,
    updateUserData: UpdateUserDTO,
  ): Promise<UserDTO> {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: updateUserData,
    });
  }

  async deleteUser(userId: number): Promise<UserDTO> {
    return await prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }

  async signIn(email: string, password: string): Promise<UserDTO> {
    const user = await this.findUserByEmail(email);

    if (user.password !== password) {
      throw new UnauthorizedException();
    }

    const tokenPair = this.authenticationService.generateTokenPair({
      name: user.name,
      email: user.email,
    });

    return {
      ...user,
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
    };
  }
}

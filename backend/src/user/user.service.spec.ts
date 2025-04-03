/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { hash, compare } from 'bcrypt';
import { LoginResponse, UserPayload } from './interface/user-login.interface';

const mockPrismaService = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
};

const mockJwtService = {
  signAsync: jest.fn(),
};

const mockHash = jest.fn();
const mockCompare = jest.fn();

jest.mock('bcrypt', () => ({
  hash: (...args: any[]) => mockHash(...args),
  compare: (...args: any[]) => mockCompare(...args),
}));

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset the mocks before each test
    mockPrismaService.user.create.mockReset();
    mockPrismaService.user.findUnique.mockReset();
    mockJwtService.signAsync.mockReset();
    mockHash.mockReset();
    mockCompare.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerUser', () => {
    const createUserDto: CreateUserDto = {
      name: 'Test User',
      userName: 'testuser',
      password: 'password',
    };
    const hashedPassword = 'hashedPassword';
    const mockCreatedUser: any = {
      id: 1,
      name: 'Test User',
      userName: 'testuser',
      password: hashedPassword,
    };

    beforeEach(() => {
      mockHash.mockResolvedValue(hashedPassword);
    });

    it('should register a new user successfully', async () => {
      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);

      const result = await service.registerUser(createUserDto);

      expect(mockHash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          userName: createUserDto.userName,
          password: hashedPassword,
          name: createUserDto.name,
        },
      });
      expect(result).toEqual({
        id: 1,
        name: 'Test User',
        userName: 'testuser',
      });
    });

    it('should throw ConflictException if the username is already registered', async () => {
      mockPrismaService.user.create.mockRejectedValue({ code: 'P2002' });

      await expect(service.registerUser(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockHash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          userName: createUserDto.userName,
          password: hashedPassword,
          name: createUserDto.name,
        },
      });
    });

    it('should throw the original error if prisma.user.create fails with a non-P2002 error', async () => {
      const errorMessage = 'Database error';
      mockPrismaService.user.create.mockRejectedValue(new Error(errorMessage));

      await expect(service.registerUser(createUserDto)).rejects.toThrow(
        errorMessage,
      );
      expect(mockHash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          userName: createUserDto.userName,
          password: hashedPassword,
          name: createUserDto.name,
        },
      });
    });
  });

  describe('loginUser', () => {
    const loginUserDto: LoginUserDto = {
      userName: 'testuser',
      password: 'password',
    };
    const mockExistingUser: any = {
      id: 1,
      name: 'Test User',
      userName: 'testuser',
      password: 'hashedPassword',
    };
    const mockInvalidPasswordUser: User = {
      ...mockExistingUser,
      password: 'wrongHashedPassword',
    };
    const mockPayload: UserPayload = {
      sub: 1,
      name: 'Test User',
      userName: 'testuser',
    };
    const mockToken = 'mockGeneratedToken';

    beforeEach(() => {
      mockJwtService.signAsync.mockResolvedValue(mockToken);
    });

    it('should log in an existing user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockExistingUser);
      mockCompare.mockResolvedValue(true);

      const result = await service.loginUser(loginUserDto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { userName: loginUserDto.userName },
      });
      expect(mockCompare).toHaveBeenCalledWith(
        loginUserDto.password,
        mockExistingUser.password,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith(mockPayload);
      expect(result).toEqual({
        name: 'Test User',
        userName: 'testuser',
        token: mockToken,
      });
    });

    it('should throw NotFoundException if the user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.loginUser(loginUserDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { userName: loginUserDto.userName },
      });
      expect(mockCompare).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if the password is incorrect', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockExistingUser);
      mockCompare.mockResolvedValue(false);

      await expect(service.loginUser(loginUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { userName: loginUserDto.userName },
      });
      expect(mockCompare).toHaveBeenCalledWith(
        loginUserDto.password,
        mockExistingUser.password,
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw the original error if prisma.user.findUnique fails', async () => {
      const errorMessage = 'Database error';
      mockPrismaService.user.findUnique.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(service.loginUser(loginUserDto)).rejects.toThrow(
        errorMessage,
      );
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { userName: loginUserDto.userName },
      });
      expect(mockCompare).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should handle errors during token generation', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockExistingUser);
      mockCompare.mockResolvedValue(true);
      mockJwtService.signAsync.mockRejectedValue(new Error('JWT error'));

      await expect(service.loginUser(loginUserDto)).rejects.toThrow(
        'JWT error',
      );
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { userName: loginUserDto.userName },
      });
      expect(mockCompare).toHaveBeenCalledWith(
        loginUserDto.password,
        mockExistingUser.password,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith(mockPayload);
    });
  });
});

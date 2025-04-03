import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import {
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { LoginResponse } from './interface/user-login.interface';
import { JwtService } from '@nestjs/jwt';

const mockUserService = {
  registerUser: jest.fn(),
  loginUser: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('loginUser', () => {
    it('should call userService.loginUser and return success response with token', async () => {
      const loginUserDto: LoginUserDto = {
        userName: 'testuser',
        password: 'password',
      };
      const mockLoginResponse: LoginResponse = {
        name: 'Test User',
        userName: 'testuser',
        token: 'mockToken',
      };
      const res = mockResponse();

      (service.loginUser as jest.Mock).mockResolvedValue(mockLoginResponse);

      await controller.loginUser(res, loginUserDto);

      expect(service.loginUser).toHaveBeenCalledWith(loginUserDto);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: StatusCodes.OK,
        message: 'Successfully authenticated',
        body: {
          ...mockLoginResponse,
        },
      });
    });

    it('should handle NotFoundException from userService', async () => {
      const loginUserDto: LoginUserDto = {
        userName: 'nonexistent',
        password: 'password',
      };
      const res = mockResponse();
      const errorMessage = 'User not found';

      (service.loginUser as jest.Mock).mockRejectedValue(
        new NotFoundException(errorMessage),
      );

      await controller.loginUser(res, loginUserDto);

      expect(service.loginUser).toHaveBeenCalledWith(loginUserDto);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        message: errorMessage,
        error: getReasonPhrase(StatusCodes.NOT_FOUND),
        statusCode: StatusCodes.NOT_FOUND,
      });
    });

    it('should handle UnauthorizedException from userService', async () => {
      const loginUserDto: LoginUserDto = {
        userName: 'testuser',
        password: 'wrongpassword',
      };
      const res = mockResponse();
      const errorMessage = 'Invalid credentials';

      (service.loginUser as jest.Mock).mockRejectedValue(
        new UnauthorizedException(errorMessage),
      );

      await controller.loginUser(res, loginUserDto);

      expect(service.loginUser).toHaveBeenCalledWith(loginUserDto);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith({
        message: errorMessage,
        error: getReasonPhrase(StatusCodes.UNAUTHORIZED),
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    });

    it('should handle generic errors from userService', async () => {
      const loginUserDto: LoginUserDto = {
        userName: 'testuser',
        password: 'password',
      };
      const res = mockResponse();
      const errorMessage = 'Something went wrong in the service';

      (service.loginUser as jest.Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      await controller.loginUser(res, loginUserDto);

      expect(service.loginUser).toHaveBeenCalledWith(loginUserDto);
      expect(res.status).toHaveBeenCalledWith(
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
      expect(res.json).toHaveBeenCalledWith({
        message: 'Something went wrong',
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe('registerEmployeeUser', () => {
    it('should call userService.registerUser and return success response with new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'New User',
        userName: 'newuser',
        password: 'password',
      };
      const mockNewUser = { id: 1, name: 'New User', userName: 'newuser' };
      const res = mockResponse();

      (service.registerUser as jest.Mock).mockResolvedValue(mockNewUser);

      await controller.registerEmployeeUser(res, createUserDto);

      expect(service.registerUser).toHaveBeenCalledWith(createUserDto);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: StatusCodes.OK,
        message: 'Successfully registered',
        body: {
          newUser: mockNewUser,
        },
      });
    });

    it('should handle ConflictException from userService', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Existing User',
        userName: 'existinguser',
        password: 'password',
      };
      const res = mockResponse();
      const errorMessage = 'User Name already registered';

      (service.registerUser as jest.Mock).mockRejectedValue(
        new ConflictException(errorMessage),
      );

      await controller.registerEmployeeUser(res, createUserDto);

      expect(service.registerUser).toHaveBeenCalledWith(createUserDto);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.CONFLICT);
      expect(res.json).toHaveBeenCalledWith({
        message: errorMessage,
        error: getReasonPhrase(StatusCodes.CONFLICT),
        statusCode: StatusCodes.CONFLICT,
      });
    });

    it('should handle generic errors from userService', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Problem User',
        userName: 'problemuser',
        password: 'password',
      };
      const res = mockResponse();
      const errorMessage = 'Something went wrong during registration';

      (service.registerUser as jest.Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      await controller.registerEmployeeUser(res, createUserDto);

      expect(service.registerUser).toHaveBeenCalledWith(createUserDto);
      expect(res.status).toHaveBeenCalledWith(
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
      expect(res.json).toHaveBeenCalledWith({
        message: 'Something went wrong',
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    });
  });
});

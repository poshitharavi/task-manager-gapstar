import {
  Body,
  ConflictException,
  Controller,
  Logger,
  NotFoundException,
  Post,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { Public } from "../common/decorators/public.decorator";
import { LoginUserDto } from "./dtos/login-user.dto";
import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { Response } from "express";
import { CreateUserDto } from "./dtos/create-user.dto";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

@ApiTags("user")
@Controller("user")
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Public()
  @Post("login")
  @ApiOperation({ summary: "Login a registered user" })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: StatusCodes.OK,
    description: "Successfully authenticated",
    schema: {
      example: {
        statusCode: StatusCodes.OK,
        message: "Successfully authenticated",
        body: {
          name: "Adam",
          userName: "adam",
          token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJOYW1lIjoiYWRhbSIsIm5hbWUiOiJBZGFtIiwiaWF0IjoxNzQzNzg0NjUxLCJleHAiOjE3NDM4Mjc4NTF9.qtkUY6kuW-8YUN9vAl51M6NH3txfEs8PfDwoEJHJgzs",
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: "Invalid credentials",
    schema: {
      example: {
        message: "Invalid credentials",
        error: getReasonPhrase(StatusCodes.UNAUTHORIZED),
        statusCode: StatusCodes.UNAUTHORIZED,
      },
    },
  })
  @ApiNotFoundResponse({
    description: "User not found",
    schema: {
      example: {
        message: "User not found",
        error: getReasonPhrase(StatusCodes.NOT_FOUND),
        statusCode: StatusCodes.NOT_FOUND,
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: "Something went wrong during login",
    schema: {
      example: {
        message: "Something went wrong",
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      },
    },
  })
  async loginUser(
    @Res() response: Response,
    @Body() loginUserDto: LoginUserDto
  ): Promise<any> {
    try {
      const loginRes = await this.userService.loginUser(loginUserDto);

      return response.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Successfully authenticated",
        body: {
          ...loginRes,
        },
      });
    } catch (error) {
      this.logger.error(`Error at /user/login: ${error}`);
      if (error instanceof UnauthorizedException) {
        return response.status(StatusCodes.UNAUTHORIZED).json({
          message: error.message,
          error: getReasonPhrase(StatusCodes.UNAUTHORIZED),
          statusCode: StatusCodes.UNAUTHORIZED,
        });
      }

      if (error instanceof NotFoundException) {
        return response.status(StatusCodes.NOT_FOUND).json({
          message: error.message,
          error: getReasonPhrase(StatusCodes.NOT_FOUND),
          statusCode: StatusCodes.NOT_FOUND,
        });
      }
      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Something went wrong",
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Public()
  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: "Successfully registered",
    schema: {
      example: {
        statusCode: StatusCodes.OK,
        message: "Successfully registered",
        body: {
          newUser: {
            id: 3,
            userName: "sample",
            name: "Sample",
            createdAt: "2025-04-04T16:38:01.123Z",
            updatedAt: "2025-04-04T16:38:01.123Z",
          },
        },
      },
    },
  })
  @ApiConflictResponse({
    description: "User with this email already exists",
    schema: {
      example: {
        message: "User with this email already exists",
        error: getReasonPhrase(StatusCodes.CONFLICT),
        statusCode: StatusCodes.CONFLICT,
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: "Something went wrong during registration",
    schema: {
      example: {
        message: "Something went wrong",
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      },
    },
  })
  async registerEmployeeUser(
    @Res() response: Response,
    @Body() createUserDto: CreateUserDto
  ): Promise<any> {
    try {
      const newUser = await this.userService.registerUser(createUserDto);

      return response.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Successfully registered",
        body: {
          newUser,
        },
      });
    } catch (error) {
      this.logger.error(`Error at /user/register: ${error.message}`);
      if (error instanceof ConflictException) {
        return response.status(StatusCodes.CONFLICT).json({
          message: error.message,
          error: getReasonPhrase(StatusCodes.CONFLICT),
          statusCode: StatusCodes.CONFLICT,
        });
      }
      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Something went wrong",
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }
}

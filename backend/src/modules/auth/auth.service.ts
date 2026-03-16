import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    try {
      const user = await this.userService.findOneByEmail(email);
      // compare the input pass with user actual password
      if (user && (await bcrypt.compare(pass, user.password))) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.validateUser(loginDto.email, loginDto.password);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const payload = {
        email: user.email,
        sub: user.id,
        role: user.role,
        name: user.name,
      };
      const access_token = this.jwtService.sign(payload, { expiresIn: '10m' });
      const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' }); // Set refresh token expiration as needed
      return {
        access_token,
        refresh_token,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async register(registerDto: RegisterDto) {
    try {
      const user = await this.userService.register(registerDto);
      const payload = {
        email: user.email,
        sub: user.id,
        role: user.role,
        name: user.name,
      };
      const access_token = this.jwtService.sign(payload, { expiresIn: '10m' });
      const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });
      return {
        access_token,
        refresh_token,
      };
    } catch (error) {
      throw new UnauthorizedException('Failed to register user');
    }
  }

  
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const newAccessToken = this.jwtService.sign(
        {
          email: payload.email,
          sub: payload.sub,
          role: payload.role,
          name: payload.name,
        },
        { expiresIn: '10m' }
      );
      return {
        access_token: newAccessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async verifyToken(token: string) {
    return this.jwtService.verify(token);
  }
}

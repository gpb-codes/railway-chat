import { Controller, Get, Put, Body, Query, UseGuards, Request, Param, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/users.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@Request() req) {
    return this.usersService.findById(req.user.sub);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('me')
  updateMe(@Request() req, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(req.user.sub, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('search')
  search(@Query('q') q: string) {
    return this.usersService.searchByUsername(q || '');
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}

import { Controller, Get, Put, Body, Query, UseGuards, Request, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

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
  updateMe(@Request() req, @Body() body: { avatar?: string; bio?: string; status?: string }) {
    return this.usersService.updateProfile(req.user.sub, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('search')
  search(@Query('q') q: string) {
    return this.usersService.searchByUsername(q || '');
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}

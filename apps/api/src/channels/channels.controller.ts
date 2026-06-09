import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChannelsService } from './channels.service';

@Controller('channels')
@UseGuards(AuthGuard('jwt'))
export class ChannelsController {
  constructor(private channelsService: ChannelsService) {}

  @Get()
  findAll(@Request() req) {
    return this.channelsService.findAll(req.user.sub);
  }

  @Post()
  create(@Request() req, @Body() body: { name: string; type?: string }) {
    return this.channelsService.create(body.name, req.user.sub, body.type);
  }

  @Post(':id/join')
  join(@Param('id') id: string, @Request() req) {
    return this.channelsService.join(id, req.user.sub);
  }

  @Delete(':id/leave')
  leave(@Param('id') id: string, @Request() req) {
    return this.channelsService.leave(id, req.user.sub);
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string) {
    return this.channelsService.getMembers(id);
  }

  @Post('dm/:userId')
  createDM(@Param('userId') userId: string, @Request() req) {
    return this.channelsService.createDM(req.user.sub, userId);
  }
}

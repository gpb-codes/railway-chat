import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/channels.dto';

@Controller('channels')
@UseGuards(AuthGuard('jwt'))
export class ChannelsController {
  constructor(private channelsService: ChannelsService) {}

  @Get()
  findAll(@Request() req) {
    return this.channelsService.findAll(req.user.sub);
  }

  @Post()
  create(@Request() req, @Body() dto: CreateChannelDto) {
    return this.channelsService.create(dto.name, req.user.sub, dto.type);
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
  async getMembers(@Param('id') id: string) {
    const members = await this.channelsService.getMembers(id);
    return members;
  }

  @Post('dm/:userId')
  createDM(@Param('userId') userId: string, @Request() req) {
    return this.channelsService.createDM(req.user.sub, userId);
  }
}

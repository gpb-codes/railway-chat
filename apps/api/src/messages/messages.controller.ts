import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MessagesService } from './messages.service';

@Controller('messages')
@UseGuards(AuthGuard('jwt'))
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post()
  create(@Request() req, @Body() body: { channelId: string; content: string; type?: string; parentId?: string }) {
    return this.messagesService.create(req.user.sub, body.channelId, body.content, body.type, body.parentId);
  }

  @Get('channel/:channelId')
  findByChannel(
    @Param('channelId') channelId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.messagesService.findByChannel(channelId, cursor, limit ? parseInt(limit) : 50);
  }

  @Get('search/:channelId')
  search(@Param('channelId') channelId: string, @Query('q') q: string) {
    return this.messagesService.search(channelId, q || '');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messagesService.findById(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req) {
    return this.messagesService.delete(id, req.user.sub);
  }
}

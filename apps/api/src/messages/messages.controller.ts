import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/messages.dto';

@Controller('messages')
@UseGuards(AuthGuard('jwt'))
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateMessageDto) {
    const message = await this.messagesService.create(
      req.user.sub,
      dto.channelId,
      dto.content,
      'text',
      dto.parentId,
    );
    return message;
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
  async findOne(@Param('id') id: string) {
    const message = await this.messagesService.findById(id);
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    return message;
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    const result = await this.messagesService.delete(id, req.user.sub);
    if (!result) {
      throw new NotFoundException('Message not found or not authorized');
    }
    return { success: true };
  }
}

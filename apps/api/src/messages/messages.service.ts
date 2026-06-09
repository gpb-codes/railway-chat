import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, channelId: string, content: string, type: string = 'text', parentId?: string) {
    return this.prisma.message.create({
      data: {
        content,
        type,
        userId,
        channelId,
        parentId,
      },
      include: {
        user: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });
  }

  async findByChannel(channelId: string, cursor?: string, limit: number = 50) {
    const where: any = { channelId };

    if (cursor) {
      where.createdAt = { lt: new Date(cursor) };
    }

    const messages = await this.prisma.message.findMany({
      where,
      include: {
        user: {
          select: { id: true, username: true, avatar: true },
        },
        replies: {
          include: {
            user: {
              select: { id: true, username: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'asc' },
          take: 5,
        },
        _count: { select: { replies: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return messages.reverse();
  }

  async findById(id: string) {
    return this.prisma.message.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, username: true, avatar: true },
        },
        replies: {
          include: {
            user: {
              select: { id: true, username: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async search(channelId: string, query: string) {
    return this.prisma.message.findMany({
      where: {
        channelId,
        content: { contains: query, mode: 'insensitive' },
      },
      include: {
        user: {
          select: { id: true, username: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async delete(id: string, userId: string) {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message || message.userId !== userId) return null;
    return this.prisma.message.delete({ where: { id } });
  }
}

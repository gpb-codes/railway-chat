import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChannelsService {
  constructor(private prisma: PrismaService) {}

  async create(name: string, userId: string, type: string = 'public') {
    const channel = await this.prisma.channel.create({
      data: { name, type },
    });

    await this.prisma.channelMember.create({
      data: { userId, channelId: channel.id, role: 'admin' },
    });

    return channel;
  }

  async findAll(userId: string) {
    const memberChannels = await this.prisma.channelMember.findMany({
      where: { userId },
      include: {
        channel: {
          include: {
            _count: { select: { members: true, messages: true } },
          },
        },
      },
    });

    const publicChannels = await this.prisma.channel.findMany({
      where: { type: 'public', NOT: { members: { some: { userId } } } },
      include: { _count: { select: { members: true, messages: true } } },
    });

    return {
      joined: memberChannels.map(m => ({ ...m.channel, role: m.role })),
      available: publicChannels,
    };
  }

  async join(channelId: string, userId: string) {
    const channel = await this.prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel) throw new NotFoundException('Canal no encontrado');

    const existing = await this.prisma.channelMember.findUnique({
      where: { userId_channelId: { userId, channelId } },
    });
    if (existing) return existing;

    return this.prisma.channelMember.create({
      data: { userId, channelId },
    });
  }

  async leave(channelId: string, userId: string) {
    await this.prisma.channelMember.deleteMany({
      where: { userId, channelId },
    });
    return { left: true };
  }

  async getMembers(channelId: string) {
    return this.prisma.channelMember.findMany({
      where: { channelId },
      include: {
        user: {
          select: { id: true, username: true, avatar: true, status: true },
        },
      },
    });
  }

  async createDM(userId1: string, userId2: string) {
    const existing = await this.prisma.channel.findFirst({
      where: {
        type: 'dm',
        AND: [
          { members: { some: { userId: userId1 } } },
          { members: { some: { userId: userId2 } } },
        ],
      },
    });

    if (existing) return existing;

    const channel = await this.prisma.channel.create({
      data: {
        name: `dm-${userId1}-${userId2}`,
        type: 'dm',
      },
    });

    await this.prisma.channelMember.createMany({
      data: [
        { userId: userId1, channelId: channel.id, role: 'admin' },
        { userId: userId2, channelId: channel.id, role: 'admin' },
      ],
    });

    return channel;
  }

  async findById(channelId: string) {
    return this.prisma.channel.findUnique({
      where: { id: channelId },
      include: {
        _count: { select: { members: true, messages: true } },
      },
    });
  }
}

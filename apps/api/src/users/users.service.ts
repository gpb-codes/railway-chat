import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, username: true, avatar: true, bio: true, status: true, createdAt: true },
    });
  }

  async updateProfile(userId: string, data: { avatar?: string; bio?: string; status?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, username: true, avatar: true, bio: true, status: true },
    });
  }

  async searchByUsername(query: string) {
    return this.prisma.user.findMany({
      where: { username: { contains: query, mode: 'insensitive' } },
      select: { id: true, username: true, avatar: true, status: true },
      take: 20,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, username: true, avatar: true, status: true },
    });
  }
}

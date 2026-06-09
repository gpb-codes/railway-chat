import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsUUID()
  channelId: string;

  @IsString()
  @MaxLength(5000)
  content: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class SearchMessagesDto {
  @IsString()
  q: string;
}

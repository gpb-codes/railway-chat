import { IsString, IsOptional, IsIn, MaxLength, MinLength } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsIn(['public', 'dm'])
  type?: string;
}

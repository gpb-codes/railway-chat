import { IsOptional, IsString, MaxLength, IsIn } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  bio?: string;

  @IsOptional()
  @IsIn(['online', 'away', 'busy', 'offline'])
  status?: string;
}

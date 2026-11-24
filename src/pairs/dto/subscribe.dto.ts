import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class subscribeToLedgerEntriesDto {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  contractId: string[];
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  keyXdr: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  durability: string;
  @ApiProperty()
  @IsOptional()
  hydrate?: boolean;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  topic1?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  topic2?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  topic3?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  topic4?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  maxSingleSize?: string;
}
export class UpdateAdminDto extends PartialType(subscribeToLedgerEntriesDto) {}

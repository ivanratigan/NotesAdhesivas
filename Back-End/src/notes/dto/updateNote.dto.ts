import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { CreateNoteDto } from './createNote.dto';

export class UpdateNoteDto extends PartialType(CreateNoteDto) {
  @ApiPropertyOptional({
    example: 15,
    description: 'Minutos de validez iniciales',
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  initialMinutes?: number;

  @ApiPropertyOptional({
    example: 1740000000000,
    description: 'Timestamp de creación o reinicio en milisegundos (Date.now())',
  })
  @IsOptional()
  @IsNumber()
  createdAt?: number;

  @ApiPropertyOptional({
    example: false,
    description: 'Indica si la nota cumplió su validez',
  })
  @IsOptional()
  @IsBoolean()
  expired?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Indica si ya se mostró la notificación del navegador',
  })
  @IsOptional()
  @IsBoolean()
  finished?: boolean;
}
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsPositive, MinLength } from 'class-validator';

export class CreateNoteDto {
    @ApiProperty({
        example: 'Comprar insumos de laboratorio',
        description: 'Título descriptivo de la nota adhesiva',
        minLength: 1,
    })
    @IsString()
    @MinLength(1)
    title: string;

    @ApiProperty({
        example: 'Ir a la farmacia antes de las 18hs',
        description: 'Detalle o contenido adicional de la nota',
    })
    @IsString()
    text: string;

    @ApiProperty({
        example: 'yellow',
        description: 'Color de fondo (yellow, green, blue, pink, purple, orange)',
        default: 'yellow',
    })
    @IsString()
    color: string;

    @ApiProperty({
        example: 15,
        description: 'Tiempo de validez en minutos antes de activar el recordatorio',
        minimum: 1,
    })
    @IsInt()
    @IsPositive()
    minutes: number;
}
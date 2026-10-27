import { ApiProperty } from '@nestjs/swagger';

export class Note {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Identificador único UUID de la nota adhesiva',
  })
  id: string;

  @ApiProperty({
    example: 'Comprar insumos de laboratorio',
    description: 'Título de la nota adhesiva',
  })
  title: string;

  @ApiProperty({
    example: 'Ir a la farmacia antes de las 18hs',
    description: 'Contenido o descripción de la nota',
  })
  text: string;

  @ApiProperty({
    example: 'yellow',
    description: 'Color de fondo seleccionado (yellow, green, blue, pink, purple, orange)',
  })
  color: string;

  @ApiProperty({
    example: 15,
    description: 'Duración de validez en minutos',
  })
  initialMinutes: number;

  @ApiProperty({
    example: 1740000000000,
    description: 'Marca temporal de creación en milisegundos (Date.now())',
  })
  createdAt: number;

  @ApiProperty({
    example: false,
    description: 'Indica si la nota ya superó su tiempo de validez',
  })
  expired: boolean;

  @ApiProperty({
    example: false,
    description: 'Indica si la notificación ya fue emitida y completada',
  })
  finished: boolean;
}
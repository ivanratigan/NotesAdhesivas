import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';

import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/createNote.dto';
import { UpdateNoteDto } from './dto/updateNote.dto';
import { Note } from './entities/note.entity';

@ApiTags('notes')
@Controller('notes')
export class NotesController {
    constructor(
        private readonly notesService: NotesService,
    ) { }

    @Post()
    @ApiOperation({
        summary: 'Crear una nueva nota adhesiva',
        description: 'Registra una nota con su título, texto, color y minutos de validez.',
    })
    @ApiCreatedResponse({
        description: 'Nota creada exitosamente.',
        type: Note,
    })
    @ApiBadRequestResponse({
        description: 'Cuerpo de la petición inválido o faltan campos obligatorios.',
    })
    createNote(@Body() createNoteDto: CreateNoteDto): Promise<Note> {
        return this.notesService.createNote(createNoteDto);
    }

    @Get()
    @ApiOperation({
        summary: 'Obtener todas las notas adhesivas',
        description: 'Retorna la lista completa de notas persistidas en el servidor.',
    })
    @ApiOkResponse({
        description: 'Lista de notas obtenida exitosamente.',
        type: [Note],
    })
    findAll(): Promise<Note[]> {
        return this.notesService.findAll();
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Actualizar una nota existente',
        description: 'Modifica campos de la nota (título, texto, color, validez o estado de expiración).',
    })
    @ApiParam({
        name: 'id',
        description: 'Identificador único UUID de la nota',
        example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    })
    @ApiOkResponse({
        description: 'Nota actualizada exitosamente.',
        type: Note,
    })
    @ApiNotFoundResponse({
        description: 'No se encontró ninguna nota con el ID especificado.',
    })
    @ApiBadRequestResponse({
        description: 'El formato del UUID es inválido o los datos a actualizar no cumplen las validaciones.',
    })
    updateNote(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateNoteDto: UpdateNoteDto,
    ): Promise<Note> {
        return this.notesService.update(id, updateNoteDto);
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Eliminar una nota adhesiva',
        description: 'Borra definitivamente una nota del almacenamiento por su UUID.',
    })
    @ApiParam({
        name: 'id',
        description: 'Identificador único UUID de la nota a eliminar',
        example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    })
    @ApiOkResponse({
        description: 'Nota eliminada exitosamente.',
        schema: {
            example: {
                mensaje: 'Note eliminada',
                id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            },
        },
    })
    @ApiNotFoundResponse({
        description: 'No se encontró la nota que se intenta eliminar.',
    })
    @ApiBadRequestResponse({
        description: 'El ID provisto no es un UUID válido.',
    })
    removeNote(@Param('id', ParseUUIDPipe) id: string): Promise<{ mensaje: string; id: string }> {
        return this.notesService.remove(id);
    }
}
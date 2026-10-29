import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotesService } from './notes.service';
import { JsonDb, DatabaseFile, NoteGuardada } from '../database/json.db';
import { CreateNoteDto } from './dto/createNote.dto';
import { UpdateNoteDto } from './dto/updateNote.dto';

describe('NotesService', () => {
    let service: NotesService;
    let mockDbState: DatabaseFile;

    const mockJsonDb = {
        read: jest.fn(),
        update: jest.fn(),
    };

    beforeEach(async () => {
        mockDbState = {
            notes: [],
        };

        mockJsonDb.read.mockImplementation(async () => ({
            notes: [...mockDbState.notes],
        }));

        mockJsonDb.update.mockImplementation(async (callback: (db: DatabaseFile) => unknown) => {
            return callback(mockDbState);
        });

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotesService,
                {
                    provide: JsonDb,
                    useValue: mockJsonDb,
                },
            ],
        }).compile();

        service = module.get<NotesService>(NotesService);
    });

    it('debe estar definido el servicio', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('debe retornar un array vacío si no hay notas guardadas', async () => {
            const result = await service.findAll();
            expect(result).toEqual([]);
            expect(mockJsonDb.read).toHaveBeenCalled();
        });

        it('debe retornar todas las notas existentes en la base de datos', async () => {
            const notaEjemplo: NoteGuardada = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                title: 'Nota 1',
                text: 'Contenido 1',
                color: 'yellow',
                initialMinutes: 10,
                createdAt: 1700000000000,
                expired: false,
                finished: false,
            };
            mockDbState.notes.push(notaEjemplo);

            const result = await service.findAll();
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(notaEjemplo);
        });
    });

    describe('createNote', () => {
        it('debe crear una nueva nota con UUID, timestamp y valores por defecto', async () => {
            const dto: CreateNoteDto = {
                title: 'Estudiar para el parcial',
                text: 'Repasar conceptos de sistemas distribuidos y NestJS',
                color: 'blue',
                minutes: 25,
            };

            const result = await service.createNote(dto);

            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(typeof result.id).toBe('string');
            expect(result.title).toBe(dto.title);
            expect(result.text).toBe(dto.text);
            expect(result.color).toBe(dto.color);
            expect(result.initialMinutes).toBe(dto.minutes);
            expect(typeof result.createdAt).toBe('number');
            expect(result.expired).toBe(false);
            expect(result.finished).toBe(false);

            // Debe haberse persistido en el estado de la base de datos
            expect(mockDbState.notes).toHaveLength(1);
            expect(mockDbState.notes[0].id).toBe(result.id);
        });
    });

    describe('update', () => {
        it('debe actualizar los campos de una nota existente', async () => {
            const notaExistente: NoteGuardada = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                title: 'Título original',
                text: 'Texto original',
                color: 'yellow',
                initialMinutes: 15,
                createdAt: 1700000000000,
                expired: false,
                finished: false,
            };
            mockDbState.notes.push(notaExistente);

            const updateDto: UpdateNoteDto = {
                title: 'Título modificado',
                text: 'Texto modificado',
                color: 'green',
                minutes: 30,
                expired: true,
                finished: true,
            };

            const result = await service.update(notaExistente.id, updateDto);

            expect(result.title).toBe('Título modificado');
            expect(result.text).toBe('Texto modificado');
            expect(result.color).toBe('green');
            expect(result.initialMinutes).toBe(30);
            expect(result.expired).toBe(true);
            expect(result.finished).toBe(true);

            // Verificar persistencia en el mock state
            const guardada = mockDbState.notes.find((n) => n.id === notaExistente.id);
            expect(guardada?.title).toBe('Título modificado');
            expect(guardada?.expired).toBe(true);
        });

        it('debe lanzar NotFoundException si la nota a actualizar no existe', async () => {
            const updateDto: UpdateNoteDto = {
                title: 'No existo',
            };

            await expect(service.update('id-inexistente', updateDto)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('remove', () => {
        it('debe eliminar la nota existente y retornar mensaje con el id', async () => {
            const nota: NoteGuardada = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                title: 'Para borrar',
                text: 'Eliminar esta nota',
                color: 'pink',
                initialMinutes: 5,
                createdAt: 1700000000000,
                expired: false,
                finished: false,
            };
            mockDbState.notes.push(nota);
            expect(mockDbState.notes).toHaveLength(1);

            const result = await service.remove(nota.id);

            expect(result).toEqual({ mensaje: 'Note eliminada', id: nota.id });
            expect(mockDbState.notes).toHaveLength(0);
        });

        it('debe lanzar NotFoundException al intentar eliminar una nota que no existe', async () => {
            await expect(service.remove('id-inexistente')).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});

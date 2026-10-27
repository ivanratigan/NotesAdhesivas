import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseFile, NoteGuardada, JsonDb } from '../database/json.db';
import { CreateNoteDto } from './dto/createNote.dto';
import { UpdateNoteDto } from './dto/updateNote.dto';
import { Note } from './entities/note.entity';
import { randomUUID } from 'node:crypto';

@Injectable()
export class NotesService {
    constructor(private readonly db: JsonDb) { }

    update(id: string, dto: UpdateNoteDto): Promise<Note> {
        return this.db.update((data: DatabaseFile) => {
            const note = this.buscarNote(data, id);
            if (dto.color !== undefined) note.color = dto.color;
            if (dto.text !== undefined) note.text = dto.text;
            if (dto.title !== undefined) note.title = dto.title;
            if (dto.minutes !== undefined) note.initialMinutes = dto.minutes;
            if (dto.initialMinutes !== undefined) note.initialMinutes = dto.initialMinutes;
            if (dto.createdAt !== undefined) note.createdAt = dto.createdAt;
            if (dto.finished !== undefined) note.finished = dto.finished;
            if (dto.expired !== undefined) note.expired = dto.expired;
            return note;
        });
    }

    remove(id: string): Promise<{ mensaje: string; id: string }> {
        return this.db.update((data: DatabaseFile) => {
            const note = this.buscarNote(data, id);
            const index = data.notes.findIndex((item) => item.id === note.id);
            if (index > -1) {
                data.notes.splice(index, 1);
            }
            return { mensaje: 'Note eliminada', id };
        });
    }

    async findAll(): Promise<NoteGuardada[]> {
        const data = await this.db.read();
        return data.notes;
    }

    createNote(dto: CreateNoteDto): Promise<NoteGuardada> {
        return this.db.update((data: DatabaseFile) => {
            const guardada: NoteGuardada = {
                id: randomUUID(),
                title: dto.title,
                text: dto.text,
                color: dto.color,
                initialMinutes: dto.minutes,
                createdAt: Date.now(),
                expired: false,
                finished: false,
            };
            data.notes.push(guardada);
            return guardada;
        });
    }

    private buscarNote(data: DatabaseFile, id: string): NoteGuardada {
        const note = data.notes.find((item) => item.id === id);
        if (!note) throw new NotFoundException('Note no encontrado');
        return note;
    }
}
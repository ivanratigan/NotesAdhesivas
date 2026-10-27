import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, readFile, rename, writeFile } from 'fs/promises';
import { dirname, join } from 'path';

export type NoteGuardada = {
    id: string;
    title: string;
    text: string;
    color: string;
    initialMinutes: number;
    createdAt: number;
    expired: boolean;
    finished: boolean;
};

export type DatabaseFile = {
    notes: NoteGuardada[];
};

const emptyDatabase = (): DatabaseFile => ({
    notes: [],
});

@Injectable()
export class JsonDb {
    private queue: Promise<unknown> = Promise.resolve();

    filePath(): string {
        return process.env.DATA_FILE ?? join(process.cwd(), 'data', 'db.json');
    }

    async read(): Promise<DatabaseFile> {
        try {
            const raw = await readFile(this.filePath(), 'utf8');
            return JSON.parse(raw) as DatabaseFile;
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                return emptyDatabase();
            }
            throw error;
        }
    }

    private async write(db: DatabaseFile): Promise<void> {
        const path = this.filePath();
        await mkdir(dirname(path), { recursive: true });
        const temporary = `${path}.${randomUUID()}.tmp`;
        await writeFile(temporary, `${JSON.stringify(db, null, 2)}\n`);
        await rename(temporary, path);
    }

    update<T>(change: (db: DatabaseFile) => T): Promise<T> {
        const run = this.queue.then(async () => {
            const db = await this.read();
            const result = change(db);
            await this.write(db);
            return result;
        });
        this.queue = run.then(
            () => undefined,
            () => undefined,
        );
        return run;
    }
}
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    const document = SwaggerModule.createDocument(
        app,
        new DocumentBuilder()
            .setTitle('API de Notas')
            .setDescription('Notas Visuales')
            .setVersion('1.0')
            .build(),
    );
    SwaggerModule.setup('docs', app, document);

    const port = process.env.PORT ?? 3001;
    await app.listen(port);
    console.log(`Backend corriendo en: http://localhost:${port}`);
    console.log(`Documentación Swagger en: http://localhost:${port}/docs`);
}
void bootstrap();
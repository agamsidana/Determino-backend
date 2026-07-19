import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function setUpSwagger(app: INestApplication) {

    const config = new DocumentBuilder()
        .setTitle('Determino API')
        .setVersion('1.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                in: 'header',
                name: 'Authorization',
            },
    )
        .build()

    const DocumentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, DocumentFactory, { useGlobalPrefix: true });

}
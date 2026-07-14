import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function setUpSwagger(app: INestApplication) {

    const config = new DocumentBuilder()
        .setTitle('Determino API')
        .setVersion('1.0')
        .build()

    const DocumentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, DocumentFactory,{useGlobalPrefix:true});

}
import { INestApplication } from "@nestjs/common"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('API REST Tienda Funko con Nestjs 2do DAW 2023/2024')
    .setDescription(
      'API de ejemplo para una tienda de Funkos 2023/2024',
    )
    .setContact(
      'Miguel Angel Zanotto Rojas',
      'www.linkedin.com/in/miguel-zanotto',
      'migzanotto18@hotmail.com',
    )
    .setExternalDoc(
      'Documentación de la API',
      'https://github.com/MiguelZanottto/FunkosNestJs',
    )
    .setLicense('CC BY-NC-SA 4.0', 'https://github.com/MiguelZanottto/FunkosNestJs')
    .setVersion('1.0.0')
    .addTag('Funkos', 'Operaciones con funkos')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)
}
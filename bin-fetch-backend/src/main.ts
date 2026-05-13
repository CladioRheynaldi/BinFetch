import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CRITICAL: This allows your Next.js frontend to talk to this backend
  app.enableCors({
    origin: '*', // During development, we allow all origins.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  // Start the backend on port 3001 so it does not clash with Next.js (port 3000)
  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  console.log(` NestJS Backend is running on: http://localhost:${port}`);
}
bootstrap();
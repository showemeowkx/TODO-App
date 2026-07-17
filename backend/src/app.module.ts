import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { TodoModule } from './todo/todo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Local: programme/.env or backend/.env — hosting uses process.env
      envFilePath: [
        join(process.cwd(), '.env.local'),
        join(process.cwd(), '.env'),
        join(process.cwd(), '..', '.env.local'),
        join(process.cwd(), '..', '.env'),
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.getOrThrow<string>('POSTGRES_HOST');
        const useSsl =
          config.get('POSTGRES_SSL') === 'true' || host.includes('neon.tech');
        return {
          type: 'postgres' as const,
          host,
          port: Number(config.getOrThrow('POSTGRES_PORT')),
          username: config.getOrThrow<string>('POSTGRES_USER'),
          password: config.getOrThrow<string>('POSTGRES_PASSWORD'),
          database: config.getOrThrow<string>('POSTGRES_DB'),
          ssl: useSsl ? { rejectUnauthorized: false } : false,
          autoLoadEntities: true,
          synchronize: config.get('DB_SYNCHRONIZE', 'true') === 'true',
        };
      },
    }),
    TodoModule,
  ],
})
export class AppModule {}

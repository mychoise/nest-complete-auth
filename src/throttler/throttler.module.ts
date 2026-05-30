import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RedisService } from '../redis/redis.service';
import { LoginGuard } from './guards/login.guard';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60000, limit: 100 }],
      storage: new ThrottlerStorageRedisService(new RedisService().client),
    }),
  ],
  providers: [
    RedisService,
    LoginGuard,
    { provide: APP_GUARD, useClass: ThrottlerGuard }, // applies to all routes
  ],
  exports: [ThrottlerModule, LoginGuard],
})
export class AppThrottlerModule {}

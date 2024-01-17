'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AppModule = void 0;
const common_1 = require('@nestjs/common');
const app_controller_1 = require('./app.controller');
const app_service_1 = require('./app.service');
const schema = require('./drizzle/schema');
const nestjs_drizzle_pg_1 = require('@knaadh/nestjs-drizzle-pg');
const config_1 = require('@nestjs/config');
const db_module_1 = require('./db/db.module');
const app_config_1 = require('./config/app.config');
import * as dotenv from 'dotenv';
dotenv.config();
let AppModule = class AppModule {};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate(
  [
    (0, common_1.Module)({
      imports: [
        config_1.ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: `.env`,
          load: [app_config_1.default],
        }),
        nestjs_drizzle_pg_1.DrizzlePGModule.registerAsync({
          tag: 'DB_PROD',
          useFactory: (configService) => ({
            pg: {
              connection: 'client',
              config: {
                connectionString: process.env.DATABASE_URL,
              },
            },
            config: { schema: { ...schema } },
          }),
          inject: [config_1.ConfigService],
        }),
        db_module_1.DbModule,
      ],
      controllers: [app_controller_1.AppController],
      providers: [app_service_1.AppService],
    }),
  ],
  AppModule,
);
//# sourceMappingURL=app.module.js.map

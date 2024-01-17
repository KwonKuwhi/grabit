"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrizzleService = void 0;
const postgres_js_1 = require("drizzle-orm/postgres-js");
const common_1 = require("@nestjs/common");
const postgres_1 = require("postgres");
const process = require("process");
const drizzle_orm_1 = require("drizzle-orm");
let DrizzleService = class DrizzleService {
    constructor() {
        this.connect();
    }
    async connect() {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error('No environment variable DATABASE_URL');
        }
        this.queryClient = (0, postgres_1.default)(connectionString);
        this.db = (0, postgres_js_1.drizzle)(this.queryClient);
        await this.clearDb();
    }
    getDb() {
        return this.db;
    }
    async clearDb() {
        const query = (0, drizzle_orm_1.sql) `SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE';
    `;
        const tables = await this.db.execute(query);
        for (let table of tables) {
            const query = drizzle_orm_1.sql.raw(`TRUNCATE TABLE ${table.table_name} CASCADE;`);
            await this.db.execute(query);
        }
    }
};
exports.DrizzleService = DrizzleService;
exports.DrizzleService = DrizzleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], DrizzleService);
//# sourceMappingURL=drizzle.service.js.map
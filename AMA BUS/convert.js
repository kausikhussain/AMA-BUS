const fs = require('fs');

let schema = fs.readFileSync('apps/api/prisma/schema.prisma', 'utf8');

// 1. Change to sqlite
schema = schema.replace(/provider = "postgresql"/, 'provider = "sqlite"');
// Change db url env var to point to sqlite directly or keep DATABASE_URL and we will update .env
schema = schema.replace(/url\s+=\s+env\("DATABASE_URL"\)/, 'url      = "file:./dev.db"');

// 2. Remove enums
schema = schema.replace(/enum Role {[\s\S]*?}/, '');
schema = schema.replace(/enum BusStatus {[\s\S]*?}/, '');
schema = schema.replace(/enum TripStatus {[\s\S]*?}/, '');
schema = schema.replace(/enum PaymentStatus {[\s\S]*?}/, '');
schema = schema.replace(/enum NotificationType {[\s\S]*?}/, '');

// 3. Update fields using Enums
schema = schema.replace(/role\s+Role\s+@default\(PASSENGER\)/g, 'role          String         @default("PASSENGER")');
schema = schema.replace(/status\s+BusStatus\s+@default\(IDLE\)/g, 'status     String @default("IDLE")');
schema = schema.replace(/status\s+TripStatus\s+@default\(SCHEDULED\)/g, 'status            String    @default("SCHEDULED")');
schema = schema.replace(/paymentStatus\s+PaymentStatus\s+@default\(PENDING\)/g, 'paymentStatus         String @default("PENDING")');
schema = schema.replace(/type\s+NotificationType/g, 'type      String');

// 4. Update Json fields -> String
schema = schema.replace(/path\s+Json/g, 'path        String');
schema = schema.replace(/metadata\s+Json\?/g, 'metadata  String?');

// 5. Update @db.Text -> remove
schema = schema.replace(/qrCode\s+String\s+@db\.Text/g, 'qrCode                String');

// Clean up double blank lines
schema = schema.replace(/\n\s*\n\s*\n/g, '\n\n');

fs.writeFileSync('apps/api/prisma/schema.prisma', schema);
console.log("Schema converted");

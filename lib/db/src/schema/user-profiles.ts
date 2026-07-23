import { pgTable, text, date, char, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const userProfilesTable = pgTable(
  "user_profiles",
  {
    userId:       text("user_id").primaryKey(),
    cpf:          text("cpf").unique(),
    birthDate:    date("birth_date"),
    phone:        text("phone"),
    zipCode:      text("zip_code"),
    street:       text("street"),
    streetNumber: text("street_number"),
    complement:   text("complement"),
    neighborhood: text("neighborhood"),
    city:         text("city"),
    state:        char("state", { length: 2 }),
    updatedAt:    timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    foreignKey({ columns: [t.userId], foreignColumns: [usersTable.id] }).onDelete("cascade"),
  ],
);

export type InsertUserProfile = typeof userProfilesTable.$inferInsert;
export type UserProfile = typeof userProfilesTable.$inferSelect;

// lib/repositories/SecuritySettingsRepository.ts

import { getDb } from "@/lib/db";

export class SecuritySettingsRepository {

    async getAll() {

        const db = await getDb();

        const result =
            await db.request().query(`
        SELECT
          SettingCode,
          SettingValue
        FROM auth.SecuritySettings
      `);

        return result.recordset;
    }

    async update(
        settingCode: string,
        settingValue: string,
        updatedBy: string
    ) {

        const db = await getDb();

        await db.request()
            .input(
                "settingCode",
                settingCode
            )
            .input(
                "settingValue",
                settingValue
            )
            .input(
                "updatedBy",
                updatedBy
            )
            .query(`
        UPDATE auth.SecuritySettings
        SET
          SettingValue = @settingValue,
          UpdatedAt = SYSUTCDATETIME(),
          UpdatedBy = @updatedBy
        WHERE SettingCode = @settingCode
      `);
    }
}
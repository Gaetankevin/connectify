import { prisma } from "./prisma";

type BackupOptions = {
  includeTables?: string[]; // limit to specific tables
  filenamePrefix?: string;
  asyncUpload?: boolean; // if true, upload in background (non-blocking)
  directory?: string; // directory in blob storage, e.g. 'database'
};

function escapeSql(value: any): string {
  if (value === null || typeof value === "undefined") return "NULL";
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (value instanceof Date) return `'${value.toISOString().replace("'", "''")}'`;
  // Buffer / Uint8Array
  if (typeof Buffer !== "undefined" && Buffer.isBuffer(value)) {
    return `'\\x${(value as Buffer).toString("hex")}'`;
  }
  // Fallback to string
  const s = String(value);
  // Escape single quotes by doubling them
  return `'${s.replace(/'/g, "''")}'`;
}

async function listTables(): Promise<string[]> {
  // Get tables in public schema excluding prisma migrations table
  const res: Array<{ tablename: string }> = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT IN ('_prisma_migrations')
  ` as any;
  return res.map((r) => r.tablename).filter(Boolean);
}

async function fetchAllRows(table: string): Promise<any[]> {
  // Use raw query to allow dynamic table names
  const rows = await prisma.$queryRawUnsafe(`SELECT * FROM "${table}"`);
  return rows as any[];
}

async function uploadToVercelBlob(sql: string, filename: string) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.warn("[db-backup] BLOB_READ_WRITE_TOKEN not set — skipping upload");
    return null;
  }

  try {
    // Use @vercel/blob server-side API to upload
    const { put } = await import("@vercel/blob");
    console.log("[db-backup] Uploading to Vercel Blob:", filename);
    
    const result = await put(filename, sql, {
      access: "public",
      token: token,
    });
    
    console.log("[db-backup] File uploaded successfully to:", result.url);
    return result.url;
  } catch (err) {
    console.error("[db-backup] Error uploading to Vercel Blob:", err instanceof Error ? err.message : err);
    return null;
  }
}

export async function backupDatabase(options: BackupOptions = {}) {
  const { includeTables, filenamePrefix, asyncUpload = true } = options;

  const ts = new Date();
  const timestamp = ts.toISOString().replace(/[:.]/g, "-");
  const filename = `${filenamePrefix ?? "backup"}_${timestamp}.sql`;
  const directory = options.directory ?? process.env.BLOB_UPLOAD_DIRECTORY ?? "database";
  const fullFilename = directory ? `${directory.replace(/^\/+|\/+$/g, "")}/${filename}` : filename;

  try {
    console.log(`[db-backup] Starting backup, tables to dump:`, includeTables || "all public tables");
    
    const tables = includeTables && includeTables.length > 0 ? includeTables : await listTables();
    console.log(`[db-backup] Tables found:`, tables);

    let sql = `-- Connectify database backup (data-only)\n-- Generated: ${ts.toISOString()}\n\n`;
    sql += `BEGIN;\nSET CONSTRAINTS ALL DEFERRED;\n\n`;

    for (const table of tables) {
      try {
        const rows = await fetchAllRows(table);
        if (!rows || rows.length === 0) {
          console.log(`[db-backup] Table "${table}" is empty, skipping`);
          continue;
        }

        console.log(`[db-backup] Dumping table "${table}" with ${rows.length} rows`);

        // derive columns from first row
        const cols = Object.keys(rows[0]);
        const colList = cols.map((c) => `"${c}"`).join(", ");

        for (const row of rows) {
          const values = cols.map((c) => escapeSql(row[c]));
          sql += `INSERT INTO "${table}" (${colList}) VALUES (${values.join(", ")});\n`;
        }
        sql += `\n`;
      } catch (err) {
        console.error(`[db-backup] Failed to dump table ${table}:`, err);
      }
    }

    sql += `COMMIT;\n`;
    console.log(`[db-backup] Generated SQL dump (${sql.length} bytes), filename: ${fullFilename}`);

    const doUpload = async () => {
      const url = await uploadToVercelBlob(sql, fullFilename);
      if (url) {
        console.log("[db-backup] Database backup uploaded successfully to Vercel Blob:", url);
      } else {
        console.warn("[db-backup] Backup generated but upload failed or was skipped");
      }
    };

    if (asyncUpload) {
      // Fire-and-forget but log errors
      doUpload().catch((e) => console.error("[db-backup] Async backup upload failed:", e));
      return { ok: true, filename: fullFilename };
    } else {
      const url = await uploadToVercelBlob(sql, fullFilename);
      return { ok: !!url, url, filename: fullFilename };
    }
  } catch (err) {
    console.error("[db-backup] backupDatabase error:", err);
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export default backupDatabase;

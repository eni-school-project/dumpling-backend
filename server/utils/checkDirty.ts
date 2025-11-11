// import { useStorage } from '#imports'
import { Client } from 'pg';
import mysql from 'mysql2/promise';

async function useCheckDirtyMySql() {
  const storage = useStorage('data');
  const databaseCredentials = useParseConnectionCredentials(await storage.getItem('current_connection'));

  const connection = await mysql.createConnection({
    host: databaseCredentials.host,
    port: databaseCredentials.port ?? undefined,
    user: databaseCredentials.user,
    password: databaseCredentials.password,
    database: databaseCredentials.database ?? undefined
  });

  try {
    /**
     * Check binary log position
     */
    const [binlogResult] = await connection.query('SHOW MASTER STATUS');
    console.log('Binlog position:', binlogResult[0]);

    /**
     * Get table statistics
     */
    const [tableStats] = await connection.query(`
      SELECT 
        TABLE_SCHEMA,
        TABLE_NAME,
        TABLE_ROWS,
        DATA_LENGTH,
        INDEX_LENGTH,
        UPDATE_TIME,
        CHECK_TIME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
    `);
    console.log('Table statistics:', tableStats);

    /**
     * Get row modification counts (requires performance schema)
     */
    const [perfStats] = await connection.query(`
      SELECT 
        OBJECT_SCHEMA,
        OBJECT_NAME,
        COUNT_READ,
        COUNT_WRITE,
        COUNT_INSERT,
        COUNT_UPDATE,
        COUNT_DELETE
      FROM performance_schema.table_io_waits_summary_by_table
      WHERE OBJECT_SCHEMA = DATABASE()
    `);
    console.log('Performance stats:', perfStats);

    /**
     * Check schema structure
     */
    const [schemaInfo] = await connection.query(`
      SELECT 
        TABLE_SCHEMA,
        TABLE_NAME,
        COLUMN_NAME,
        COLUMN_TYPE,
        IS_NULLABLE,
        COLUMN_KEY
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME, ORDINAL_POSITION
    `);

    /**
     * Get InnoDB change buffer stats
     */
    const [innodbStats] = await connection.query(`
      SHOW GLOBAL STATUS LIKE 'Innodb_rows_%'
    `);
    console.log('InnoDB stats:', innodbStats);

    return {
      binlog: binlogResult[0],
      tableStats,
      perfStats,
      schema: schemaInfo,
      innodbStats
    };

  } finally {
    await connection.end();
  }
}

async function useCheckDirtyPostgres() {
  const storage = useStorage('data');
  const databaseCredentials = useParseConnectionCredentials(await storage.getItem('current_connection'));

  const connection = new Client({
    host: databaseCredentials.host,
    port: databaseCredentials.port ?? undefined,
    user: databaseCredentials.user,
    password: databaseCredentials.password,
    database: databaseCredentials.database ?? undefined
  });

  await connection.connect();

  try {

    /**
     * Check transaction ID position (WAL LSN)
     */
    const lsnResult = await connection.query('SELECT pg_current_wal_lsn()');
    const currentLSN = lsnResult.rows[0].pg_current_wal_lsn;
    console.log('Current WAL LSN:', currentLSN);

    /**
     * Get table statistics (row counts, modifications)
     */
    const statsResult = await connection.query(`
      SELECT 
        schemaname,
        relname as table_name,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_rows,
        last_vacuum,
        last_autovacuum,
        last_analyze
      FROM pg_stat_user_tables
      ORDER BY schemaname, relname
    `);
    console.log('Table statistics:', statsResult.fields);

    /**
     * Check for schema changes
     */
    const schemaResult = await connection.query(`
      SELECT 
        table_schema,
        table_name,
        column_name,
        data_type
      FROM information_schema.columns
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name, ordinal_position
    `);
    // console.log('Schema statistics:', schemaResult.rows[0]);

    /**
     * Get database statistics
     */
    const dbStatsResult = await connection.query(`
      SELECT 
        xact_commit,
        xact_rollback,
        tup_returned,
        tup_fetched,
        tup_inserted,
        tup_updated,
        tup_deleted
      FROM pg_stat_database
      WHERE datname = current_database()
    `);
    console.log('Database stats:', dbStatsResult.rows[0]);

    return {
      lsn: currentLSN,
      tableStats: statsResult.fields,
      schema: schemaResult.fields,
      dbStats: dbStatsResult.rows[0]
    };

  } finally {
    await connection.end();
  }
}

export { useCheckDirtyMySql, useCheckDirtyPostgres }
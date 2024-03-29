const mysql = require('mysql2/promise');

module.exports = class MySQL {
  constructor () {
    this.lastSQL = null;
  }

  async create (param) {
    // create the connection to MySQL
    // https://github.com/mysqljs/mysql#connection-options
    this.db = await mysql.createConnection({
      host: param.host,
      port: Number(param.port),
      user: param.username,
      password: param.password,
      database: param.database
    });
  }

  // ----

  async destroy () {
    try {
      await this.db.destroy();
    } catch (e) {
      console.error(`[mysql.destroy()] ${e}`);
    }
  }

  async query (sql, values) {
    this.lastSQL = sql;
    return await this.db.query(sql, values);
  }

  // -----

  async select (sql, values) {
    this.lastSQL = sql;
    const rows = await this.db.query(sql, values);
    return rows.length > 0 ? rows[0] : [];
  }

  async select1 (sql, values) {
    this.lastSQL = sql;
    const rows = await this.db.query(sql, values);
    return rows.length > 0 && rows[0].length > 0 ? rows[0][0] : null;
  }

  async selectOneRow (sql, values) {
    this.lastSQL = sql;
    const rows = await this.db.query(sql, values);
    return rows.length > 0 && rows[0].length > 0 ? rows[0][0] : null;
  }
};

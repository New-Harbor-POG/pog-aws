const mysql = require('mysql2/promise');

module.exports = class MySQL {
  constructor () {
    this.lastSQL = null;
  }

  async create (param) {
    // create the connection to MySQL
    // https://github.com/mysqljs/mysql#connection-options
    this.db = await mysql.createConnection({
      host: param['db-ro'].host,
      port: Number(param['db-ro'].port),
      user: param['db-ro'].username,
      password: param['db-ro'].password,
      database: param['db-ro'].database
    });
  }

  // ----

  async destroy () {
    await this.db.destroy();
  }

  async query (sql, values) {
    this.lastSQL = sql;
    return await this.db.query(sql, values);
  }

  // -----

  async select (sql, values) {
    this.lastSQL = sql;
    const rows = await this.db.query(sql, values);
    return rows.length > 0 ? rows[1] : [];
  }

  async selectOneRow (sql, values) {
    this.lastSQL = sql;
    const rows = await this.db.query(sql, values);
    return rows.length > 0 && rows[0].length > 0 ? rows[0][0] : null;
  }
};

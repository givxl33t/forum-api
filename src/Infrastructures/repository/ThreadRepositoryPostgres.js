const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../Domains/threads/entities/AddedThread');
const ThreadDetails = require('../../Domains/threads/entities/ThreadDetails');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyThreadById(id) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if(!result.rowCount) {
      throw new NotFoundError('Thread tidak ditemukan')
    }
  }

  async addThread(addThread) {
    const { owner, title, body } = addThread;
    const id = `thread-${this._idGenerator()}`;
    const date = new Date().toISOString();
    
    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, owner, title',
      values: [id, owner, title, body, date],
    };

    const result = await this._pool.query(query);

    return new AddedThread({ ...result.rows[0] });
  }

  async getThreadsById(id) {
    const query = {
      text: `SELECT threads.*, users.username FROM users 
      LEFT JOIN threads ON threads.owner = users.id
      WHERE threads.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if(!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    };

    return new ThreadDetails({ ...result.rows[0], date: result.rows[0].date.toISOString()});
  }
}

module.exports = ThreadRepositoryPostgres;
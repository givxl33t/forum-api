const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const CommentDetails = require('../../Domains/comments/entities/CommentDetails');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(addComment) {
    const { owner, threadId, content } = addComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, owner, threadId, content, date],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async deleteComment(commentId) {
    const query = {
      text: `UPDATE comments SET is_delete = true WHERE id = $1`,
      values: [commentId],
    };

    await this._pool.query(query);
  }

  async verifyCommentOwnership(commentId, owner) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    const comment = result.rows[0];

    if (comment.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async checkAvailabilityComment(commentId) {
    const query = {
      text: `SELECT comments.* FROM threads 
      LEFT JOIN comments ON comments.thread_id = threads.id
      WHERE comments.id = $1 AND comments.is_delete = false`,
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('komentar tidak ditemukan di database');
    }
  }

  async getCommentByThreadId(threadId) {
    const query = {
      text: `SELECT comments.id, users.username, comments.content, comments.date, comments.is_delete 
      FROM comments
      LEFT JOIN users ON comments.owner = users.id
      LEFT JOIN threads ON comments.thread_id = threads.id
      WHERE threads.id = $1 ORDER BY comments.date ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if(!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    };

    return result.rows.map((row) => (new CommentDetails({...row, date: row.date.toISOString()})))
  }
}

module.exports = CommentRepositoryPostgres;
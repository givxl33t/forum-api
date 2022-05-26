const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const ReplyDetails = require('../../Domains/replies/entities/ReplyDetails');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(addReply) {
    const { owner, threadId, commentId, content } = addReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, owner, threadId, commentId, content, date],
    };

    const result = await this._pool.query(query);

    return new AddedReply({ ...result.rows[0] });
  }

  async deleteReply(replyId) {
    const query = {
      text: `UPDATE replies SET content = '**balasan telah dihapus**', is_delete = true WHERE id = $1`,
      values: [replyId],
    };

    await this._pool.query(query);
  }

  async verifyReplyOwnership(replyId, owner) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan di database');
    }

    const reply = result.rows[0];

    if (reply.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async checkAvailabilityReply(replyId) {
    const query = {
      text: `SELECT replies.* FROM replies
      LEFT JOIN comments ON replies.comment_id = comments.id
      LEFT JOIN threads ON replies.thread_id = threads.id
      WHERE replies.id = $1 AND replies.is_delete = false`,
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new NotFoundError('balasan tidak ditemukan di database');
    }
  }

  async getReplyByCommentId(commentId) {
    const query = {
      text: `SELECT replies.id, replies.content, replies.date, users.username
      FROM replies
      LEFT JOIN users ON replies.owner = users.id
      LEFT JOIN threads ON replies.thread_id = threads.id
      LEFT JOIN comments ON replies.comment_id = comments.id
      WHERE comments.id = $1 ORDER BY replies.date ASC`,
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return result.rows.filter((row) => (new ReplyDetails({...row})));
  }
}

module.exports = ReplyRepositoryPostgres;
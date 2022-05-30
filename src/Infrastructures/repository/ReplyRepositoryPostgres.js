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
      text: `UPDATE replies SET is_delete = true WHERE id = $1`,
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

    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan di database');
    }
  }

  async getReplyByCommentId(commentIds) {
    const query = {
      text: `SELECT replies.*, users.username
      FROM replies
      INNER JOIN users ON users.id = replies.owner
      WHERE replies.comment_id = ANY($1::text[]) ORDER by replies.date ASC`, //commentIds bertipe array string
      values: [commentIds],
    };

    const result = await this._pool.query(query);

    return result.rows.map((row) => (new ReplyDetails({...row, date: row.date.toISOString()})));
  }
}

module.exports = ReplyRepositoryPostgres;
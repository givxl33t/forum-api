class ReplyDetails {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, content, date, username, is_delete } = payload;

    this.id = id;
    this.content = is_delete ? "**balasan telah dihapus**" : content;
    this.date = date;
    this.username = username;
  }

  _verifyPayload({ id, content, date, username, is_delete }) {
    if(!id || !content || !date || !username || is_delete === null) {
      throw new Error('REPLY_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' ||
        typeof content !== 'string' ||
        typeof date !== 'string' ||
        typeof username !== 'string' ||
        typeof is_delete !== 'boolean') {
      throw new Error('REPLY_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ReplyDetails;
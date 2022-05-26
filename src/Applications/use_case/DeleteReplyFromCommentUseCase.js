class DeleteReplyFromCommentUseCase {
  constructor({
    replyRepository,
  }) {
    this._replyRepository = replyRepository
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    const { owner, replyId } = useCasePayload;
    await this._replyRepository.verifyReplyOwnership(replyId, owner);
    await this._replyRepository.checkAvailabilityReply(replyId);
    await this._replyRepository.deleteReply(replyId);
  }

  _validatePayload(payload) {
    const { owner, replyId } = payload;
    if (!owner || !replyId) {
      throw new Error('DELETE_REPLY_FROM_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof owner !== 'string'||
        typeof replyId !== 'string') {
      throw new Error('DELETE_REPLY_FROM_COMMENT_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteReplyFromCommentUseCase;
class DeleteCommentFromThreadUseCase {
  constructor({
    commentRepository,
  }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    const { owner, commentId } = useCasePayload;
    await this._commentRepository.verifyCommentOwnership(commentId, owner);
    await this._commentRepository.checkAvailabilityComment(commentId);
    await this._commentRepository.deleteComment(commentId);
  }

  _validatePayload(payload) {
    const { owner, commentId } = payload;
    if(!owner || !commentId) {
      throw new Error('DELETE_COMMENT_FROM_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof owner !== 'string' ||
        typeof commentId !== 'string') {
      throw new Error('DELETE_COMMENT_FROM_THREAD_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteCommentFromThreadUseCase;
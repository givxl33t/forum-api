const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyToCommentUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const addReply = new AddReply(useCasePayload);
    await this._threadRepository.verifyThreadById(addReply.threadId);
    await this._commentRepository.checkAvailabilityComment(addReply.commentId);

    return this._replyRepository.addReply(addReply);
  }
}

module.exports = AddReplyToCommentUseCase;
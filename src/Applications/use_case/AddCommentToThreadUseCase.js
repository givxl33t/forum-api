const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentToThreadUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const addComment = new AddComment(useCasePayload);
    await this._threadRepository.verifyThreadById(addComment.threadId);

    return this._commentRepository.addComment(addComment);
  }
}

module.exports = AddCommentToThreadUseCase;
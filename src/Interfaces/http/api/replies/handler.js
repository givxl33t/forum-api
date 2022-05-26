const AddReplyToCommentUseCase = require('../../../../Applications/use_case/AddReplyToCommentUseCase');
const DeleteReplyFromCommentUseCase = require('../../../../Applications/use_case/DeleteReplyFromCommentUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyToCommentHandler = this.postReplyToCommentHandler.bind(this);
    this.deleteReplyFromCommentHandler = this.deleteReplyFromCommentHandler.bind(this);
  }

  async postReplyToCommentHandler(request, h) {
    const addReplyToCommentUseCase = this._container.getInstance(AddReplyToCommentUseCase.name);
    const { threadId, commentId } = request.params;
    const { id: owner } = request.auth.credentials;
    const useCasePayload = {
      owner,
      threadId,
      commentId,
      content: request.payload.content,
    }
    const addedReply = await addReplyToCommentUseCase.execute(useCasePayload);
    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyFromCommentHandler(request) {
    const deleteReplyFromCommentUseCase = this._container.getInstance(DeleteReplyFromCommentUseCase.name);
    const { replyId } = request.params;
    const { id: owner } = request.auth.credentials;
    const useCasePayload = {
      owner,
      replyId,
    }
    await deleteReplyFromCommentUseCase.execute(useCasePayload);
    return {
      status: 'success',
    };
  }
}

module.exports = RepliesHandler;
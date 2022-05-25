const AddCommentToThreadUseCase = require('../../../../Applications/use_case/AddCommentToThreadUseCase');
const DeleteCommentFromThreadUseCase = require('../../../../Applications/use_case/DeleteCommentFromThreadUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentToThreadHandler = this.postCommentToThreadHandler.bind(this);
    this.deleteCommentFromThreadHandler = this.deleteCommentFromThreadHandler.bind(this);
  }

  async postCommentToThreadHandler(request, h) {
    const addCommentToThreadUseCase = this._container.getInstance(AddCommentToThreadUseCase.name);
    const { threadId } = request.params;
    const { id: owner } = request.auth.credentials;
    const useCasePayload = {
      owner,
      threadId,
      content: request.payload.content,
    }
    const addedComment = await addCommentToThreadUseCase.execute(useCasePayload);
    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentFromThreadHandler(request) {
    const deleteCommentFromThreadUseCase = this._container.getInstance(DeleteCommentFromThreadUseCase.name);
    const { commentId } = request.params;
    const { id: owner } = request.auth.credentials;
    const useCasePayload = {
      owner,
      commentId,
    }
    await deleteCommentFromThreadUseCase.execute(useCasePayload);
    return {
      status: 'success',
    };
  }
}

module.exports = CommentsHandler;
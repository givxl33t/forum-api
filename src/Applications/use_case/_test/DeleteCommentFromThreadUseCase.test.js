const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteCommentFromThreadUseCase = require('../DeleteCommentFromThreadUseCase');

describe('DeleteCommentFromThreadUseCase', () => {
  it('should throw error if use case payload not contain the correct property', async () => {
    const useCasePayload = {
      owner: 'user-123',
    };
    const deleteCommentFromThreadUseCase = new DeleteCommentFromThreadUseCase({});

    await expect(deleteCommentFromThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_COMMENT_FROM_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if a property is not string', async () => {
    const useCasePayload = {
      owner: 'user-123',
      commentId: 80085,
    };
    const deleteCommentFromThreadUseCase = new DeleteCommentFromThreadUseCase({});

    await expect(deleteCommentFromThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_COMMENT_FROM_THREAD_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION')
  });

  it('should orchestrating the the delete comment action correctly', async () => {
    const useCasePayload = {
      owner: 'user-123',
      commentId: 'comment-123',
    };
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.checkAvailabilityComment = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwnership = jest.fn(() => Promise.resolve());
    mockCommentRepository.deleteComment = jest.fn(() => Promise.resolve());

    const deleteCommentFromThreadUseCase = new DeleteCommentFromThreadUseCase({
      commentRepository: mockCommentRepository,
    });

    await deleteCommentFromThreadUseCase.execute(useCasePayload);

    expect(mockCommentRepository.verifyCommentOwnership)
      .toHaveBeenCalledWith(useCasePayload.commentId, useCasePayload.owner);
    expect(mockCommentRepository.checkAvailabilityComment)
      .toHaveBeenCalledWith(useCasePayload.commentId);
    expect(mockCommentRepository.deleteComment)
      .toHaveBeenCalledWith(useCasePayload.commentId);
  });
});
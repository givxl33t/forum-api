const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DeleteReplyFromCommentUseCase = require('../DeleteReplyFromCommentUseCase');

describe('DeleteReplyFromCommentUseCase', () => {
  it('should throw error if use case payload not contain the correct property', async () => {
    const useCasePayload = {
      owner: 'user-123',
    };
    const deleteReplyFromCommentUseCase = new DeleteReplyFromCommentUseCase({});

    await expect(deleteReplyFromCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_REPLY_FROM_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if a property is not string', async () => {
    const useCasePayload = {
      owner: 'user-123',
      replyId: {},
    };
    const deleteReplyFromCommentUseCase = new DeleteReplyFromCommentUseCase({});

    await expect(deleteReplyFromCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_REPLY_FROM_COMMENT_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the delete reply action correctly', async () => {
    const useCasePayload = {
      owner: 'user-123',
      replyId: 'reply-123',
    };
    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.checkAvailabilityReply = jest.fn(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwnership = jest.fn(() => Promise.resolve());
    mockReplyRepository.deleteReply = jest.fn(() => Promise.resolve());

    const deleteReplyFromCommentUseCase = new DeleteReplyFromCommentUseCase({
      replyRepository: mockReplyRepository,
    });

    await deleteReplyFromCommentUseCase.execute(useCasePayload);

    expect(mockReplyRepository.verifyReplyOwnership)
      .toHaveBeenCalledWith(useCasePayload.replyId, useCasePayload.owner);
    expect(mockReplyRepository.checkAvailabilityReply)
      .toHaveBeenCalledWith(useCasePayload.replyId);
    expect(mockReplyRepository.deleteReply)
      .toHaveBeenCalledWith(useCasePayload.replyId);
  });
});
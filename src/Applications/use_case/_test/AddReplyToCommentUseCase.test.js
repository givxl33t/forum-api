const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddReplyToCommentUseCase = require('../AddReplyToCommentUseCase');

describe('AddReplyToCommentUseCase', () => {
  it('should orchestrating the add reply to comment correctly', async () => {
    const useCasePayload = {
      owner: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
      content: 'isi balasan',
    };

    const expectedAddedReply = new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockReplyRepository.addReply = jest.fn(() => Promise.resolve(new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    })));
    mockCommentRepository.checkAvailabilityComment = jest.fn(() => Promise.resolve());
    mockThreadRepository.verifyThreadById = jest.fn(() => Promise.resolve());

    const getReplyToCommentUseCase = new AddReplyToCommentUseCase({ replyRepository: mockReplyRepository, commentRepository: mockCommentRepository, threadRepository: mockThreadRepository });
    
    const addedReply = await getReplyToCommentUseCase.execute(useCasePayload);

    expect(addedReply).toStrictEqual(expectedAddedReply);
    expect(mockThreadRepository.verifyThreadById).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.checkAvailabilityComment).toBeCalledWith(useCasePayload.commentId);
    expect(mockReplyRepository.addReply).toBeCalledWith(new AddReply({
      owner: useCasePayload.owner,
      threadId: useCasePayload.threadId,
      commentId: useCasePayload.commentId,
      content: useCasePayload.content,
    }));
  });
});
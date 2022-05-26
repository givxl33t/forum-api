const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require("../../../Domains/comments/entities/AddedComment");
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentToThreadUseCase = require('../AddCommentToThreadUseCase');

describe('AddCommentToThreadUseCase', () => {
  it('should orchestrating the add comment to thread correctly', async () => {
    const useCasePayload = {
      owner: 'user-123',
      threadId: 'thread-123',
      content: 'isi komentar',
    };

    const expectedAddedComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockCommentRepository.addComment = jest.fn(() => Promise.resolve(expectedAddedComment));
    mockThreadRepository.verifyThreadById = jest.fn(() => Promise.resolve());

    const getCommentToThreadUseCase = new AddCommentToThreadUseCase({ commentRepository: mockCommentRepository, threadRepository: mockThreadRepository });

    const addedComment = await getCommentToThreadUseCase.execute(useCasePayload);

    expect(addedComment).toStrictEqual(expectedAddedComment);
    expect(mockThreadRepository.verifyThreadById).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.addComment).toBeCalledWith(new AddComment({
      owner: useCasePayload.owner,
      threadId: useCasePayload.threadId,
      content: useCasePayload.content,
    }));
  });
});

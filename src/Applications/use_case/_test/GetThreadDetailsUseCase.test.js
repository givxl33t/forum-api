const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetThreadDetailsUseCase = require('../GetThreadDetailsUseCase');
const ThreadDetails = require('../../../Domains/threads/entities/ThreadDetails');
const CommentDetails = require('../../../Domains/comments/entities/CommentDetails');


describe('GetThreadDetailsUseCase', () => {
  it('should orchestrating the get thread details action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const expectedThreadDetails = {
      id: 'thread-123',
      title: 'judul thread',
      body: 'isi thread',
      date: 'now',
      username: 'dicoding',
    };

    const expectedCommentDetails = [
        {
          id: 'comment-123',
          username: 'dicoding',
          date: 'now',
          content: 'isi komentar',
        },
        {
          id: 'comment-456',
          username: 'dicoding',
          date: 'now',
          content: '**komentar telah dihapus**',
        }
      ];

    const expectedResult =  {
      id: 'thread-123',
      title: 'judul thread',
      body: 'isi thread',
      date: 'now',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'dicoding',
          date: 'now',
          content: 'isi komentar',
        },
        {
          id: 'comment-456',
          username: 'dicoding',
          date: 'now',
          content: '**komentar telah dihapus**',
        },
      ],
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    
    mockThreadRepository.getThreadsById = jest.fn(() => Promise.resolve(expectedThreadDetails));
    mockCommentRepository.getCommentByThreadId = jest.fn(() => Promise.resolve(expectedCommentDetails));

    const getThreadDetailsUseCase = new GetThreadDetailsUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    const actualThreadDetails = await getThreadDetailsUseCase.execute(useCasePayload);

    expect(actualThreadDetails).toStrictEqual(expectedResult);
    expect(mockThreadRepository.getThreadsById)
      .toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentByThreadId)
      .toBeCalledWith('thread-123');

  })
})
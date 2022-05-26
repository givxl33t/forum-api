const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const GetThreadDetailsUseCase = require('../GetThreadDetailsUseCase');


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

    const expectedReplyDetails = [
      {
        id: 'reply-123',
        content: 'sebuah balasan',
        date: 'now',
        username: 'dicoding',
      },
      {
        id: 'reply-456',
        content: '**balasan telah dihapus**',
        date: 'now',
        username: 'dicoding',
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
          replies: [
            {
              id: 'reply-123',
              content: 'sebuah balasan',
              date: 'now',
              username: 'dicoding',
            },
            {
              id: 'reply-456',
              content: '**balasan telah dihapus**',
              date: 'now',
              username: 'dicoding',
            },
          ],
          content: 'isi komentar',
        },
        {
          id: 'comment-456',
          username: 'dicoding',
          date: 'now',
          replies:[
            {
              id: 'reply-123',
              content: 'sebuah balasan',
              date: 'now',
              username: 'dicoding',
            },
            {
              id: 'reply-456',
              content: '**balasan telah dihapus**',
              date: 'now',
              username: 'dicoding',
            },
          ],
          content: '**komentar telah dihapus**',
        },
      ],
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    
    mockThreadRepository.getThreadsById = jest.fn(() => Promise.resolve(expectedThreadDetails));
    mockCommentRepository.getCommentByThreadId = jest.fn(() => Promise.resolve(expectedCommentDetails));
    mockReplyRepository.getReplyByCommentId = jest.fn(() => Promise.resolve(expectedReplyDetails));

    const getThreadDetailsUseCase = new GetThreadDetailsUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const actualThreadDetails = await getThreadDetailsUseCase.execute(useCasePayload);

    expect(actualThreadDetails).toStrictEqual(expectedResult);
    expect(mockThreadRepository.getThreadsById)
      .toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentByThreadId)
      .toBeCalledWith('thread-123');
    expect(mockReplyRepository.getReplyByCommentId)
      .toBeCalledWith('comment-123');
  })
})
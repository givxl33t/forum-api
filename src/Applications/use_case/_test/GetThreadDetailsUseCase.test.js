const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const GetThreadDetailsUseCase = require('../GetThreadDetailsUseCase');
const ThreadDetails = require('../../../Domains/threads/entities/ThreadDetails');
const CommentDetails = require('../../../Domains/comments/entities/CommentDetails');
const ReplyDetails = require('../../../Domains/replies/entities/ReplyDetails');


describe('GetThreadDetailsUseCase', () => {
  it('should orchestrating the get thread details action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    
    mockThreadRepository.getThreadsById = jest.fn(() => Promise.resolve(new ThreadDetails({
      id: 'thread-123',
      title: 'judul thread',
      body: 'isi thread',
      date: 'now',
      username: 'dicoding',
    })));
    mockCommentRepository.getCommentByThreadId = jest.fn(() => Promise.resolve([
      new CommentDetails({
        id: 'comment-123',
        username: 'dicoding',
        date: 'now',
        content: 'isi komentar',
        is_delete: false,
      }),
      new CommentDetails({
        id: 'comment-456',
        username: 'dicoding',
        date: 'now',
        content: '**komentar telah dihapus**',
        is_delete: true,
      }),
  ]));
    mockReplyRepository.getReplyByCommentId = jest.fn(() => Promise.resolve([
      new ReplyDetails ({
        id: 'reply-123',
        content: 'sebuah balasan',
        date: 'now',
        username: 'dicoding',
        is_delete: false,
      }),
      new ReplyDetails ({
        id: 'reply-456',
        content: '**balasan telah dihapus**',
        date: 'now',
        username: 'dicoding',
        is_delete: true,
      }),
    ]));

    const getThreadDetailsUseCase = new GetThreadDetailsUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const actualThreadDetails = await getThreadDetailsUseCase.execute(useCasePayload);

    expect(actualThreadDetails).toStrictEqual(
      expect.objectContaining({
        id: 'thread-123',
        title: 'judul thread',
        body: 'isi thread',
        date: 'now',
        username: 'dicoding',
        comments: expect.arrayContaining([
          expect.objectContaining({
            id: 'comment-123',
            username: 'dicoding',
            date: 'now',
            content: 'isi komentar',
            replies: expect.arrayContaining([
              expect.objectContaining({
                id: 'reply-123',
                content: 'sebuah balasan',
                date: 'now',
                username: 'dicoding',
              }),
              expect.objectContaining({
                id: 'reply-456',
                content: '**balasan telah dihapus**',
                date: 'now',
                username: 'dicoding',
              }),    
            ])
          }),
          expect.objectContaining({
            id: 'comment-456',
            username: 'dicoding',
            content: '**komentar telah dihapus**',
            replies: expect.arrayContaining([
              expect.objectContaining({
                id: 'reply-123',
                content: 'sebuah balasan',
                date: 'now',
                username: 'dicoding',
              }),
              expect.objectContaining({
                id: 'reply-456',
                content: '**balasan telah dihapus**',
                date: 'now',
                username: 'dicoding',
              }),    
            ])
          })
        ])
      })
    );
    expect(mockThreadRepository.getThreadsById)
      .toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentByThreadId)
      .toBeCalledWith('thread-123');
    expect(mockReplyRepository.getReplyByCommentId)
      .toBeCalledWith(['comment-123', 'comment-456']);
  })
})
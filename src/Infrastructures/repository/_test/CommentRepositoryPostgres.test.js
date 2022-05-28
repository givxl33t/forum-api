const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentDetails = require('../../../Domains/comments/entities/CommentDetails');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser([]);
    await ThreadsTableTestHelper.addThread([]);
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment to thread and return added comment correctly', async () => {
      const addComment = new AddComment({
        owner: 'user-123',
        threadId: 'thread-123',
        content: 'isi komentar',
      });

      const fakeIdGenerator = () => '420';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await commentRepositoryPostgres.addComment(addComment);

      const comments = await CommentsTableTestHelper.findCommentsById('comment-420');
      expect(comments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      const addComment = new AddComment({
        owner: 'user-123',
        threadId: 'thread-123',
        content: 'isi komentar',
      });
      const fakeIdGenerator = () => '420';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const addedComment = await commentRepositoryPostgres.addComment(addComment);

      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-420',
        content: 'isi komentar',
        owner: 'user-123',
      }));
    });
  });

  describe('deleteComment function', () => {
    it('should soft delete comment from database', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment({ id: 'comment-420' });

      await commentRepositoryPostgres.deleteComment('comment-420');

      const comments = await CommentsTableTestHelper.findCommentsById('comment-420');
      expect(comments).toHaveLength(0);
    });
  });

  describe('verifyCommentOwnership function', () => {
    it('should throw error if comments owner does not match with the auth credentials', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await CommentsTableTestHelper.addComment({ id: 'comment-420', owner: 'user-123'});

      await expect(commentRepositoryPostgres.verifyCommentOwnership('comment-420', 'user-420')).rejects.toThrow(AuthorizationError);
    });

    it('should not throw error if comments owner matches with the auth credentials', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
  
      await CommentsTableTestHelper.addComment({ id: 'comment-420', owner: 'user-123'});
      await expect(commentRepositoryPostgres.verifyCommentOwnership('comment-420', 'user-123')).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('checkAvailabilityComment function', () => {
    it('should throw NotFoundError if comment not available', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.checkAvailabilityComment('comment-420'))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError if comment is available', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await CommentsTableTestHelper.addComment({ id: 'comment-420'});

      await expect(commentRepositoryPostgres.checkAvailabilityComment('comment-420'))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('getCommentByThreadId function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      await CommentsTableTestHelper.addComment({ thread_id: 'thread-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.getCommentByThreadId('thread-500'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should return comments by thread details correctly', async () => {
      await CommentsTableTestHelper.addComment({ thread_id: 'thread-123', date: 'now'});
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const commentDetails = await commentRepositoryPostgres.getCommentByThreadId('thread-123');

      
      expect(commentDetails).toEqual(
        expect.arrayContaining([expect.objectContaining(new CommentDetails({
            id: 'comment-123',
            username: 'dicoding',
            date: 'now',
            content: 'isi komentar',
            is_delete: false,
          }))
        ])
      )
    });
  });
});
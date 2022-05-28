const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyDetails = require('../../../Domains/replies/entities/ReplyDetails');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser([]);
    await ThreadsTableTestHelper.addThread([]);
    await CommentsTableTestHelper.addComment([]);
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist add reply to comment and return added reply correctly', async () => {
      const addReply = new AddReply({
        owner: 'user-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
        content: 'isi balasan',
      });

      const fakeIdGenerator = () => '420';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      await replyRepositoryPostgres.addReply(addReply);

      const replies = await RepliesTableTestHelper.findRepliesById('reply-420');
      expect(replies).toHaveLength(1);
    });

    it('should return added reply correctly', async () => {
      const addReply = new AddReply({
        owner: 'user-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
        content: 'isi balasan',
      });
      const fakeIdGenerator = () => '420';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      const addedReply = await replyRepositoryPostgres.addReply(addReply);

      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-420',
        content: 'isi balasan',
        owner: 'user-123',
      }));
    });
  });

  describe('deleteReply function', () => {
    it('should soft delete reply from database', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      await RepliesTableTestHelper.addReply({ id: 'reply-420' });

      await replyRepositoryPostgres.deleteReply('reply-420');

      const replies = await RepliesTableTestHelper.findRepliesById('reply-420');
      expect(replies).toHaveLength(0);
    });
  });

  describe('verifyReplyOwnership function', () => {
    it('should throw error if reply owner does not match with the auth credentials', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await RepliesTableTestHelper.addReply({ id: 'reply-420', owner: 'user-123'});

      await expect(replyRepositoryPostgres.verifyReplyOwnership('reply-420', 'user-420')).rejects.toThrow(AuthorizationError);
    });

    it('should not throw error if reply owner matches with the auth credentials', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await RepliesTableTestHelper.addReply({ id: 'reply-420', owner: 'user-123'});
      await expect(replyRepositoryPostgres.verifyReplyOwnership('reply-420', 'user-123')).resolves.not.toThrowError(AuthorizationError);
    });
  });
  
  describe('checkAvailabilityReply function', () => {
    it('should throw NotFoundError if reply not available', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.checkAvailabilityReply('reply-420'))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError if reply is available', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await RepliesTableTestHelper.addReply({ id: 'reply-420'});

      await expect(replyRepositoryPostgres.checkAvailabilityReply('reply-420'))
        .resolves.not.toThrow(NotFoundError);
    });  
  });

  describe('getReplyByCommentId function', () => {
    it('should return replies by comment details correctly', async () => {
      await RepliesTableTestHelper.addReply({ comment_id: 'reply-123', date: 'now'});
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      const replyDetails = await replyRepositoryPostgres.getReplyByCommentId('comment-123');


      expect(replyDetails).toEqual(
        expect.arrayContaining([expect.objectContaining(new ReplyDetails({
            id: 'reply-123',
            content: 'isi balasan',
            date: 'now',
            username: 'dicoding',
            is_delete: false,
          }))
        ])
      )
    });
  });
});
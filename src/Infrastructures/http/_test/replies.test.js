const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted reply inside comment', async () => {
      const requestPayload = {
        content: 'isi balasan',
      };

      const accessToken = await ServerTestHelper.generateAccessToken();
      await ThreadsTableTestHelper.addThread([]);
      await CommentsTableTestHelper.addComment([]);
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}`}
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const requestPayload = {
        // properti kosong
      };
      const accessToken = await ServerTestHelper.generateAccessToken();
      await ThreadsTableTestHelper.addThread([]);
      await CommentsTableTestHelper.addComment([]);
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}`}
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat balasan baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const requestPayload = {
        content: 80085,
      };

      const accessToken = await ServerTestHelper.generateAccessToken();
      await ThreadsTableTestHelper.addThread([]);
      await CommentsTableTestHelper.addComment([]);
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}`}
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat balasan baru karena tipe data tidak sesuai');
    });

    it('should response 401 if a user authentication is missing', async () => {
      const requestPayload = {
        content: 'isi balasan',
      };

      await UsersTableTestHelper.addUser([]);
      await ThreadsTableTestHelper.addThread([]);
      await CommentsTableTestHelper.addComment([]);
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: {}
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 if the provided thread is not found', async () => {
      const requestPayload = {
        content: 'isi balasan',
      };

      const accessToken = await ServerTestHelper.generateAccessToken();
      await ThreadsTableTestHelper.addThread([]);
      await CommentsTableTestHelper.addComment([]);
      const server  = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/xxx/comments/comment-123/replies',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}`}
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });

    it('should response 404 if the provided comment is not found', async () => {
      const requestPayload = {
        content: 'isi balasan',
      };

      const accessToken = await ServerTestHelper.generateAccessToken();
      await ThreadsTableTestHelper.addThread([]);
      await CommentsTableTestHelper.addComment([]);
      const server  = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/xxx/replies',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}`}
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar tidak ditemukan di database');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 if reply valid', async () => {
      const requestPayload = {
        owner: 'user-123',
        replyId: 'reply-420',
      };

      const accessToken = await ServerTestHelper.generateAccessToken();
      await ThreadsTableTestHelper.addThread({ id: 'thread-420' });
      await CommentsTableTestHelper.addComment({ id: 'comment-420', owner: 'user-123', threadId: 'thread-420' });
      await RepliesTableTestHelper.addReply({ id: 'reply-420', owner: 'user-123', threadId: 'thread-420', commentId: 'comment-420' });
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-420/comments/comment-420/replies/reply-420',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}`}
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 404 if reply not registered in database', async () => {
      const requestPayload = {
        owner: 'user-123',
        replyId: 'reply-123',
      }

      const accessToken = await ServerTestHelper.generateAccessToken();
      await ThreadsTableTestHelper.addThread({ id: 'thread-123'});
      await CommentsTableTestHelper.addComment({  id: 'comment-123', owner: 'user-123', threadId: 'thread-123' });
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/replies-ygy',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}`}
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('balasan tidak ditemukan di database');
    });
  });
});

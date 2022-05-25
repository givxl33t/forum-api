const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment inside thread', async () => {
      const requestPayload = {
        content: 'isi komentar',
      };

      const accessToken = await ServerTestHelper.generateAccessToken();
      await ThreadsTableTestHelper.addThread([]);
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}`}
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const requestPayload = {
        // properti kosong
      };
      const accessToken = await ServerTestHelper.generateAccessToken();
      await ThreadsTableTestHelper.addThread([]);
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}`}
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada');  
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const requestPayload = {
        content: 80085,
      };

      const accessToken = await ServerTestHelper.generateAccessToken();
      await ThreadsTableTestHelper.addThread([]);
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}`}
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena tipe data tidak sesuai');
    });

    it('should response 401 if a user authentication is missing', async () => {
      const requestPayload = {
        content: 'isi komentar',
      };

      await UsersTableTestHelper.addUser([]);
      await ThreadsTableTestHelper.addThread([]);
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {}
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 if the provided thread is not found', async () => {
      const requestPayload = {
        content: 'isi komentar',
      };

      const accessToken = await ServerTestHelper.generateAccessToken();
      await ThreadsTableTestHelper.addThread([]);
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/xxx/comments',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}`}
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 if comments valid', async () => {
      const requestPayload = {
        owner: 'user-123',
        commentId: 'comment-420',
      };

      const accessToken = await ServerTestHelper.generateAccessToken();
      await ThreadsTableTestHelper.addThread({ id: 'thread-420'});
      await CommentsTableTestHelper.addComment({ id: 'comment-420', owner: 'user-123', threadId: 'thread-420' });
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-420/comments/comment-420',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 404 if comment not registered in database', async () => {
      const requestPayload = {
        owner: 'user-123',
        commentId: 'comment-123',
      }
      const accessToken = await ServerTestHelper.generateAccessToken();
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-ygy',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}`}
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar tidak ditemukan di database')
    });
  });
});
const AddComment = require('../AddComment');

describe('an AddComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      threadId: 'thread-420',
      content: 'isi komentar',
    };

    // Action and Assert
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      owner: 123123,
      threadId: 'thread-420',
      content: 'isi komentar',
    };

    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddComment object correctly', () => {
    const payload = {
      owner: 'user-420',
      threadId: 'thread-420',
      content: 'isi komentar',
    };

    const { owner, threadId, content } = new AddComment(payload);

    expect(owner).toEqual(payload.owner);
    expect(threadId).toEqual(payload.threadId);
    expect(content).toEqual(payload.content);
  });
});
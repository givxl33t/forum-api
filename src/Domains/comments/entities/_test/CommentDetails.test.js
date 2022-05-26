const CommentDetails = require('../CommentDetails');

describe('a CommentDetails entitites', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'comment-_pby2tmXV6bcvcdev8xk',
      username: 'johndoe',
      date: '2022-05-25T07:22:33.555Z',
    };

    expect(() => new CommentDetails(payload)).toThrowError('COMMENT_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 'comment-_pby2tmXV6bcvcdev8xk',
      username: 'johndoe',
      date: '2022-05-25T07:22:33.555Z',
      content: 222,
    };

    expect(() => new CommentDetails(payload)).toThrowError('COMMENT_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CommentDetails object correctly', () => {
    const payload = {
      id: 'comment-_pby2tmXV6bcvcdev8xk',
      username: 'johndoe',
      date: '2022-05-25T07:22:33.555Z',
      content: "sebuah comment",
    };

    const { id, username, date, content } = new CommentDetails(payload);

    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(content).toEqual(payload.content);
  });
});
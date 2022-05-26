const ThreadDetails = require('../ThreadDetails');

describe('a ThreadDetails entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'thread-420420',
      title: 'UwU',
      body: 'isi thread',
    };

    expect(() => new ThreadDetails(payload)).toThrowError('THREAD_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 1010,
      title: 'title',
      body: 'body',
      date: 'date',
      username: 'username',
    };

    expect(() => new ThreadDetails(payload)).toThrowError('THREAD_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create ThreadDetails object correctly', () => {
    const payload = {
      id: 'thread-123',
      title: 'judul thread',
      body: 'isi thread',
      date: '2022-05-25T07:19:09.775Z',
      username: 'Alip3422',
    };

    const { id, title, body, date, username } = new ThreadDetails(payload);

    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
  });
});
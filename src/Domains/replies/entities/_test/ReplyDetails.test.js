const ReplyDetails = require('../ReplyDetails');

describe('a ReplyDetails entitites', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'reply-BErOXUSefjwWGW1Z10Ihk',
      content: 'sebuah balasan',
      date: '2021-08-08T08:07:01.522Z',
    };

    expect(() => new ReplyDetails(payload)).toThrowError('REPLY_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id:   'reply-BErOXUSefjwWGW1Z10I',
      content: 'a rerpyly',
      date: 333,
      username: 'dohnjoe',
    };

    expect(() => new ReplyDetails(payload)).toThrowError('REPLY_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create ReplyDetails object correctly', () => {
    const payload = {
      id: 'reply-123',
      content: 'isi balasan',
      date: '2021-08-08T08:07:01',
      username: 'dohnjoe',
    };

    const { id, content, date, username } = new ReplyDetails(payload);

    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
  });
});
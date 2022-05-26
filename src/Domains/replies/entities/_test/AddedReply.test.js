const AddedReply = require('../AddedReply');

describe('an AddedReply entitites', () => {
  it('should throw an error when payload did not contain needed property', () => {
    const payload = {
      content: 'isi balasan',
      owner: 'user-3232',
    };

    expect(() => new AddedReply(payload)).toThrowError('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: {},
      content: 'isi balasan',
      owner: 'user-3232',
    };

    expect(() => new AddedReply(payload)).toThrowError('ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addedReply object correctly', () => {
    const payload = {
      id: 'reply-123',
      content: 'isi balasan',
      owner: 'user-3232',
    };

    const addedReply = new AddedReply(payload);

    expect(addedReply.id).toEqual(payload.id);
    expect(addedReply.content).toEqual(payload.content);
    expect(addedReply.owner).toEqual(payload.owner);
  })
})
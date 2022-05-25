const AddThread = require('../AddThread');

describe('an AddThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      body: 'isi thread',
    };

    // Action and Assert
    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      owner: 'user-123',
      title: 420,
      body: 'juju on that beat',
    };

    // Action and Assert
    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION')
  });

  it('should create AddThread object correctly', () => {
    // Arrange
    const payload = {
      owner: 'user-420',
      title: 'judul thread',
      body: 'isi thread',
    };

    // Action
    const { owner, title, body } = new AddThread(payload);

    //Assert
    expect(owner).toEqual(payload.owner);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
  });
});
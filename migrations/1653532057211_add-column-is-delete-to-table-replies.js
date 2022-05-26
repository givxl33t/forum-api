/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.addColumn('replies', {
    is_delete: {
      type: 'BOOLEAN',
      notNull: true,
      default: false,
    },
  })
};

exports.down = (pgm) => {
  pgm.dropColumn('replies', 'is_delete');
};
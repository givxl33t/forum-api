class GetThreadDetailsUseCase {
  constructor({ 
    threadRepository,
    commentRepository,
    replyRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;

    const thread = await this._threadRepository.getThreadsById(threadId);
    let comments = await this._commentRepository.getCommentByThreadId(threadId);
    comments = await Promise.all(comments.map(async (comment) => {
      const replies = await this._replyRepository.getReplyByCommentId(comment.id);
      comment.replies = replies;
      return comment;
    }))

    return { ...thread, comments };
  }
}

module.exports = GetThreadDetailsUseCase;
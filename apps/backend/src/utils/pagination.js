export const parsePagination = (
  query = {},
  { defaultLimit = 20, maxLimit = 100 } = {},
) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const rawLimit = Number.parseInt(query.limit, 10) || defaultLimit;
  const limit = Math.min(Math.max(1, rawLimit), maxLimit);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

export const buildPaginationMeta = ({ total, page, limit }) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

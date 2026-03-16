export function paginate(data, total, page, limit) {
  return {
    success: true,
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    message: 'Success',
  };
}
// eslint-disable-next-line import/prefer-default-export
export const executeDeletedMiddleware = (req, _res, next) => {
  req.filterObject = {
    isDeleted: {
      $ne: true,
    },
  };

  next();
};

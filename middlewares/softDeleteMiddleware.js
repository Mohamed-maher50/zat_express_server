exports.executeDeletedMiddleware = (req, res, next) => {
  req.filterObject = {
    isDeleted: {
      $ne: true,
    },
  };

  next();
};

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.log("Error=========", err);
    next(err)});
};

module.exports = catchAsync;
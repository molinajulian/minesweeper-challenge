exports.createGameMapper = req => ({
  userId: req.user.id,
  width: req.body.width,
  height: req.body.height,
  minesAmount: req.body.mines_amount
});

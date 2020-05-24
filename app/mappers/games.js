exports.createGameMapper = req => ({
  userId: req.user.id,
  width: req.body.width,
  height: req.body.height,
  minesAmount: req.body.mines_amount
});

exports.playGameMapper = req => ({
  gameId: req.params.gameId,
  x: req.body.x,
  y: req.body.y,
  flag: req.body.flag
});

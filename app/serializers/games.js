const Datetime = require('luxon').DateTime;

exports.playGameSerializer = ({ game, values, lost = false, won = false }) => {
  const time = Datetime.local()
    .diff(Datetime.fromMillis(game.createdAt.valueOf()))
    .toFormat('hh mm ss');
  const timeSplitted = time.split(' ');
  const timeFormatted = `${timeSplitted[0]} hours, ${timeSplitted[1]} minutes and ${timeSplitted[2]} seconds`;
  return {
    values,
    lost: won ? undefined : lost,
    time: lost || won ? timeFormatted : undefined,
    win: won && !lost ? won : undefined
  };
};

const Datetime = require('luxon').DateTime;

exports.playGameSerializer = ({ game, values, lost }) => {
  const time = Datetime.local()
    .diff(Datetime.fromMillis(game.createdAt.valueOf()))
    .toFormat('hh mm ss');
  const timeSplitted = time.split(' ');
  const timeFormatted = `${timeSplitted[0]} hours, ${timeSplitted[1]} minutes and ${timeSplitted[2]} seconds`;
  return {
    values,
    lost,
    time: lost ? timeFormatted : undefined
  };
};

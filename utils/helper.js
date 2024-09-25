const dateConverter = (value) => {
  const [month, day, year] = value.split('/');
  const date = new Date(`${year}-${month}-${day}`);
  return date;
};

module.exports = {
  dateConverter,
};

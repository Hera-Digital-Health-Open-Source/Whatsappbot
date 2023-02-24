exports.sleep = function (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

exports.getDateFromDDMMYYYY = function (dateStr) {
  if (isNaN(dateStr)) {
    return false
  }
  const day = parseInt(dateStr.substring(0, 2));
  const month = parseInt(dateStr.substring(2, 4));
  const year = parseInt(dateStr.substring(4, 8));
  const date = new Date(year, month - 1, day);
  console.log(date);
  if (date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year) {
    return date;
  } else {
    return false;
  };
}
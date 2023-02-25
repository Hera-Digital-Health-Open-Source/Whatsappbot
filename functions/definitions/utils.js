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
  if (date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year) {
    return date;
  } else {
    return false;
  };
}

exports.timestampToString = function (timestamp) {
  const date = timestamp.toDate();
  // Format the Date as a string in the format ddmmyyyy
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  const formattedDate = date.toLocaleDateString('en-GB', options);
  return formattedDate;
}
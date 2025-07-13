export const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const formatDateTime = (dateString, timeString) => {
  const date = new Date(dateString);
  const [hours, minutes] = timeString.split(":");
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toLocaleString();
};

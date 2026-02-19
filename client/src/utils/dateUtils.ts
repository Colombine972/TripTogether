export const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("fr-FR", options);
};

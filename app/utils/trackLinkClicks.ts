// utils/trackLinkClicks.ts

export const trackLinkClick = (route: string) => {
  const clicks = JSON.parse(localStorage.getItem("linkClicks") || "{}");
  if (!clicks[route]) {
    clicks[route] = 1; // Initialize the count to 1
  }
  localStorage.setItem("linkClicks", JSON.stringify(clicks));
};

export const getFrequentLinks = (limit: number = 7) => {
  const clicks = JSON.parse(localStorage.getItem("linkClicks") || "{}");
  const sortedLinks = Object.entries(clicks)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, limit)
    .map(([route]) => route);
  return sortedLinks;
};

export const clearLinkClicks = () => {
  localStorage.removeItem("linkClicks");
};

export const handleLinkClick = (route: string) => {
  trackLinkClick(route);
};

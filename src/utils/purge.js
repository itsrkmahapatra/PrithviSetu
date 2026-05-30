export const purgeComponentState = (...setters) => {
  setters.forEach(setter => setter(null));
};

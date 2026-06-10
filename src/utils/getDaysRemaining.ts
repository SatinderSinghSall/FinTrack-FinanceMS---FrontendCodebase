export const getDaysRemaining = (renewalDate: string) => {
  const today = new Date();

  const renewal = new Date(renewalDate);

  const difference = renewal.getTime() - today.getTime();

  return Math.ceil(difference / (1000 * 60 * 60 * 24));
};

export const calculateFare = (baseFare: number, passengerCount: number) => {
  const normalizedPassengers = Math.max(1, passengerCount);
  return Math.round(baseFare * normalizedPassengers * 100) / 100;
};

export type SubscriptionCountry = "Украина" | "Турция";

export type SubscriptionPlan = {
  id: string;
  country: SubscriptionCountry;
  service: "PlayStation Plus" | "EA Play";
  tier: "Essential" | "Extra" | "Deluxe" | "EA Play";
  duration: "1 месяц" | "3 месяца" | "12 месяцев";
  price: number;
};

export const subscriptionCountries: SubscriptionCountry[] = ["Украина", "Турция"];

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "ua-essential-1",
    country: "Украина",
    service: "PlayStation Plus",
    tier: "Essential",
    duration: "1 месяц",
    price: 900,
  },
  {
    id: "ua-essential-3",
    country: "Украина",
    service: "PlayStation Plus",
    tier: "Essential",
    duration: "3 месяца",
    price: 1500,
  },
  {
    id: "ua-essential-12",
    country: "Украина",
    service: "PlayStation Plus",
    tier: "Essential",
    duration: "12 месяцев",
    price: 3300,
  },
  {
    id: "ua-extra-1",
    country: "Украина",
    service: "PlayStation Plus",
    tier: "Extra",
    duration: "1 месяц",
    price: 1200,
  },
  {
    id: "ua-extra-3",
    country: "Украина",
    service: "PlayStation Plus",
    tier: "Extra",
    duration: "3 месяца",
    price: 2400,
  },
  {
    id: "ua-extra-12",
    country: "Украина",
    service: "PlayStation Plus",
    tier: "Extra",
    duration: "12 месяцев",
    price: 5200,
  },
  {
    id: "ua-deluxe-1",
    country: "Украина",
    service: "PlayStation Plus",
    tier: "Deluxe",
    duration: "1 месяц",
    price: 1300,
  },
  {
    id: "ua-deluxe-3",
    country: "Украина",
    service: "PlayStation Plus",
    tier: "Deluxe",
    duration: "3 месяца",
    price: 2700,
  },
  {
    id: "ua-deluxe-12",
    country: "Украина",
    service: "PlayStation Plus",
    tier: "Deluxe",
    duration: "12 месяцев",
    price: 5800,
  },
  {
    id: "ua-ea-play-1",
    country: "Украина",
    service: "EA Play",
    tier: "EA Play",
    duration: "1 месяц",
    price: 800,
  },
  {
    id: "ua-ea-play-12",
    country: "Украина",
    service: "EA Play",
    tier: "EA Play",
    duration: "12 месяцев",
    price: 2400,
  },
  {
    id: "tr-essential-1",
    country: "Турция",
    service: "PlayStation Plus",
    tier: "Essential",
    duration: "1 месяц",
    price: 1300,
  },
  {
    id: "tr-essential-3",
    country: "Турция",
    service: "PlayStation Plus",
    tier: "Essential",
    duration: "3 месяца",
    price: 3000,
  },
  {
    id: "tr-essential-12",
    country: "Турция",
    service: "PlayStation Plus",
    tier: "Essential",
    duration: "12 месяцев",
    price: 6300,
  },
  {
    id: "tr-extra-1",
    country: "Турция",
    service: "PlayStation Plus",
    tier: "Extra",
    duration: "1 месяц",
    price: 1900,
  },
  {
    id: "tr-extra-3",
    country: "Турция",
    service: "PlayStation Plus",
    tier: "Extra",
    duration: "3 месяца",
    price: 3750,
  },
  {
    id: "tr-extra-12",
    country: "Турция",
    service: "PlayStation Plus",
    tier: "Extra",
    duration: "12 месяцев",
    price: 9990,
  },
  {
    id: "tr-deluxe-1",
    country: "Турция",
    service: "PlayStation Plus",
    tier: "Deluxe",
    duration: "1 месяц",
    price: 1950,
  },
  {
    id: "tr-deluxe-3",
    country: "Турция",
    service: "PlayStation Plus",
    tier: "Deluxe",
    duration: "3 месяца",
    price: 4150,
  },
  {
    id: "tr-deluxe-12",
    country: "Турция",
    service: "PlayStation Plus",
    tier: "Deluxe",
    duration: "12 месяцев",
    price: 11500,
  },
  {
    id: "tr-ea-play-1",
    country: "Турция",
    service: "EA Play",
    tier: "EA Play",
    duration: "1 месяц",
    price: 900,
  },
  {
    id: "tr-ea-play-12",
    country: "Турция",
    service: "EA Play",
    tier: "EA Play",
    duration: "12 месяцев",
    price: 3500,
  },
];

export function formatSubscriptionPrice(price: number) {
  return `${new Intl.NumberFormat("ru-RU").format(price)} ₽`;
}

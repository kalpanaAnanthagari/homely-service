/** Demo booking: user picks a duration; slot times are created on the server. */

export const MOCK_DURATION_OPTIONS = [
  {
    hours: 1,
    label: "1 hour",
    description: "Quick tidy-up or focused task",
  },
  {
    hours: 2,
    label: "2 hours",
    description: "Typical home visit",
  },
  {
    hours: 4,
    label: "4 hours",
    description: "Deep clean or multiple rooms",
  },
] as const;

export type MockDurationHours = (typeof MOCK_DURATION_OPTIONS)[number]["hours"];

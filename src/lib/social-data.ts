export type Platform = "facebook" | "instagram" | "whatsapp" | "tiktok";

export const platformMeta: Record<
  Platform,
  { label: string; color: string; badge: string; dot: string }
> = {
  facebook: {
    label: "Facebook",
    color: "text-facebook",
    badge: "bg-facebook/10 text-facebook",
    dot: "bg-facebook",
  },
  instagram: {
    label: "Instagram",
    color: "text-instagram",
    badge: "bg-instagram/10 text-instagram",
    dot: "bg-instagram",
  },
  whatsapp: {
    label: "WhatsApp",
    color: "text-whatsapp",
    badge: "bg-whatsapp/10 text-whatsapp",
    dot: "bg-whatsapp",
  },
  tiktok: {
    label: "TikTok",
    color: "text-tiktok",
    badge: "bg-tiktok/10 text-tiktok",
    dot: "bg-tiktok",
  },
};

export type Account = {
  id: string;
  platform: Platform;
  name: string;
  handle: string;
  connected: boolean;
  followers: number;
};

export const accounts: Account[] = [
  {
    id: "fb-1",
    platform: "facebook",
    name: "Northlight Studio",
    handle: "@northlight",
    connected: false,
    followers: 18420,
  },
  {
    id: "ig-1",
    platform: "instagram",
    name: "Northlight Studio",
    handle: "@northlight.studio",
    connected: false,
    followers: 26310,
  },
  {
    id: "wa-1",
    platform: "whatsapp",
    name: "Northlight Support",
    handle: "+1 555 0142",
    connected: false,
    followers: 3980,
  },
  {
    id: "tt-1",
    platform: "tiktok",
    name: "Northlight Studio",
    handle: "@northlightstudio",
    connected: false,
    followers: 41250,
  },
];

export type Conversation = {
  id: string;
  platform: Platform;
  accountId: string;
  person: string;
  preview: string;
  time: string;
  unread: boolean;
  messages: { from: "them" | "us"; body: string; time: string }[];
};

export const conversations: Conversation[] = [
  {
    id: "c1",
    platform: "instagram",
    accountId: "ig-1",
    person: "Amara Okafor",
    preview: "Is the linen tote back in stock?",
    time: "2m",
    unread: true,
    messages: [
      { from: "them", body: "Hey! Is the linen tote back in stock?", time: "2m" },
    ],
  },
  {
    id: "c2",
    platform: "whatsapp",
    accountId: "wa-1",
    person: "Rafi Hasan",
    preview: "Order #4821 arrived — thank you!",
    time: "14m",
    unread: true,
    messages: [
      { from: "them", body: "Order #4821 arrived — thank you!", time: "14m" },
      { from: "us", body: "So glad it landed safely, Rafi.", time: "12m" },
    ],
  },
  {
    id: "c3",
    platform: "facebook",
    accountId: "fb-1",
    person: "Dana Whitfield",
    preview: "Do you ship to Canada?",
    time: "1h",
    unread: false,
    messages: [{ from: "them", body: "Do you ship to Canada?", time: "1h" }],
  },
  {
    id: "c4",
    platform: "instagram",
    accountId: "ig-1",
    person: "Kelsey Marr",
    preview: "Loved the behind-the-scenes reel 🔥",
    time: "3h",
    unread: false,
    messages: [
      { from: "them", body: "Loved the behind-the-scenes reel 🔥", time: "3h" },
    ],
  },
  {
    id: "c5",
    platform: "whatsapp",
    accountId: "wa-1",
    person: "Studio Wholesale",
    preview: "Sending the updated PO tomorrow.",
    time: "5h",
    unread: false,
    messages: [
      { from: "them", body: "Sending the updated PO tomorrow.", time: "5h" },
    ],
  },
  {
    id: "c6",
    platform: "tiktok",
    accountId: "tt-1",
    person: "@rune.makes",
    preview: "Can we duet the dye process clip?",
    time: "22m",
    unread: true,
    messages: [
      { from: "them", body: "Can we duet the dye process clip?", time: "22m" },
    ],
  },
];

export type ScheduledPost = {
  id: string;
  platforms: Platform[];
  accountIds: string[];
  body: string;
  date: string;
  time: string;
  status: "scheduled" | "draft" | "published";
};

export const scheduledPosts: ScheduledPost[] = [
  {
    id: "p1",
    platforms: ["instagram", "facebook"],
    accountIds: ["ig-1", "fb-1"],
    body: "New drop: the Harbour linen tote, woven in small batches.",
    date: "Mon 22 Sep",
    time: "09:00",
    status: "scheduled",
  },
  {
    id: "p2",
    platforms: ["whatsapp"],
    accountIds: ["wa-1"],
    body: "Broadcast: early access opens tonight for list members.",
    date: "Mon 22 Sep",
    time: "18:30",
    status: "scheduled",
  },
  {
    id: "p3",
    platforms: ["instagram"],
    accountIds: ["ig-1"],
    body: "Studio diary #12 — three colourways, one dye bath.",
    date: "Wed 24 Sep",
    time: "11:15",
    status: "draft",
  },
  {
    id: "p4",
    platforms: ["facebook", "instagram", "whatsapp"],
    accountIds: ["fb-1", "ig-1", "wa-1"],
    body: "Autumn workshop dates are live. Twelve seats only.",
    date: "Fri 26 Sep",
    time: "08:00",
    status: "scheduled",
  },
  {
    id: "p5",
    platforms: ["tiktok", "instagram"],
    accountIds: ["tt-1", "ig-1"],
    body: "60s loom timelapse — the Harbour tote from thread to tag.",
    date: "Tue 23 Sep",
    time: "19:00",
    status: "scheduled",
  },
];

export const reachSeries: { day: string; facebook: number; instagram: number; whatsapp: number; tiktok: number }[] = [];

export const engagementSeries: { day: string; value: number }[] = [];

export const formatNumber = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

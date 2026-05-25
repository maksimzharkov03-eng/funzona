import {
  getRubPriceByUahPrice,
  getRubPriceByTryPrice,
  roundTryPrice,
  roundUahPrice,
  type MarketplaceGame,
} from "@/app/lib/games";

function game(
  id: number,
  title: string,
  image: string,
  originalPrice: number,
  options: Partial<MarketplaceGame> = {}
): MarketplaceGame {
  return {
    id,
    title,
    image,
    platform: options.platform || "PS5",
    region: "Турция",
    originalPrice: roundTryPrice(originalPrice),
    currency: "TRY",
    rubPrice: getRubPriceByTryPrice(originalPrice),
    oldRubPrice: options.oldRubPrice || null,
    discountPercent: options.discountPercent || null,
    genre: options.genre || "PlayStation Store",
    publisher: options.publisher || "PlayStation",
    edition: options.edition || "Digital Edition",
    badge: options.badge || null,
    description:
      options.description ||
      "Игра из актуальной витрины PlayStation Store Turkey для каталога FunZona.",
    isFeatured: Boolean(options.isFeatured),
  };
}

function uaGame(
  id: number,
  title: string,
  image: string,
  originalPrice: number,
  options: Partial<MarketplaceGame> = {}
): MarketplaceGame {
  return {
    id,
    title,
    image,
    platform: options.platform || "PS5",
    region: "Украина",
    originalPrice: roundUahPrice(originalPrice),
    currency: "UAH",
    rubPrice: getRubPriceByUahPrice(originalPrice),
    oldRubPrice: options.oldRubPrice || null,
    discountPercent: options.discountPercent || null,
    genre: options.genre || "PlayStation Store",
    publisher: options.publisher || "PlayStation",
    edition: options.edition || "Digital Edition",
    badge: options.badge || "UA",
    description:
      options.description ||
      "Игра из украинского региона PlayStation Store для каталога FunZona.",
    isFeatured: Boolean(options.isFeatured),
  };
}

const psStoreGamesRaw: MarketplaceGame[] = [
  game(
    10001130,
    "Call of Duty®",
    "https://image.api.playstation.com/pr/bam-art/222/196/cd4b5ccb-6cd8-4566-a3fb-ca8b65b3a6fa.jpg",
    2999,
    {
      genre: "Shooter",
      badge: "Latest",
      isFeatured: true,
      description:
        "Актуальная карточка Call of Duty из турецкой витрины PlayStation Store.",
    }
  ),
  game(
    10009568,
    "Battlefield 6",
    "https://image.api.playstation.com/pr/bam-art/222/196/8294c8a7-ec75-4d7d-9bd4-380edbd32b00.jpg",
    2899,
    { genre: "Shooter", badge: "Latest", isFeatured: true }
  ),
  game(
    10011898,
    "EA SPORTS FC™ 26 Standard Edition",
    "https://image.api.playstation.com/vulcan/ap/rnd/202507/1617/2e757ffb0a6bb4b91af84db64e0183d725e56e5354f45eba.png",
    2899.99,
    {
      genre: "Sports",
      badge: "Standard",
      edition: "Standard Edition",
      platform: "PS4/PS5",
      isFeatured: true,
      description:
        "Стандартное издание EA SPORTS FC 26 для PS4 и PS5 из турецкого PlayStation Store.",
    }
  ),
  game(
    10011899,
    "EA SPORTS FC™ 26 Ultimate Edition",
    "https://image.api.playstation.com/vulcan/ap/rnd/202507/1617/545c2ee83dd7df16ebf1cdd6bcb039016658974439401189.png",
    4000,
    {
      genre: "Sports",
      badge: "Ultimate",
      edition: "Ultimate Edition",
      platform: "PS4/PS5",
      isFeatured: true,
      description:
        "Ultimate Edition EA SPORTS FC 26 для PS4 и PS5 из турецкого PlayStation Store.",
    }
  ),
  game(
    10014149,
    "NBA 2K26",
    "https://image.api.playstation.com/pr/bam-art/216/823/4acb28cc-560a-4a05-a81f-d8f409ac0267.jpg",
    2899,
    { genre: "Sports", badge: "Latest" }
  ),
  game(
    10003610,
    "Arc Raiders",
    "https://image.api.playstation.com/pr/bam-art/217/689/5975a363-bfbc-4454-8617-e0385f1768f7.jpg",
    1499,
    { genre: "Action", badge: "New" }
  ),
  game(
    10011468,
    "Dying Light the Beast",
    "https://image.api.playstation.com/pr/bam-art/222/201/e1a56f73-e15e-46d1-91fa-6d4e6f96c2ed.jpg",
    1999,
    { genre: "Horror", badge: "New" }
  ),
  game(
    20000002,
    "Forza Horizon 5",
    "https://image.api.playstation.com/vulcan/ap/rnd/202502/1900/631436cfbc1d64659c778e3783f29fafad6022145e0ffec8.jpg",
    924.6,
    { genre: "Racing", badge: "Popular" }
  ),
  game(
    20000003,
    "Diablo® IV",
    "https://image.api.playstation.com/vulcan/ap/rnd/202405/3123/218ac4e34bf15f7cdfa24f7e452cadf2ebb378c765d242fe.jpg",
    541,
    { genre: "RPG", badge: "Discount", oldRubPrice: 4320, discountPercent: 50 }
  ),
  game(
    20000005,
    "Grand Theft Auto V",
    "https://image.api.playstation.com/vulcan/ap/rnd/202605/1305/c0fc8d262a1c6c21490cc664dd5959112b059e2a64207865.png",
    349.5,
    { genre: "Action", badge: "Popular", platform: "PS4/PS5" }
  ),
  game(
    20000006,
    "ASTRO BOT",
    "https://image.api.playstation.com/vulcan/ap/rnd/202406/0500/ae5bd5dc2ab0e6a4f8c1d2510cc50bb642f20980fd53f676.png",
    699,
    { genre: "Adventure", badge: "PS5" }
  ),
  game(
    20000007,
    "Minecraft",
    "https://image.api.playstation.com/vulcan/ap/rnd/202407/1020/91fe046f742042e3b31e57f7731dbe2226e1fd1e02a36223.jpg",
    849,
    { genre: "Adventure", badge: "Popular", platform: "PS4/PS5" }
  ),
  game(
    20000009,
    "Directive 8020",
    "https://image.api.playstation.com/vulcan/ap/rnd/202408/0522/3d39d2bd3efa79aa1401d51242edb57a42c31245d1ec4f36.png",
    149,
    { genre: "Horror", badge: "Pre-order" }
  ),
  game(
    20000010,
    "Mixtape",
    "https://image.api.playstation.com/vulcan/ap/rnd/202602/2500/2ef26cfaf8377e0d625ca3f61cafeb161c3720f9a134df26.png",
    816,
    { genre: "Adventure", badge: "New" }
  ),
  game(
    20000011,
    "I Am Cat",
    "https://image.api.playstation.com/vulcan/ap/rnd/202501/0912/fc915b1278e6b9d76a06a98eb30db8e89ae143baa47d5f3a.jpg",
    649,
    { genre: "Simulation", badge: "New" }
  ),
  game(
    20000012,
    "SAROS",
    "https://image.api.playstation.com/vulcan/ap/rnd/202509/2318/56a1375534b11bba4f1d733c915f492c753ac995d3c044ab.png",
    449,
    { genre: "Action", badge: "New" }
  ),
  game(
    20000014,
    "Pawbay",
    "https://image.api.playstation.com/vulcan/ap/rnd/202508/1211/275015ea9ed8af0b36ad6f13d956f5e670566195ecdfc2cc.png",
    849,
    { genre: "Adventure", badge: "New" }
  ),
  game(
    20000015,
    "Outbound",
    "https://image.api.playstation.com/vulcan/ap/rnd/202512/0223/1914db8ba62ff41798d0a89159d4028d927fe5b1e492dc67.png",
    649,
    { genre: "Simulation", badge: "New" }
  ),
  game(
    20000016,
    "Bus Bound",
    "https://image.api.playstation.com/vulcan/ap/rnd/202602/2015/bb1ac61cfe78e0f00e4ee4b3112050f93d6978a150c59cda.png",
    299,
    { genre: "Simulation", badge: "New" }
  ),
];

export const psStoreGames: MarketplaceGame[] = psStoreGamesRaw.filter(
  (game) => game.originalPrice > 0
);

export const uaStoreGames: MarketplaceGame[] = [
  uaGame(
    30000001,
    "Издание Ultimate UFC™ 6",
    "https://image.api.playstation.com/vulcan/ap/rnd/202604/2217/981396baf68ab59a8d000a6bdfdd1bd7891e06332bc16d36.png",
    3999,
    { genre: "Sports", badge: "RU-UA", edition: "Ultimate Edition", isFeatured: true }
  ),
  uaGame(
    30000002,
    "Gothic 1 Remake",
    "https://image.api.playstation.com/vulcan/ap/rnd/202507/0714/683bb359dcdc3856e433ebadaa56dde7fc04403cea152cf7.png",
    1799,
    { genre: "RPG", badge: "RU-UA", platform: "PS4/PS5" }
  ),
  uaGame(
    30000003,
    "Hell Let Loose: Vietnam - Deluxe Edition",
    "https://image.api.playstation.com/vulcan/ap/rnd/202605/0711/118efc02d634b7c3593c7f9b2a7206c799e7cb1771133cf8.png",
    1799,
    { genre: "Shooter", badge: "RU-UA Deluxe" }
  ),
  uaGame(
    30000004,
    "Assassin's Creed Black Flag Resynced",
    "https://image.api.playstation.com/vulcan/ap/rnd/202603/1215/0962bc91a4952e6433367fcfec38b7e0655c6bd29b431712.png",
    1799,
    { genre: "Adventure", badge: "RU-UA" }
  ),
  uaGame(
    30000005,
    "UFC™ 6",
    "https://image.api.playstation.com/vulcan/ap/rnd/202604/2216/83baec5746075ec3e379c096dfe68111095c91cb7139a633.png",
    2599,
    { genre: "Sports", badge: "RU-UA", isFeatured: true }
  ),
  uaGame(
    30000006,
    "Monopoly: Star Wars™ Heroes vs. Villains",
    "https://image.api.playstation.com/vulcan/ap/rnd/202604/0912/91290823641cd9c9684d7ebca4cb1f2b7136275bb9a4d043.png",
    899,
    { genre: "Family", badge: "RU-UA" }
  ),
  uaGame(
    30000007,
    "The Blood of Dawnwalker",
    "https://image.api.playstation.com/vulcan/ap/rnd/202603/3009/4bf61f8869f55ee0a930f3d1f00992559c1d4a2d52e00408.png",
    1999,
    { genre: "RPG", badge: "RU-UA" }
  ),
  uaGame(
    30011898,
    "EA SPORTS FC™ 26",
    "https://image.api.playstation.com/vulcan/ap/rnd/202507/2511/19ad6574090b6a71c88f0e6152ae5a668cc85882d87c51b5.png",
    2399,
    { genre: "Sports", badge: "RU-UA", isFeatured: true }
  ),
  uaGame(
    30000008,
    "LEGO® Бэтмен™: Наследие Темного рыцаря",
    "https://image.api.playstation.com/vulcan/ap/rnd/202508/1316/3302f35b66691aa405aee31624c0c95fe73081be8e0c75bb.png",
    1999,
    { genre: "Adventure", badge: "RU-UA" }
  ),
  uaGame(
    30000009,
    "Forza Horizon 5",
    "https://image.api.playstation.com/vulcan/ap/rnd/202502/1900/631436cfbc1d64659c778e3783f29fafad6022145e0ffec8.jpg",
    719.4,
    { genre: "Racing", badge: "RU-UA Discount", oldRubPrice: getRubPriceByUahPrice(1199), discountPercent: 40 }
  ),
  uaGame(
    30000010,
    "Directive 8020",
    "https://image.api.playstation.com/vulcan/ap/rnd/202408/0522/3d39d2bd3efa79aa1401d51242edb57a42c31245d1ec4f36.png",
    1499,
    { genre: "Horror", badge: "RU-UA" }
  ),
  uaGame(
    30000011,
    "S.T.A.L.K.E.R. 2: Heart of Chornobyl",
    "https://image.api.playstation.com/vulcan/ap/rnd/202506/0614/498f7950fc2a3ff9d08b2317c6f2a912621170ea648fc942.png",
    1799,
    { genre: "Shooter", badge: "RU-UA" }
  ),
  uaGame(
    30000012,
    "Diablo® IV",
    "https://image.api.playstation.com/vulcan/ap/rnd/202405/3123/218ac4e34bf15f7cdfa24f7e452cadf2ebb378c765d242fe.jpg",
    1017.6,
    { genre: "RPG", badge: "RU-UA Discount", oldRubPrice: getRubPriceByUahPrice(1696), discountPercent: 40 }
  ),
  uaGame(
    30001130,
    "Call of Duty®",
    "https://image.api.playstation.com/vulcan/ap/rnd/202604/0119/7f5772e04bb77f255ba54f8dc97eeb027b035ac5a5cb27e3.png",
    1869.45,
    { genre: "Shooter", badge: "RU-UA Discount", oldRubPrice: getRubPriceByUahPrice(3399), discountPercent: 45, isFeatured: true }
  ),
  uaGame(
    30000013,
    "Microsoft Flight Simulator 2024",
    "https://image.api.playstation.com/vulcan/ap/rnd/202509/1718/36050534f6a08332f7a0bd39cd3bf26f2136d43ea2ca64b9.png",
    1920,
    { genre: "Simulation", badge: "RU-UA Discount", oldRubPrice: getRubPriceByUahPrice(2400), discountPercent: 20 }
  ),
  uaGame(
    30000014,
    "I Am Cat",
    "https://image.api.playstation.com/vulcan/ap/rnd/202501/0912/fc915b1278e6b9d76a06a98eb30db8e89ae143baa47d5f3a.jpg",
    489,
    { genre: "Simulation", badge: "RU-UA" }
  ),
  uaGame(
    30000015,
    "Mixtape",
    "https://image.api.playstation.com/vulcan/ap/rnd/202602/2500/2ef26cfaf8377e0d625ca3f61cafeb161c3720f9a134df26.png",
    619,
    { genre: "Adventure", badge: "RU-UA" }
  ),
  uaGame(
    30000016,
    "Outbound",
    "https://image.api.playstation.com/vulcan/ap/rnd/202506/3010/c4ccc0e0722967209737c6879de619800b11fe7b3dc8771b.png",
    519,
    { genre: "Simulation", badge: "RU-UA" }
  ),
];

export const storeGames: MarketplaceGame[] = [...psStoreGames, ...uaStoreGames];

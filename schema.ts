import { z } from "zod";

export type MonsterRaw = {
  allakhazam_id: null;
  atlas_id: null;
  detects_healing: number;
  detects_lowhp: number;
  detects_magic: number;
  detects_sight: number;
  detects_sound: number;
  detects_truesight: number;
  detects_truesound: number;
  drops: string;
  family: string;
  ffxiclopedia_id: null;
  id: number;
  immunities: string | null;
  is_aggressive: number;
  is_fishing: number;
  is_linking: number;
  is_nm: number;
  job: string | null;
  level_max: number | string;
  level_min: number | string;
  name: string;
  resistances: string | null;
  somepage_id: null;
  spawn_count: number;
  spawn_time: string;
  stolen: string | null;
  tracks_scent: number;
  weaknesses: string | null;
  zone: string;
};

const BinaryFlag = z.union([z.literal(0), z.literal(1)]);

const handleNullableString = (value: string | null): string | undefined =>
  value === null || value.length === 0 ? undefined : value;

const handleNullableNumber = (value: number | null): number | undefined =>
  value === null ? undefined : value;

const handleStringToNumber = (value: number | string | null): number | null => {
  if (value === null) {
    return null;
  } else if (typeof value === "number") {
    return value;
  }

  const parsed = parseInt(value);

  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
};

export const Monster = z.object({
  agro: BinaryFlag,
  detects: z.object({
    healing: BinaryFlag,
    hp: BinaryFlag,
    magic: BinaryFlag,
    sight: BinaryFlag,
    sound: BinaryFlag,
    tsight: BinaryFlag,
    tsound: BinaryFlag,
  }),
  drops: z.array(z.string()),
  family: z
    .string()
    .nullable()
    .transform(handleNullableString)
    .transform((family) =>
      family ? getQualifiedFamilyName(family) : undefined
    ),
  immunities: z.array(z.string()),
  fished: BinaryFlag,
  nm: BinaryFlag,
  job: z
    .string()
    .optional()
    .transform((job) => (job ? getQualifiedJobName(job) : undefined)),
  links: BinaryFlag,
  level_max: z.number().optional(),
  level_min: z.number().optional(),
  resistances: z.array(z.string()),
  spawn_count: z
    .number()
    .or(z.string())
    .nullable()
    .transform(handleStringToNumber)
    .transform(handleNullableNumber),
  spawn_time: z
    .string()
    .nullable()
    .transform(handleNullableString)
    .transform((value) => value?.replace("minutes", "mins")),
  steal: z.array(z.string()),
  tracks_scent: BinaryFlag,
  weaknesses: z.array(z.string()),
});
type Monster = z.output<typeof Monster>;

export type Zones = {
  [zoneName: string]: {
    [monsterName: string]: Monster;
  };
};

const getQualifiedJobName = (alias: string): string | undefined => {
  const jobMap = new Map([
    ["brd", "BRD"],
    ["bard", "BRD"],
    ["bst", "BST"],
    ["beastmaster", "BST"],
    ["blm", "BLM"],
    ["black mage", "BLM"],
    ["blu", "BLU"],
    ["blue mage", "BLU"],
    ["cor", "COR"],
    ["corsair", "COR"],
    ["dnc", "DNC"],
    ["dancer", "DNC"],
    ["drk", "DRK"],
    ["dark knight", "DRK"],
    ["drg", "DRG"],
    ["dragoon", "DRG"],
    ["geo", "GEO"],
    ["geomancer", "GEO"],
    ["mnk", "MNK"],
    ["monk", "MNK"],
    ["nin", "NIN"],
    ["ninja", "NIN"],
    ["pld", "PLD"],
    ["paladin", "PLD"],
    ["pup", "PUP"],
    ["puppetmaster", "PUP"],
    ["rng", "RNG"],
    ["ranger", "RNG"],
    ["rdm", "RDM"],
    ["red mage", "RDM"],
    ["run", "RUN"],
    ["rune fencer", "RUN"],
    ["sam", "SAM"],
    ["samurai", "SAM"],
    ["sch", "SCH"],
    ["scholar", "SCH"],
    ["smn", "SMN"],
    ["summoner", "SMN"],
    ["thf", "THF"],
    ["thief", "THF"],
    ["war", "WAR"],
    ["warrior", "WAR"],
    ["whm", "WHM"],
    ["white mage", "WHM"],
  ]);

  const lowerCaseAlias = alias.toLowerCase();

  const invalidJobs = new Set(["toau", "maze rune", ":", "job"]);

  if (invalidJobs.has(lowerCaseAlias)) {
    return undefined;
  }

  let job = jobMap.get(lowerCaseAlias);
  const splitAlias = lowerCaseAlias.split("/");
  if (splitAlias.length > 1) {
    job = splitAlias.reduce((prev, curr) => {
      return `${prev}${jobMap.get(curr)}/`;
    }, "");
    job = job.substring(lowerCaseAlias.length - 1);
  }

  if (!job) {
    throw new Error(`Unable to transform [${alias}] into a qualified job name`);
  }

  return job;
};

const getQualifiedFamilyName = (alias: string): string => {
  const familyMap = new Map([
    [":category:skeletons", "Skeleton"],
    ["acrolith", "Acrolith"],
    ["acroliths", "Acrolith"],
    ["adamantoise", "Adamantoise"],
    ["amoeban", "Amoeban"],
    ["amoebans", "Amoeban"],
    ["amphiptere", "Amphiptere"],
    ["amphipteres", "Amphiptere"],
    ["apkallu", "Apkallu"],
    ["automaton", "Automaton"],
    ["automatons", "Automaton"],
    ["aern", "Aern"],
    ["aerns", "Aern"],
    ["ahriman", "Ahriman"],
    ["ahrimans", "Ahriman"],
    ["animated weapon", "Animated Weapon"],
    ["animated weapons", "Animated Weapon"],
    ["antica", "Antica"],
    ["antican", "Antica"],
    ["anticas", "Antica"],
    ["antlion", "Antlion"],
    ["antlions", "Antlion"],
    ["avatar", "Avatar"],
    ["avatars", "Avatar"],
    ["bat", "Bat"],
    ["bats", "Bat"],
    ["bat trio", "Flock Bat"],
    ["bat trios", "Flock Bat"],
    ["beast", "Sheep"], // Only handles Ark Angels' Karakul
    ["bee", "Bee"],
    ["bees", "Bee"],
    ["beetle", "Beetle"],
    ["beetles", "Beetle"],
    ["behemoth", "Behemoth"],
    ["behemoths", "Behemoth"],
    ["belladonna", "Belladonna"],
    ["biotechnological weapon", "Biotechnological Weapon"],
    ["biotechnological weapons", "Biotechnological Weapon"],
    ["bird", "Lesser Bird"],
    ["birds", "Lesser Bird"],
    ["bomb", "Bomb"],
    ["bombs", "Bomb"],
    ["buffalo", "Buffalo"],
    ["bugard", "Bugard"],
    ["bugards", "Bugard"],
    ["bugbear", "Bugbear"],
    ["bugbears", "Bugbear"],
    ["buggard", "Bugard"],
    ["cait sith", "Avatar"],
    ["cardian", "Cardian"],
    ["cardians", "Cardian"],
    ["category:manticore", "Manticore"],
    ["category:manticores", "Manticore"],
    ["caturae", "Caturae"],
    ["cerberus", "Cerberus"],
    ["chapuli", "Chapuli"],
    ["chariot", "Chariot"],
    ["chariots", "Chariot"],
    ["chigoe", "Chigoe"],
    ["chigoes", "Chigoe"],
    ["clionid", "Clionid"],
    ["clionids", "Clionid"],
    ["clot", "Slime"],
    ["clots", "Slime"],
    ["cluster", "Cluster"],
    ["clusters", "Cluster"],
    ["cockatrice", "Cockatrice"],
    ["cockatrices", "Cockatrice"],
    ["coeurl", "Coeurl"],
    ["coeurls", "Coeurl"],
    ["colibri", "Colibri"],
    ["corpselight", "Corpselights"],
    ["corpselights", "Corpselights"],
    ["corse", "Corse"],
    ["corses", "Corse"],
    ["crab", "Crab"],
    ["crabs", "Crab"],
    ["craver", "Craver"],
    ["cravers", "Craver"],
    ["crawler", "Crawler"],
    ["crawlers", "Crawler"],
    ["dahak", "Dragon"],
    ["dahaks", "Dragon"],
    ["defiant", "Defiant"],
    ["demon", "Demon"],
    ["demons", "Demon"],
    ["dhalmel", "Dhalmel"],
    ["dhalmels", "Dhalmel"],
    ["diremite", "Diremite"],
    ["diremites", "Diremite"],
    ["djinn", "Bomb"],
    ["doll", "Doll"],
    ["dolls", "Doll"],
    ["doomed", "Doomed"],
    ["dragon", "Dragon"],
    ["dragons", "Dragon"],
    ["dvergr", "Dvergr"],
    ["dvergrs", "Dvergr"],
    ["eft", "Eft"],
    ["efts", "Eft"],
    ["elemental", "Elemental"],
    ["elementals", "Elemental"],
    ["euvhi", "Euvhi"],
    ["evil weapon", "Evil Weapon"],
    ["evil weapons", "Evil Weapon"],
    ["flock bat", "Flock Bat"],
    ["flock bats", "Flock Bat"],
    ["flan", "Flan"],
    ["flans", "Flan"],
    ["fly", "Fly"],
    ["flies", "Fly"],
    ["flytrap", "Flytrap"],
    ["flytraps", "Flytrap"],
    ["fomor", "Fomor"],
    ["fomors", "Fomor"],
    ["funguar", "Funguar"],
    ["funguars", "Funguar"],
    ["gallu", "Gallu"],
    ["gargouille", "Gargouille"],
    ["gargouilles", "Gargouille"],
    ["gear", "Gear"],
    ["gears", "Gear"],
    ["ghost", "Ghost"],
    ["ghosts", "Ghost"],
    ["ghrah", "Ghrah"],
    ["giant bat", "Bat"],
    ["giant bats", "Bat"],
    ["gigas", "Gigas"],
    ["gnat", "Gnat"],
    ["gnats", "Gnat"],
    ["gnole", "Gnole"],
    ["gnoles", "Gnole"],
    ["goblin", "Goblin"],
    ["goblins", "Goblin"],
    ["golem", "Golem"],
    ["golems", "Golem"],
    ["goobbue", "Goobbue"],
    ["goobbues", "Goobbue"],
    ["gorger", "Gorger"],
    ["gorgers", "Gorger"],
    ["greater bird", "Greater Bird"],
    ["greater birds", "Greater Bird"],
    ["grimoire", "Grimoire"],
    ["harpeia", "Harpeia"],
    ["hecteye", "Hecteyes"],
    ["hecteyes", "Hecteyes"],
    ["hippogryph", "Hippogryph"],
    ["hippogryphs", "Hippogryph"],
    ["hound", "Hound"],
    ["hounds", "Hound"],
    ["hpemde", "Hpemde"],
    ["humanoid", "Humanoid"],
    ["humanoids", "Humanoid"],
    ["hybrid elemental", "Elemental"],
    ["hydra", "Hydra"],
    ["imp", "Imp"],
    ["imps", "Imp"],
    ["iron giant", "Iron Giant"],
    ["iron giants", "Iron Giant"],
    ["khimaira", "Khimaira"],
    ["khimairas", "Khimaira"],
    ["kindred", "Kindred"],
    ["ladybug", "Ladybug"],
    ["ladybugs", "Ladybug"],
    ["lamia", "Lamiae"],
    ["lamiae", "Lamiae"],
    ["leech", "Leech"],
    ["leeches", "Leech"],
    ["lesser bird", "Lesser Bird"],
    ["lesser birds", "Lesser Bird"],
    ["limule", "Limule"],
    ["limules", "Limule"],
    ["living crystal", "Living Crystal"],
    ["living crystals", "Living Crystal"],
    ["lizard", "Lizard"],
    ["lizards", "Lizard"],
    ["lynx", "Coeurl"],
    ["magic pot", "Magic Pot"],
    ["magic pots", "Magic Pot"],
    ["mammet", "Mammets"],
    ["mammets", "Mammets"],
    ["mamool ja", "Mamool Ja"],
    ["mamool ja knight", "Mamool Ja"],
    ["mandragora", "Mandragora"],
    ["mandragoras", "Mandragora"],
    ["manticore", "Manticore"],
    ["manticores", "Manticore"],
    ["mantid", "Mantid"],
    ["mantids", "Mantid"],
    ["marid", "Marid"],
    ["marids", "Marid"],
    ["merrow", "Lamiae"],
    ["mimic", "Mimic"],
    ["mimics", "Mimic"],
    ["mine", "Mine"],
    ["mines", "Mine"],
    ["moblin", "Moblin"],
    ["moblins", "Moblin"],
    ["monoceros", "Monoceros"],
    ["moogle", "Moogle"],
    ["moogles", "Moogle"],
    ["morbol", "Morbol"],
    ["morbols", "Morbol"],
    ["murex", "Murex"],
    ["mosquito", "Mosquito"],
    ["opo-opo", "Opo-opo"],
    ["opo-opos", "Opo-opo"],
    ["orc", "Orc"],
    ["orcs", "Orc"],
    ["orobon", "Orobon"],
    ["orobons", "Orobon"],
    ["orchish warmachine", "Orcish Warmachine"],
    ["orcish warmachine", "Orcish Warmachine"],
    ["orcish warmachines", "Orcish Warmachine"],
    ["panopt", "Panopt"],
    ["panopts", "Panopt"],
    ["peiste", "Peiste"],
    ["pet wyvern", "Wyvern (Dragoon Pet)"],
    ["pet wyverns", "Wyvern (Dragoon Pet)"],
    ["pixie", "Pixie"],
    ["pixies", "Pixie"],
    ["phuabo", "Phuabo"],
    ["poroggo", "Poroggo"],
    ["poroggos", "Poroggo"],
    ["porxie", "Porxie"],
    ["pteraketos", "Pteraketos"],
    ["pugil", "Pugil"],
    ["pugils", "Pugil"],
    ["puk", "Puk"],
    ["puks", "Puk"],
    ["qiqirn", "Qiqirn"],
    ["quadav", "Quadav"],
    ["quadavs", "Quadav"],
    ["qutrub", "Qutrub"],
    ["qutrubs", "Qutrub"],
    ["rabbit", "Rabbit"],
    ["rabbits", "Rabbit"],
    ["rafflesia", "Rafflesia"],
    ["ram", "Ram"],
    ["rampart", "Rampart"],
    ["ramparts", "Rampart"],
    ["rams", "Ram"],
    ["raptor", "Raptor"],
    ["raptors", "Raptor"],
    ["raven", "Lesser Bird"],
    ["receptacle", "Receptacle"],
    ["receptacles", "Receptacle"],
    ["replica", "Replica"],
    ["replicas", "Replica"],
    ["roc", "Roc"],
    ["rocs", "Roc"],
    ["ruszor", "Ruszor"],
    ["ruszors", "Ruszor"],
    ["sabotender", "Sabotender"],
    ["sabotenders", "Sabotender"],
    ["sahagin", "Sahagin"],
    ["sahagins", "Sahagin"],
    ["sandworm", "Sandworm"],
    ["sandworms", "Sandworm"],
    ["sapling", "Sapling"],
    ["saplings", "Sapling"],
    ["scorpion", "Scorpion"],
    ["scorpions", "Scorpion"],
    ["sea monk", "Sea Monk"],
    ["sea monks", "Sea Monk"],
    ["seether", "Seether"],
    ["seethers", "Seether"],
    ["shadow", "Shadow"],
    ["shadows", "Shadow"],
    ["sheep", "Sheep"],
    ["siege turret", "Siege Turret"],
    ["siege turrets", "Siege Turret"],
    ["simulacra", "Replica"],
    ["simulacrum", "Replica"],
    ["skeleton", "Skeleton"],
    ["skeletons", "Skeleton"],
    ["slime", "Slime"],
    ["slimes", "Slime"],
    ["slug", "Slug"],
    ["slugs", "Slug"],
    ["snapweed", "Snapweed"],
    ["snoll", "Snoll"],
    ["snolls", "Snoll"],
    ["soulflayer", "Soulflayer"],
    ["soulflayers", "Soulflayer"],
    ["spheroid", "Spheroid"],
    ["spheroids", "Spheroid"],
    ["spider", "Spider"],
    ["spiders", "Spider"],
    ["structure", "Structures"],
    ["structures", "Structures"],
    ["swampweed", "Snapweed"],
    ["tauri", "Tauri"],
    ["taurus", "Tauri"],
    ["thinker", "Thinker"],
    ["thinkers", "Thinker"],
    ["tiger", "Tiger"],
    ["tigers", "Tiger"],
    ["tonberry", "Tonberry"],
    ["tonberries", "Tonberry"],
    ["treant", "Treant"],
    ["treants", "Treant"],
    ["troll", "Troll"],
    ["trolls", "Troll"],
    ["tubes", "Tubes"],
    ["tulfaire", "Tulfaire"],
    ["twitherym", "Twitherym"],
    ["umbril", "Umbril"],
    ["uragnite", "Uragnite"],
    ["uragnites", "Uragnite"],
    ["vampyr", "Vampyr"],
    ["velkk", "Velkk"],
    ["vorageans", "Vorageans"],
    ["waktza", "Waktza"],
    ["wamoura", "Wamoura"],
    ["wamouracampa", "Wamouracampa"],
    ["wanderer", "Wanderer"],
    ["wanderers", "Wanderer"],
    ["weapons", "Evil Weapon"],
    ["weeper", "Weeper"],
    ["weepers", "Weeper"],
    ["wivre", "Wivre"],
    ["wivres", "Wivre"],
    ["worm", "Worm"],
    ["worms", "Worm"],
    ["wyrm", "Wyrm"],
    ["wyrms", "Wyrm"],
    ["wyvern", "Wyvern"],
    ["wyverns", "Wyvern"],
    ["wyvern (dragoon pet)", "Wyvern (Dragoon Pet)"],
    ["xzomit", "Xzomit"],
    ["yagudo", "Yagudo"],
    ["yovra", "Yovra"],
    ["yztarg", "Yztarg"],
    ["zdei", "Zdei"],
    ["zilant", "Zilant"],
  ]);

  const lowerCaseAlias = alias.toLowerCase().trim();
  let family = familyMap.get(lowerCaseAlias);

  if (!family) {
    throw new Error(
      `Unable to transform [${alias}] into a qualified family name`
    );
  }

  return family;
};

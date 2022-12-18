import { existsSync, promises } from "fs";

import { format } from "./lib/lua-json";
import { zoneIDs, zoneNames } from "./lib/zones";
import { Monster, MonsterRaw, Zones } from "./schema";

const [, , fileName] = process.argv;

if (!fileName) {
  throw new Error(`cannot find file [${fileName}]`);
}

async function convert(fileName: string) {
  const raw = await promises.readFile(fileName, { encoding: "utf8" });
  const rawMonsters: [MonsterRaw] = JSON.parse(raw);

  const zones: Zones = {};

  console.log(`Converting ${fileName}...`);

  rawMonsters.forEach((mob) => {
    if (zones[mob.zone] === undefined) {
      zones[mob.zone] = {};
    }
    zones[mob.zone][mob.name] = {
      agro: mob.is_aggressive === 0 ? 0 : 1,
      detects: {
        healing: mob.detects_healing === 0 ? 0 : 1,
        hp: mob.detects_lowhp === 0 ? 0 : 1,
        magic: mob.detects_magic === 0 ? 0 : 1,
        sight: mob.detects_sight === 0 ? 0 : 1,
        sound: mob.detects_sound === 0 ? 0 : 1,
        tsight: mob.detects_truesight === 0 ? 0 : 1,
        tsound: mob.detects_truesound === 0 ? 0 : 1,
      },
      drops: !mob.drops
        ? []
        : mob.drops.split(",").reduceRight(
            (prev, curr) => (curr === "*" ? prev : [curr.trim(), ...prev]), // Handles drops called "*"
            [] as string[]
          ),
      family: mob.family,
      immunities: !mob.immunities
        ? []
        : mob.immunities.split(",").map((i) => i.trim()),
      fished: mob.is_fishing === 0 ? 0 : 1,
      nm: mob.is_nm === 0 ? 0 : 1,
      job: mob.job === null || mob.job === "" ? undefined : mob.job,
      level_max: typeof mob.level_max === "number" ? mob.level_max : undefined,
      level_min: typeof mob.level_min === "number" ? mob.level_min : undefined,
      links: mob.is_linking === 0 ? 0 : 1,
      resistances: !mob.resistances
        ? []
        : mob.resistances.split(",").map((i) => i.trim()),
      spawn_count: mob.spawn_count,
      spawn_time: mob.spawn_time,
      steal: !mob.stolen ? [] : mob.stolen.split(",").map((i) => i.trim()),
      tracks_scent: mob.tracks_scent === 0 ? 0 : 1,
      weaknesses: !mob.weaknesses
        ? []
        : mob.weaknesses.split(",").map((i) => i.trim()),
    };

    try {
      zones[mob.zone][mob.name] = Monster.parse(zones[mob.zone][mob.name]);
    } catch (e) {
      console.error(e, zones[mob.zone][mob.name]);
      throw new Error(`Unable to parse ${mob.name}`);
    }
  });

  const files: { [key: number]: string } = {};
  Object.entries(zones).forEach(([zoneName, mobs]) => {
    const normalisedZoneName = zoneName.toLowerCase().trim().replace("  ", " ");
    const zoneID = zoneIDs.get(normalisedZoneName);

    if (!zoneID) {
      throw new Error(`Unknown zone [${zoneName}]`);
    }

    if (zoneID === -1) {
      console.log(`Ignoring invalid zone [${zoneName}]`);
      return;
    }

    files[zoneID] = format(mobs);

    console.log(`Converted ${zoneName}`);
  });

  const dir = `./output/${fileName.split(".json")[0]}`;
  if (existsSync(dir)) {
    console.log(`Cleaning previous output directory [${dir}]`);
    await promises.rm(dir, { recursive: true, force: true });
  }

  console.log(`Creating new output directory [${dir}]`);
  await promises.mkdir(dir, { recursive: true });

  console.log("Saving Lua files...");

  Object.entries(files).forEach(async ([zoneID, mobs]) => {
    const outputFileName = `${dir}/${zoneID}.lua`;
    const zoneName = zoneNames.get(parseInt(zoneID));
    if (!zoneName) {
      throw new Error("Unexpected zone name reference issue");
    }
    const zoneComment = `-- ${zoneName}`;
    const fileContent = `${zoneComment}\n${mobs}`;
    await promises.writeFile(outputFileName, fileContent);
  });

  console.log("Conversion complete!");
}

convert(fileName);


import fs from "fs";
import https from "https";

const SPRITE_PATH = "public/icons/sprites/sprite-flags.svg";

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => resolve(JSON.parse(data)));
    }).on("error", reject);
  });
}

function fetchSvg(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        resolve(null);
        return;
      }
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

async function main() {
  const codes = await fetchJson("https://flagcdn.com/en/codes.json");
  let spriteContent = fs.readFileSync(SPRITE_PATH, "utf8");
  
  const countryCodes = Object.keys(codes).filter(c => !c.includes("us-") && c.length === 2);
  let addedCount = 0;

  for (const code of countryCodes) {
    if (!spriteContent.includes(`id="flag-${code}"`)) {
      console.log(`Downloading flag for ${code}...`);
      const svgContent = await fetchSvg(`https://flagcdn.com/${code}.svg`);
      if (svgContent) {
        // extract viewBox and inner content
        const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
        const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 640 480";
        const innerContentMatch = svgContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
        
        if (innerContentMatch) {
          const symbol = `<symbol id="flag-${code}" viewBox="${viewBox}">${innerContentMatch[1]}</symbol>`;
          spriteContent = spriteContent.replace("</svg>", `${symbol}</svg>`);
          addedCount++;
        }
      }
    }
  }

  if (addedCount > 0) {
    fs.writeFileSync(SPRITE_PATH, spriteContent, "utf8");
    console.log(`Added ${addedCount} flags to sprite!`);
  } else {
    console.log("No new flags needed.");
  }

  // Generate a TS file with all countries
  const tsContent = `export const COUNTRIES = [\n${countryCodes.map(c => `  { code: "${c}", name: "${codes[c].replace(/"/g, "")}" }`).join(",\n")}\n];\n`;
  fs.writeFileSync("src/utils/countries.ts", tsContent, "utf8");
  console.log("Generated src/utils/countries.ts");
}

main().catch(console.error);


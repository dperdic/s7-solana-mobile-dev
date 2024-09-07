import * as fs from "fs";
import { globSync } from "glob";

const metaplexFiles = globSync(
  "node_modules/@metaplex-foundation/**/*.{ts,js,cjs}"
);

console.log("fixing metaplex files...");

metaplexFiles.forEach((file) => {
  const data = fs.readFileSync(file, "utf8");

  let result = data.replace(
    /@metaplex-foundation\/umi\/serializers/g,
    "@metaplex-foundation/umi-serializers"
  );

  if (file.includes("utf8.cjs")) {
    result = result.replace(
      /\'use strict\'\;/g,
      "'use strict';\nimport 'text-encoding';"
    );
  }

  fs.writeFileSync(file, result, "utf8");
});

console.log("metaplex files fixed");

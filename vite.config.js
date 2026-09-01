import { defineConfig } from "vite";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imgDir = path.resolve(__dirname, "img");
const scenario = process.env.VITE_SCENARIO === "nautica" ? "nautica" : "lanterna";
const outDir = process.env.VITE_OUT_DIR || "dist";

/** Serve /img from project root in dev (folder stays outside public/). */
function imgStaticPlugin() {
  return {
    name: "img-static",
    configureServer(server) {
      server.middlewares.use("/img", (req, res, next) => {
        const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
        const file = path.normalize(path.join(imgDir, urlPath));

        if (!file.startsWith(imgDir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
          return next();
        }

        res.setHeader("Content-Type", "image/png");
        fs.createReadStream(file).pipe(res);
      });
    },
  };
}

export default defineConfig({
  base: "./",

  plugins: [imgStaticPlugin()],

  define: {
    "import.meta.env.VITE_SCENARIO": JSON.stringify(scenario),
  },

  resolve: {
    alias: {
      "@img": imgDir,
    },
  },

  build: {
    outDir,
    emptyOutDir: true,
  },
});

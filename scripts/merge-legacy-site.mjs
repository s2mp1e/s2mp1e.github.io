import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const legacy = path.join(root, "legacy-site")
const output = path.join(root, "public")

for (const name of ["2022", "archives", "css", "img", "js"]) {
  const source = path.join(legacy, name)
  if (fs.existsSync(source)) {
    fs.cpSync(source, path.join(output, name), { recursive: true, force: true })
  }
}

for (const name of ["atom.xml", "search.xml"]) {
  const source = path.join(legacy, name)
  if (fs.existsSync(source)) fs.copyFileSync(source, path.join(output, name))
}

const oldHome = path.join(legacy, "index.html")
const legacyHome = path.join(output, "legacy-site", "index.html")
fs.mkdirSync(path.dirname(legacyHome), { recursive: true })
fs.copyFileSync(oldHome, legacyHome)

const visit = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name)
    if (entry.isDirectory()) visit(filename)
    else if (entry.name.toLowerCase() === "index.html") {
      const html = fs.readFileSync(filename, "utf8")
      fs.writeFileSync(filename, html.replaceAll("http://example.com/", "https://s2mp1e.github.io/"))
    }
  }
}
visit(path.join(output, "2022"))
fs.writeFileSync(path.join(output, ".nojekyll"), "")
console.log("旧文章的 8 个 URL、归档页面、资源及原版首页已合入网站构建结果。")

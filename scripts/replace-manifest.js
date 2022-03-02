const fs = require('fs')

try {
  let manifest = fs.readFileSync('build/manifest.json', 'utf8')
  const assetMapping = JSON.parse(fs.readFileSync('build/asset-manifest.json', 'utf8')).files;

  const replacements = ['background.js', 'app.js', 'app.css']

  replacements.forEach(replacement => {
    manifest = manifest.replace(replacement, assetMapping[replacement])
  })

  fs.writeFileSync('build/manifest.json', manifest)

} catch (err) {
  console.error(err)
}
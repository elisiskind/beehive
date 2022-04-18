const fs = require('fs')
const { exec } = require("child_process");

const executeCommand = async (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(error.message));
        return;
      }
      if (stderr) {
        reject(new Error(stderr));
        return;
      }
      console.log(`stdout: ${stdout}`);
      resolve();
    });
  });
}

const zipBuild = async () => {
  const assetMapping = JSON.parse(fs.readFileSync('build/asset-manifest.json', 'utf8')).files;
  const hash = assetMapping['app.js'].split('.')[1];
  await executeCommand('rm -f *.zip');
  await executeCommand('zip -r beehive.' + hash + '.zip build' );
}

zipBuild().catch(e => console.error(e));
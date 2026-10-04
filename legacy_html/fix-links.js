const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, 'docs');

fs.readdir(docsDir, (err, files) => {
  if (err) return console.error('Unable to scan directory: ' + err);

  files.forEach((file) => {
    if (path.extname(file) === '.html') {
      const filePath = path.join(docsDir, file);

      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return console.error(err);

        const updatedContent = data.replace(
          /href="\.\.\/docs\/index\.html"/g,
          'href="index.html"'
        );

        fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
          if (err) return console.error(err);
          console.log(`Updated: ${file}`);
        });
      });
    }
  });
});

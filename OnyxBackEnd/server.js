const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const app = express();
const PORT = 3001;
const path = require('path');
const fs = require('fs');

app.use(cors());

app.get('/run-script', (req, res) => {
    exec('npm run create:vc:with:additional:params', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.status(500).send('Failed to run script.');
      }
      console.log(stdout);
      const filePath = path.join(__dirname,"/src/verifiable_credentials/proofOfAddress.json");
      
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error(`File read error: ${err}`);
          return res.status(500).send('Failed to read file.');
        }
        res.json(JSON.parse(data));
      });
    });
  });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

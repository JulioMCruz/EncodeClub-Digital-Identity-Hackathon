const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

router.get('/', (req, res) => {
    exec('npm run create:vc:with:additional:params', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.status(500).send('Failed to run script.');
      }
      console.log(stdout);
      const filePath = path.join(__dirname,"./../verifiable_credentials/proofOfAddress.json");
      
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error(`File read error: ${err}`);
          return res.status(500).send('Failed to read file.');
        }
        res.json(JSON.parse(data));
      });
    });
});

module.exports = router;

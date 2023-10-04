const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

router.post('/', (req, res) => {
  const data = req.body;
  const filePath = path.join(__dirname, "./../data/userData.json");
  
  fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
      if (err) {
          console.error(`File write error: ${err}`);
          return res.status(500).send('Failed to write to file.');
      }
      res.json({ message: "Data saved successfully!" });
  });
});

module.exports = router;

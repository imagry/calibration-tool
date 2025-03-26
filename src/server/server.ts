// @ts-nocheck

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const unzipper = require('unzipper');

const app = express();
app.use(cors());

const PUBLIC_DIR = path.join(__dirname, 'public');

// Endpoint to get list of files
app.get(
  '/files/:directory?',
  (
    req: { params: { directory?: string } },
    res: {
      status: (arg0: number) => {
        (): any;
        new (): any;
        json: { (arg0: { error: string }): any; new (): any };
      };
      json: (arg0: { files: any }) => void;
    }
  ) => {
    const directory = req.params.directory || '';
    const directoryPath = path.join(PUBLIC_DIR, directory);
    fs.readdir(directoryPath, (err: any, files: any) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Unable to scan directory' });
      }
      res.json({ files });
    });
  }
);

// Endpoint to get a file by path
app.get(
  '/file/:directory/:filename',
  (
    req: { params: { directory: string; filename: string } },
    res: {
      status: (arg0: number) => {
        (): any;
        new (): any;
        json: { (arg0: { error: string }): any; new (): any };
      };
      sendFile: (arg0: string) => void;
    }
  ) => {
    const filePath = path.join(
      PUBLIC_DIR,
      req.params.directory,
      req.params.filename
    );
    fs.access(filePath, fs.constants.F_OK, (err: any) => {
      if (err) {
        console.log(err);
        return res.status(404).json({ error: 'File not found' });
      }
      res.sendFile(filePath);
    });
  }
);
const fileNamesList = [];
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = path.join(__dirname, req.file.path);

  if (path.extname(req.file.originalname) !== '.zip') {
    return res.status(400).json({ error: 'Uploaded file is not a zip file' });
  }

  try {
    const directory = await unzipper.Open.file(filePath);
    const filesInZip = directory.files.map((file) => file.path);

    const missingFiles = fileNamesList.filter(
      (fileName) => !filesInZip.includes(fileName)
    );
    if (missingFiles.length > 0) {
      return res
        .status(400)
        .json({ error: 'Missing files in zip', missingFiles });
    }

    await directory.extract({ path: PUBLIC_DIR });
    res.json({ message: 'Files extracted successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Error processing zip file' });
  } finally {
    fs.unlink(filePath, (err) => {
      if (err) console.log('Error deleting uploaded zip file:', err);
    });
  }
});

// Start server
const PORT = 9999;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

//export {};

import multer from 'multer';
import fs from 'fs';

const createDirectories = () => {
  const directories = ['uploads/images', 'uploads/videos'];
  directories.forEach((directory) => {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  });
};
createDirectories();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype.startsWith('images/')) {
      cb(null, 'uploads/images');
    } else if (file.mimetype.startsWith('videos/')) {
      cb(null, 'uploads/videos');
    } else {
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage });

export default upload;
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.post('/api/predict', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const form = new FormData();
    form.append('file', req.file.buffer, req.file.originalname);

    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const response = await axios.post(
      `${mlServiceUrl}/predict`,
      form,
      { headers: form.getHeaders() }
    );
    
    res.json(response.data);
  } catch (err) {
    console.error('Prediction error:', err);
    res.status(500).json({ 
      error: 'Prediction failed',
      details: err.message 
    });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
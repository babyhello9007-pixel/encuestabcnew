import { Router, Response } from 'express';
import multer from 'multer';
import { storagePut } from '../storage';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req: any, file: any, cb: any) => {
    // Solo aceptar imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  },
});

/**
 * POST /api/upload
 * Carga un archivo a S3 y retorna la URL
 */
router.post('/upload', upload.single('file'), async (req: any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { partyKey } = req.body;

    if (!partyKey) {
      return res.status(400).json({ error: 'partyKey is required' });
    }

    // Generar nombre de archivo único
    const timestamp = Date.now();
    const extension = req.file.originalname.split('.').pop() || 'png';
    const filename = `logos/${partyKey}-${timestamp}.${extension}`;

    // Subir a S3
    const { url } = await storagePut(
      filename,
      req.file.buffer,
      req.file.mimetype
    );

    res.json({ url, success: true });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Upload failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

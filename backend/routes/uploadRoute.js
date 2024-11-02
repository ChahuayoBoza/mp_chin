import path from 'path';
import express from 'express';
import multer from 'multer';
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

cloudinary.v2.config({
    cloudinary_url: process.env.CLOUDINARY_URL
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    params: async (req, file) => {
        const folder = req.body.folder || 'products';
        console.log('Folder:', folder); 
        return {
        folder: folder, 
        format: 'jpg', 
        public_id: `${file.fieldname}-${Date.now()}`, 
        transformation: [{ quality: "auto:good" }],
        }
    ;},
});

function fileFilter(req, file, cb) {
    const filetypes = /jpe?g|png|webp/;
    const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = mimetypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Solo imagenes!'), false);
    }
}

const upload = multer({ storage, fileFilter });

const uploadMultipleImages = upload.array('image', 5); 

const uploadSingleImage = upload.single('image');

router.post('/', (req, res) => {
    console.log('REQ.FILES:', req);
    uploadMultipleImages(req, res, function (err) {        
        if (err) {
        return res.status(400).send({ message: err.message });
        }
        
        const imagePaths = req.files.map(file => file.path);

        res.status(200).send({
        message: 'Imagenes subidas correctamente',
        images: imagePaths,
        });
    });
});

export default router;
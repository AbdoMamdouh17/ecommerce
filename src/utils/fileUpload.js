import multer ,{diskStorage} from "multer";

export const fileUpload = () => {
    const fileFilter = (req, file, cb) => {
        if (!["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype)) {
            return cb(new Error("Invalid file format. Only PNG and JPG are allowed."), false);
        }
          cb(null, true);
    };

    return multer({ storage :diskStorage({}), fileFilter });
};

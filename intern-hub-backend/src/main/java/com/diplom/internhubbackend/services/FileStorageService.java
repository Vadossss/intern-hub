package com.diplom.internhubbackend.services;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path userPhotoUploadDir = Paths.get("uploads/users/photos");
    private final Path companyPhotoUploadDir = Paths.get("uploads/employers/logos");
    private final Path blogImageUploadDir = Paths.get("uploads/blog/images");

    public String saveUserPhoto(Integer userId, MultipartFile file) {
        return saveImage(file, userPhotoUploadDir, "user-" + userId, "/uploads/users/photos/");
    }

    public String saveCompanyPhoto(Integer userId, MultipartFile file) {
        return saveImage(file, companyPhotoUploadDir, "company-" + userId, "/uploads/employers/logos/");
    }

    public String saveBlogImage(Integer userId, MultipartFile file) {
        return saveImage(file, blogImageUploadDir, "blog-" + userId, "/uploads/blog/images/");
    }

    private String saveImage(MultipartFile file, Path uploadDir, String prefix, String publicPath) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Файл пустой");
            }

            String contentType = file.getContentType();

            if (contentType == null || !contentType.startsWith("image/")) {
                throw new RuntimeException("Можно загружать только изображения");
            }

            Files.createDirectories(uploadDir);

            String originalFilename = file.getOriginalFilename();
            String extension = "";

            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String filename = prefix + "-" + UUID.randomUUID() + extension;
            Path targetPath = uploadDir.resolve(filename);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            return publicPath + filename;
        } catch (IOException e) {
            throw new RuntimeException("Ошибка при сохранении фото", e);
        }
    }
}

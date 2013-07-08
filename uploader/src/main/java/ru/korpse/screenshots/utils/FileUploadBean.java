package ru.korpse.screenshots.utils;

import lombok.Data;

import org.springframework.web.multipart.MultipartFile;

@Data
public class FileUploadBean {
	private MultipartFile file;
}

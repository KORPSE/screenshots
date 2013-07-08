package ru.korpse.screenshots.core.controllers;

import java.io.File;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.commons.CommonsMultipartFile;

@Controller
@RequestMapping("/upload")
public class FileUploadController {

	private String saveDirectory = "/home/korpse/workspace1/screenshot_prototype/files/";

	@RequestMapping(method = RequestMethod.POST)
	@ResponseBody
	public Map<String, Object> handleFileUpload(HttpServletRequest request,
			@RequestParam CommonsMultipartFile fileUpload) throws Exception {

		Map<String, Object> result = new HashMap<String, Object>();

		MessageDigest md5Digest = MessageDigest.getInstance("MD5");

		md5Digest
				.update(fileUpload.getBytes(), 0, fileUpload.getBytes().length);

		String filename = new BigInteger(1, md5Digest.digest()).toString(16);

		if (fileUpload != null && fileUpload.getSize() > 0) {
			result.put("size", fileUpload.getSize());

			if (!fileUpload.getOriginalFilename().equals("")) {
				fileUpload.transferTo(new File(saveDirectory + filename));
			}
		}

		return result;
	}
}

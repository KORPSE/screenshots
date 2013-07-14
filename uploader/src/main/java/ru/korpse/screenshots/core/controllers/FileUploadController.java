package ru.korpse.screenshots.core.controllers;

import java.io.File;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.security.crypto.codec.Base64;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.commons.CommonsMultipartFile;

@Controller
@RequestMapping("/upload")
public class FileUploadController {

	private String tomcatHome = System.getProperty("catalina.base");

	private String saveDirectory = tomcatHome + "/files/";
	
	public FileUploadController() {
		(new File(saveDirectory)).mkdirs();
	}
	
	@RequestMapping(method = RequestMethod.POST)
	@ResponseBody
	public Map<String, Object> handleFileUpload(HttpServletRequest request,
			@RequestParam CommonsMultipartFile fileUpload) throws Exception {

		Map<String, Object> result = new HashMap<String, Object>();

		MessageDigest md5Digest = MessageDigest.getInstance("MD5");

		md5Digest.update(fileUpload.getBytes(), 0, fileUpload.getBytes().length);

		String filename = new String(Base64.encode(new BigInteger(1, md5Digest.digest()).toByteArray()))
			.replace('/', '_');
		try {
			if (fileUpload != null && fileUpload.getSize() > 0) {
				result.put("size", fileUpload.getSize());
	
				if (!fileUpload.getOriginalFilename().equals("")) {
					fileUpload.transferTo(new File(saveDirectory + filename));
				}
				result.put("filename", filename);
			}
		}
		catch (Exception e) {
			result.put("error", e.getMessage());
		}
		
		return result;
	}
}

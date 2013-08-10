package ru.korpse.screenshots.core.controllers;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

import ru.korpse.screenshots.core.services.SecureKeyService;

import com.google.appengine.api.blobstore.BlobstoreService;
import com.google.appengine.api.blobstore.BlobstoreServiceFactory;
import com.google.appengine.api.blobstore.UploadOptions;

@Controller
@RequestMapping("/")
public class FirstController {
	
	@Autowired
	private SecureKeyService secureKeyService;
	
	private BlobstoreService blobstoreService = BlobstoreServiceFactory.getBlobstoreService();
	private UploadOptions options = UploadOptions.Builder.withMaxUploadSizeBytes(4 * 1024 * 1024);

	@RequestMapping(value = "/", method = RequestMethod.GET)
	public ModelAndView editor(HttpServletRequest req) {
		String uploadUrl = blobstoreService.createUploadUrl("/upload", options);
		String secureKey = secureKeyService.getSecureKey(req.getRemoteAddr(),
				uploadUrl);
		secureKeyService.save(secureKey, req.getRemoteAddr());
		Map<String, Object> model = new HashMap<String, Object>();
		model.put("uploadUrl", uploadUrl);
		model.put("secureKey", secureKey);
		return new ModelAndView("editor", model);
	}

	@RequestMapping(value = "/hello", method = RequestMethod.GET)
	public String Hello() {

		return "hello";
	}

}

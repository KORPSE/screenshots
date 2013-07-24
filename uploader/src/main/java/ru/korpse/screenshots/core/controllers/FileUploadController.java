package ru.korpse.screenshots.core.controllers;

import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import ru.korpse.screenshots.core.dao.ShotDao;
import ru.korpse.screenshots.entities.Shot;

import com.google.appengine.api.blobstore.BlobKey;
import com.google.appengine.api.blobstore.BlobstoreService;
import com.google.appengine.api.blobstore.BlobstoreServiceFactory;

@Controller
@RequestMapping
public class FileUploadController {

	private BlobstoreService blobstoreService = BlobstoreServiceFactory.getBlobstoreService();
	
	@Autowired
	private ShotDao dao;

	@RequestMapping(value = "/upload", method = RequestMethod.POST)
	@ResponseBody
    public Map<String, Object> doPost(HttpServletRequest req, HttpServletResponse res)
        throws ServletException, IOException {

		Map<String, Object> result = new HashMap<String, Object>();

        @SuppressWarnings("deprecation")
		Map<String, BlobKey> blobs = blobstoreService.getUploadedBlobs(req);
        BlobKey blobKey = blobs.get("fileUpload");
        if (blobKey == null) {
			result.put("error", "File not loaded");
			return result;
        }
        Shot shot = new Shot();
        shot.setBlobKey(blobKey.getKeyString());
        shot.setCreated(new Date());

        dao.save(shot);
        
    	result.put("filename", shot.getKey());
        
        return result;
    }
	
	@RequestMapping(value = "/getuploadurl", method = RequestMethod.GET)
	@ResponseBody
	public Map<String, Object> getUploadURL() {
	    BlobstoreService blobstoreService = BlobstoreServiceFactory.getBlobstoreService();
	    Map<String, Object> result = new HashMap<String, Object>();
	    result.put("uploadUrl", blobstoreService.createUploadUrl("/upload"));
	    return result;
	}
}

package ru.korpse.screenshots.core.controllers;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

import javax.servlet.http.HttpServletResponse;

import lombok.extern.log4j.Log4j;

import org.apache.commons.io.IOUtils;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequestMapping(value = "/get")
@Log4j
public class FileController {

	private String tomcatHome = System.getProperty("catalina.base");

	private String saveDirectory = tomcatHome + "/files/";

	@RequestMapping(value = "/{hash}", method = RequestMethod.GET)
	public void get(@PathVariable String hash, HttpServletResponse response) {
		try {
			// get your file as InputStream
			InputStream is = new FileInputStream(new File(saveDirectory + "/"
					+ hash));
			// copy it to response's OutputStream
			IOUtils.copy(is, response.getOutputStream());
			response.flushBuffer();
		} catch (IOException ex) {
			log.info("Bad link: " + hash);
			throw new RuntimeException("Bad link");
		}
	}
}

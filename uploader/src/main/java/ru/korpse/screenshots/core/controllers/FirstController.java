package ru.korpse.screenshots.core.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequestMapping("/")
public class FirstController {
	
	@RequestMapping(value = "/", method = RequestMethod.GET)
	public String Editor() {
		return "editor";
	}

	@RequestMapping(value = "/hello", method = RequestMethod.GET)
	public String Hello() {
		return "hello";
	}

}

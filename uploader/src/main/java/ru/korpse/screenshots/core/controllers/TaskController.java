package ru.korpse.screenshots.core.controllers;

import lombok.extern.log4j.Log4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import ru.korpse.screenshots.core.services.DeleteShotsScheduledSercvice;

@Log4j
@Controller
@RequestMapping("/service")
public class TaskController {
	
	@Autowired
	private DeleteShotsScheduledSercvice service;
	
	@RequestMapping(value = "/clear")
	@ResponseBody
	public void deleteOldShots() {
		service.doDeleteOld();
	}

	@RequestMapping(value = "/test")
	@ResponseBody
	public void test() {
		log.info("test");
	}
}

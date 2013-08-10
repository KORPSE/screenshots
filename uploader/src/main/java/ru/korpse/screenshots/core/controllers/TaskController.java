package ru.korpse.screenshots.core.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import ru.korpse.screenshots.core.services.ClientService;
import ru.korpse.screenshots.core.services.DeleteShotsScheduledSercvice;
import ru.korpse.screenshots.core.services.SecureKeyService;

@Controller
@RequestMapping("/service")
public class TaskController {
	
	@Autowired
	private DeleteShotsScheduledSercvice service;
	
	@Autowired
	private ClientService clientService;
	
	@Autowired
	private SecureKeyService secureKeyService;
	
	@RequestMapping(value = "/clear")
	@ResponseBody
	public void deleteOldShots() {
		service.doDeleteOld();
	}

	@RequestMapping(value = "/flush")
	@ResponseBody
	public void flush() {
		clientService.flush();
	}
	
	@RequestMapping(value = "/flushKeys")
	@ResponseBody
	public void flushKeys() {
		secureKeyService.deleteOld();
	}
}

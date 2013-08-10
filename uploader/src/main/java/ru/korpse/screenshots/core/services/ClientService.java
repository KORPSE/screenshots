package ru.korpse.screenshots.core.services;

import java.util.Date;

import javax.jdo.JDOObjectNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import ru.korpse.screenshots.core.dao.ClientDao;
import ru.korpse.screenshots.entities.Client;
import ru.korpse.screenshots.exceptions.MaxHitCountExceededException;

@Service
public class ClientService {
	
	public static final int MAX_HIT_COUNT = 1000;
	
	@Autowired
	private ClientDao dao;
	
	public void hit(String address) throws MaxHitCountExceededException {
		Client client;
		try {
			client = dao.get(address);
		}
		catch (JDOObjectNotFoundException e) {
			client = new Client();
			client.setAddress(address);
			client.setFirstHitTime(new Date());
			client.setHitCount(0);
		}
		
		if (client.getHitCount() < MAX_HIT_COUNT) {
			client.setHitCount(client.getHitCount() + 1);
			dao.save(client);
		} else {
			throw new MaxHitCountExceededException();
		}
	}
	
	public void flush() {
		dao.deleteAll();
	}
}

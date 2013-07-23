package ru.korpse.screenshots.core.services;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import ru.korpse.screenshots.core.dao.ShotDao;
import ru.korpse.screenshots.entities.Shot;

@Service
public class DeleteShotsScheduledSercvice {
	
	@Autowired
	private ShotDao dao;
	
	@Scheduled(fixedDelay = 3600000)
	public void doDeleteOld() {
		Calendar cal = Calendar.getInstance();
		
        cal.setTime(new Date());
        cal.add(Calendar.DATE, -15);
        Date marginDt = cal.getTime();
        
		List<Shot> shots = dao.getOlderThan(marginDt);
        for (Shot item : shots) {
        	dao.delete(item);
        }
	}
}

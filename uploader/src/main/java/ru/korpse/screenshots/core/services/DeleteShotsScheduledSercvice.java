package ru.korpse.screenshots.core.services;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

import lombok.extern.log4j.Log4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import ru.korpse.screenshots.core.dao.ShotDao;
import ru.korpse.screenshots.entities.Shot;

@Service
@Log4j
public class DeleteShotsScheduledSercvice {
	
	@Autowired
	private ShotDao dao;
	
	public void doDeleteOld() {
		Calendar cal = Calendar.getInstance();
		
        cal.setTime(new Date());
        cal.add(Calendar.DATE, -15);
        Date marginDt = cal.getTime();
        
		List<Shot> shots = dao.getOlderThan(marginDt);
        for (Shot item : shots) {
        	dao.delete(item);
        }
        
        log.info("cleaning old shots");
	}
	
}

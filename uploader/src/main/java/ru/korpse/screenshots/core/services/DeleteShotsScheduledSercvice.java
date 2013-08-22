package ru.korpse.screenshots.core.services;

import java.util.Calendar;
import java.util.Date;

import lombok.extern.log4j.Log4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import ru.korpse.screenshots.core.dao.ShotDao;

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
        
		long count = dao.deleteOlderThan(marginDt);
        
        log.info("cleaning old shots (" + count + " deleted)");
	}
	
}

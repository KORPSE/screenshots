package ru.korpse.screenshots.utils;

import javax.jdo.JDOHelper;
import javax.jdo.PersistenceManagerFactory;

import lombok.extern.log4j.Log4j;

@Log4j
public final class PMF {
	private static final PersistenceManagerFactory pmfInstance = JDOHelper
			.getPersistenceManagerFactory("transactions-optional");

	private PMF() {
	}
	
	static {
		try {
			
		}
		catch (Throwable e) {
			log.error("Failure during static initialization", e);
		}
	}

	public static PersistenceManagerFactory get() {
		return pmfInstance;
	}
}

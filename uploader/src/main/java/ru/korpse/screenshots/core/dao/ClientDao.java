package ru.korpse.screenshots.core.dao;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Repository;

import ru.korpse.screenshots.entities.Client;
import ru.korpse.screenshots.utils.PMF;

@Repository
public class ClientDao {

	public void save(Client item) {
		PersistenceManager pm = PMF.get().getPersistenceManager();
		try {
            pm.makePersistent(item);
        } finally {
            pm.close();
        }
	}

	public Client get(String address) {
		PersistenceManager pm = PMF.get().getPersistenceManager();
		try {
			if (StringUtils.isEmpty(address)) {
				return null;
			}
			Client result = pm.getObjectById(Client.class, address);
			return result;
		}
		finally {
			pm.close();
		}
	}
	
	public void delete(Client item) {
		PersistenceManager pm = PMF.get().getPersistenceManager();
		try {
			Client persistentItem = pm.getObjectById(Client.class, item.getAddress());
			pm.deletePersistent(persistentItem);
		} finally {
			pm.close();
		}
	}
	
	public void deleteAll() {
		PersistenceManager pm = PMF.get().getPersistenceManager();
		try {
			Query q = pm.newQuery(Client.class);
			q.deletePersistentAll();
		}
		finally {
			pm.close();
		}
	}
}

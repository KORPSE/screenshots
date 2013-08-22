package ru.korpse.screenshots.core.	dao;

import java.util.Date;
import java.util.List;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import org.springframework.stereotype.Repository;

import ru.korpse.screenshots.entities.Shot;
import ru.korpse.screenshots.utils.PMF;

import com.google.appengine.api.blobstore.BlobKey;
import com.google.appengine.api.blobstore.BlobstoreService;
import com.google.appengine.api.blobstore.BlobstoreServiceFactory;

@Repository
public class ShotDao {
	
	private BlobstoreService blobstoreService = BlobstoreServiceFactory.getBlobstoreService();
	
	public void save(Shot item) {
		PersistenceManager pm = PMF.get().getPersistenceManager();
		try {
            pm.makePersistent(item);
        } finally {
            pm.close();
        }
	}

	public Shot get(long id) {
		PersistenceManager pm = PMF.get().getPersistenceManager();
		try {
			if (id <= 0) {
				return null;
			}
			Shot result = pm.getObjectById(Shot.class, id);
			return result;
		}
		finally {
			pm.close();
		}
	}

	public long deleteOlderThan(Date created) {
		PersistenceManager pm = PMF.get().getPersistenceManager();
		final Query q = pm.newQuery(Shot.class);
		q.setFilter("created <= dateParam");
		q.declareParameters("java.util.Date dateParam");
		try {
			@SuppressWarnings("unchecked")
			List<Shot> items = (List<Shot>) q.execute(created);
			for (Shot item : items) {
				blobstoreService.delete(new BlobKey(item.getBlobKey()));
				pm.deletePersistent(item);
			}
			return items.size();
		} finally {
			q.closeAll();
			pm.close();
		}
	}
	
	public void delete(long id) {
		PersistenceManager pm = PMF.get().getPersistenceManager();
		try {
			Shot persistentItem = pm.getObjectById(Shot.class, id);
			pm.deletePersistent(persistentItem);
		} finally {
			pm.close();
		}
	}
}

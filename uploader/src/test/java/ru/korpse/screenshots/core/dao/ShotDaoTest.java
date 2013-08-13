package ru.korpse.screenshots.core.dao;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import ru.korpse.screenshots.entities.Shot;
import ru.korpse.screenshots.util.IntegrationTest;
import ru.korpse.screenshots.utils.Base62;

import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;

public class ShotDaoTest extends IntegrationTest {
	
	@Autowired
	private ShotDao dao;
	

    private final LocalServiceTestHelper helper =
        new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig());

    @Before
    public void setUp() {
        helper.setUp();
    }

    @After
    public void tearDown() {
        helper.tearDown();
    }

	@Test
	public void saveGetDeleteTest() throws EntityNotFoundException {
		Shot shot = new Shot();
		shot.setBlobKey("blobKey");
		shot.setCreated(new Date());
		dao.save(shot);
		
		assertNotNull(shot.getId());
		Shot shot2 = dao.get(shot.getId());
		assertEquals(shot, shot2);

		dao.delete(shot.getId());
	}
	
	@Test
	public void getOutdatedTest() throws ParseException {
		SimpleDateFormat sdf =  new SimpleDateFormat("yyyyMMdd");
		Date
			date0 = sdf.parse("20000101"),
			date1 = sdf.parse("20100202"),
			date2 = new Date(),
			marginDt = sdf.parse("20110303");
		Shot shot0 = new Shot();
		shot0.setBlobKey("key");
		shot0.setCreated(date0);
		dao.save(shot0);
		
		Shot shot1 = new Shot();
		shot1.setBlobKey("key");
		shot1.setCreated(date1);
		dao.save(shot1);
		
		Shot shot2 = new Shot();
		shot2.setBlobKey("key");
		shot2.setCreated(date2);
		dao.save(shot2);
		
		long cnt = dao.deleteOlderThan(marginDt);
		assertEquals(cnt, 2);
	}
	
	@Test
	public void testKeyGeneration() {
		Key k1 = KeyFactory.createKey("Shot", 1);
		Key k2 = KeyFactory.createKey("Shot", 1);
		assertEquals(k1, k2);
	}
	
	@Test
	public void base62Test() {
		assertEquals(5105650963054592L,Shot.keyToId(Base62.encode(5105650963054592L)));
	}

}

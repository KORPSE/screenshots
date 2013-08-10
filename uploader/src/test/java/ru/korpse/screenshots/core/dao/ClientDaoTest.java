package ru.korpse.screenshots.core.dao;

import java.util.Date;

import javax.jdo.JDOObjectNotFoundException;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import ru.korpse.screenshots.entities.Client;
import ru.korpse.screenshots.util.IntegrationTest;

import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;

public class ClientDaoTest extends IntegrationTest {
	@Autowired
	private ClientDao dao;
	
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
    public void saveGetDeleteTest() {
    	Client client0 = new Client();
    	client0.setAddress("127.0.0.1");
    	client0.setFirstHitTime(new Date());
    	client0.setHitCount(1);
    	dao.save(client0);

    	Client client01 = dao.get(client0.getAddress());
    	assertEquals(client0, client01);
    	
    	dao.delete(client0);
    }
    
    @Test
    public void deleteAllTest() {
    	Client client0 = new Client();
    	client0.setAddress("127.0.0.1");
    	client0.setFirstHitTime(new Date());
    	client0.setHitCount(1);
    	dao.save(client0);
    	Client client1 = new Client();
    	client1.setAddress("127.0.0.2");
    	client1.setFirstHitTime(new Date());
    	client1.setHitCount(2);
    	dao.save(client1);
    	Client client2 = new Client();
    	client2.setAddress("127.0.0.3");
    	client2.setFirstHitTime(new Date());
    	client2.setHitCount(3);
    	dao.save(client2);
    	
    	dao.deleteAll();
    	
    	try {
    		dao.get(client0.getAddress());
    		fail();
    	}
    	catch (Exception e) {
    		assertTrue(e instanceof JDOObjectNotFoundException);
    	}

    	try {
    		dao.get(client1.getAddress());
    		fail();
    	}
    	catch (Exception e) {
    		assertTrue(e instanceof JDOObjectNotFoundException);
    	}
    	
    	try {
    		dao.get(client2.getAddress());
    		fail();
    	}
    	catch (Exception e) {
    		assertTrue(e instanceof JDOObjectNotFoundException);
    	}
    }
}

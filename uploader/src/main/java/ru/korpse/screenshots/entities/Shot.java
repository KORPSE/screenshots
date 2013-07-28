package ru.korpse.screenshots.entities;

import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.Id;

import com.google.appengine.api.datastore.KeyFactory;

import lombok.Data;

@Entity
@Data
public class Shot {
	
	public static String TABLE_NAME = "Shot";
	
	@Id
	private String key;
	private String blobKey;
	private Date created;
	
	public String getId() {
		return Long.toString(KeyFactory.stringToKey(key).getId(), Character.MAX_RADIX);
	}
}

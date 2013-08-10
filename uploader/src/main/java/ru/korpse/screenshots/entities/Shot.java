package ru.korpse.screenshots.entities;

import java.util.Date;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import lombok.Data;

@Data
@PersistenceCapable(detachable = "true")
public class Shot {
	
	@PrimaryKey
	@Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
	private Long id;
	
	@Persistent
	private String blobKey;
	
	@Persistent
	private Date created;
	
	public String getKey() {
		return Long.toString(id, Character.MAX_RADIX);
	}
}

package ru.korpse.screenshots.entities;

import java.util.Date;

import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import lombok.Data;

@Data
@PersistenceCapable(detachable = "true")
public class Client {
	
	@PrimaryKey
	public String address;
	
	@Persistent
	public Date firstHitTime;

	@Persistent
	public long hitCount;
}

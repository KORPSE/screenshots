package ru.korpse.screenshots.entities;

import java.util.Date;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import lombok.Data;
import ru.korpse.screenshots.utils.Base62;

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
		return Base62.encode(id);
	}
	
	public static long keyToId(String key) {
		return Base62.decode(key).longValue();
	}
}

package ru.korpse.screenshots.entities;

import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.Id;

import lombok.Data;

@Entity
@Data
public class Shot {
	@Id
	private String key;
	private String blobKey;
	private Date created;
}

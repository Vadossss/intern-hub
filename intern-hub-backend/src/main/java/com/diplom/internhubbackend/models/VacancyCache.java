package com.diplom.internhubbackend.models;

import com.diplom.internhubbackend.models.enums.VacancySource;
//import com.redis.om.spring.annotations.Searchable;
import jakarta.persistence.Id;
import lombok.*;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.index.Indexed;

import java.io.Serializable;

@Data
@RedisHash(value = "vacancys", timeToLive = 86400)
@AllArgsConstructor
@NoArgsConstructor
public class VacancyCache implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    private VacancySource source;

    private String position;

    private String name;

    private String schedule;

    private String employmentForm;

    private String city;

    private String salary;


    @Getter
    @Setter
    @AllArgsConstructor
    public static class Employer {
        String id;
        String name;
        String url;
        String logoUrl;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class WorkFormat {
        private String id;
        private String name;
    }
}

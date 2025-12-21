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
@RedisHash(value = "internship", timeToLive = 86400) // TTL 24 часа
@AllArgsConstructor
@NoArgsConstructor
public class VacancyCache implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    @Indexed
    private VacancySource source;

    @Indexed
    private String position;

    @Indexed
    private String name;

    @Indexed
    private String schedule;

    @Indexed
    private String employmentForm;

    @Indexed
    private String city;

    @Indexed
    private String salary;

    // Метод для извлечения числового значения зарплаты
    public Double getNumericSalary() {
        if (salary == null || salary.isBlank() || "Не указана".equals(salary)) {
            return 0.0;
        }

        try {
            // Парсим зарплату из строки типа "50000 - 80000 руб."
            String numericPart = salary.replaceAll("[^0-9-]", "").trim();
            String[] parts = numericPart.split("-");

            if (parts.length == 1) {
                return Double.parseDouble(parts[0].trim());
            } else if (parts.length == 2) {
                // Возвращаем среднее значение
                double from = Double.parseDouble(parts[0].trim());
                double to = Double.parseDouble(parts[1].trim());
                return (from + to) / 2;
            }
        } catch (NumberFormatException e) {
            // Игнорируем ошибки парсинга
        }
        return 0.0;
    }


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

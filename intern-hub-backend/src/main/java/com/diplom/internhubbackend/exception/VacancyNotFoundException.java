package com.diplom.internhubbackend.exception;

public class VacancyNotFoundException extends RuntimeException {
    public VacancyNotFoundException(String message) {
        super(message);
    }
}

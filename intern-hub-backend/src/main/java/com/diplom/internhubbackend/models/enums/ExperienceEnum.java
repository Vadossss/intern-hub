package com.diplom.internhubbackend.models.enums;

public enum ExperienceEnum {
    noExperience("Нет опыта"),
    between1And3("От 1 до 3 лет"),
    between3And6("От 3 до 6 лет"),
    moreThan6("Более 6 лет");

    ExperienceEnum(String name) {
        this.name = name;
    }

    private final String name;
}

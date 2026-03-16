package com.diplom.internhubbackend.enums;

public enum EmploymentEnum {
    full("Полная занятость"),
    part("Частичная занятость"),
    project("Проектная работа"),
    probation("Стажировка");

    EmploymentEnum(String name) {
        this.name = name;
    }

    private final String name;
}

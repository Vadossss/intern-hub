package com.diplom.internhubbackend.models;

import lombok.Getter;

@Getter
public enum PositionsEnum {
    JAVASCRIPT("( frontend OR front-end OR front end OR react* OR vue* OR angular OR next.js OR nest.js ) AND ( developer OR разработчик OR engineer ) NOT Middle NOT senior"),
    JAVA(""),
    PYTHON("");

    private PositionsEnum(String fullName) {
        this.fullName = fullName;
    }

    private final String fullName;
}

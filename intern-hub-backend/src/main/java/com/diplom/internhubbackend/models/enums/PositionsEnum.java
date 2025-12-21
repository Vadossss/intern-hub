package com.diplom.internhubbackend.models.enums;

import lombok.Getter;

@Getter
public enum PositionsEnum {
    JAVASCRIPT("JavaScript", "( \"frontend\" OR \"front-end\" OR \"front end\" OR \"react*\" OR \"vue*\" OR \"angular\" OR \"next.js\" OR \"nest.js\" ) AND ( \"developer\" OR \"разработчик\" OR \"engineer\" ) NOT \"Middle\" NOT \"senior\""),
    JAVA("Java", "( java OR \"java backend\" OR spring OR spring* OR hibernate ) AND ( developer OR разработчик OR engineer )"),
    PYTHON("Python", "( python OR django OR flask OR fastapi ) AND ( developer OR разработчик OR engineer )"),
    CSHARP("C#", "( c# OR csharp OR \".NET\" OR .net OR asp.net OR aspnet ) AND ( developer OR разработчик OR engineer )"),
    DATASCIENCE("DataScience", "( data OR \"data science\" OR analytics OR ml OR \"machine learning\" OR ai OR python OR r ) AND ( analyst OR scientist OR инженер OR разработчик )"),
    GO("Golang", "( golang OR go ) AND ( developer OR разработчик OR engineer )"),
    QA("QA", "( qa OR test* OR \"quality assurance\" OR тестировщик OR тестирование ) AND ( engineer OR specialist OR разработчик )"),
    DESIGN("Design", "( design OR дизайнер OR designer OR ui OR ux OR \"user interface\" OR web-design OR \"web design\" OR graphic OR графический OR product OR \"продуктовый\" ) AND ( designer OR дизайнер OR specialist OR специалист OR artist OR визуалист )");

    private PositionsEnum(String fullName, String description) {
        this.fullName = fullName;
        this.description = description;
    }

    private final String fullName;
    private final String description;
}

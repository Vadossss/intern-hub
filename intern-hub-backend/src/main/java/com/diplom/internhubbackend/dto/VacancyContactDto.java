package com.diplom.internhubbackend.dto;

import com.diplom.internhubbackend.enums.ContactMethod;

public record VacancyContactDto(
    ContactMethod chosenContactMethod,
    String contactValue,
    String hint
) {
}

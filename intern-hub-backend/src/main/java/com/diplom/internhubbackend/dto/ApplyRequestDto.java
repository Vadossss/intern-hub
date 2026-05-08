package com.diplom.internhubbackend.dto;

import com.diplom.internhubbackend.enums.ContactMethod;
import jakarta.validation.constraints.NotNull;

public record ApplyRequestDto(
        String coverLetter,
        String resumeUrl,
        Long resumeId,
        @NotNull ContactMethod chosenContactMethod
) {
}

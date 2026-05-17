package com.diplom.internhubbackend.dto;

public record AdminEmployerOptionDto(
        Integer id,
        String email,
        String companyName,
        String city,
        String status,
        String avatarUrl
) {
}

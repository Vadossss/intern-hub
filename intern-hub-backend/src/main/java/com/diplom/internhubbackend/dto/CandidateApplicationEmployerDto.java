package com.diplom.internhubbackend.dto;

public record CandidateApplicationEmployerDto(
        Integer id,
        String companyName,
        String city,
        String avatarUrl
) {
}

package com.diplom.internhubbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CityResponseDto {
    private String cityName;
    private Integer count;

    public CityResponseDto(String cityName) {
        this.cityName = cityName;
    }
}

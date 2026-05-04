package com.diplom.internhubbackend.dto.hh;

import java.util.List;

public record HhVacancyListResponse(List<HhItemVacancy> items,
                                    Integer pages,
                                    Integer page) {
}

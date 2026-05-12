package com.diplom.internhubbackend.dto.hh;

import java.util.List;

public record HhProfessionalRoleCategory(
        String id,
        String name,
        List<HhProfessionalRole> roles
) {
}

package com.diplom.internhubbackend.dto

import com.diplom.internhubbackend.enums.UserRole

data class ChangeRoleRequest(
    val role: UserRole
)

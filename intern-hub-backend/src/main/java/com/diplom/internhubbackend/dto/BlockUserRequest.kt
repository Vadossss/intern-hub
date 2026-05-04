package com.diplom.internhubbackend.dto

import java.time.LocalDateTime

data class BlockUserRequest(
    val reason: String?,
    val until: LocalDateTime?,
)

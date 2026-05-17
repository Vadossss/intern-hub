package com.diplom.internhubbackend.dto

data class AdminEmployerCreateRequest(
    val email: String? = null,
    val password: String? = null,
    val companyName: String?,
    val city: String? = null,
    val website: String? = null,
    val about: String? = null,
    val verified: Boolean? = true,
    val accredited: Boolean? = false,
)

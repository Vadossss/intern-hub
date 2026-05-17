package com.diplom.internhubbackend.controllers

import com.diplom.internhubbackend.dto.AdminEmployerOptionDto
import com.diplom.internhubbackend.dto.AdminEmployerCreateRequest
import com.diplom.internhubbackend.dto.BlockUserRequest
import com.diplom.internhubbackend.dto.ChangeRoleRequest
import com.diplom.internhubbackend.dto.PageResponse
import com.diplom.internhubbackend.enums.AccountStatus
import com.diplom.internhubbackend.enums.UserRole
import com.diplom.internhubbackend.enums.VerificationStatus
import com.diplom.internhubbackend.exception.EmailAlreadyExistsException
import com.diplom.internhubbackend.models.EmployerProfile
import com.diplom.internhubbackend.models.User
import com.diplom.internhubbackend.repositories.EmployerProfileRepository
import com.diplom.internhubbackend.repositories.UserRepository
import com.diplom.internhubbackend.services.UserModerService
import com.diplom.internhubbackend.services.UserRoleService
import io.swagger.v3.oas.annotations.Operation
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.Locale

@RestController
@PreAuthorize("hasRole('ADMIN')")
class AdminUserController(
    private val userModerationService: UserModerService,
    private val userRepository: UserRepository,
    private val employerProfileRepository: EmployerProfileRepository,
    private val userRoleService: UserRoleService,
    private val passwordEncoder: PasswordEncoder,
) {

    @Operation(summary = "Изменить роль пользователя")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PatchMapping("/api/moderation/users/{user_id}/role")
    fun changeUserRole(
        @PathVariable(name = "user_id") userId: Int,
        @RequestBody request: ChangeRoleRequest,
    ) {
        userModerationService.changeUserRole(userId, request.role)
    }

    @Operation(summary = "Заблокировать аккаунт пользователя")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PatchMapping("/api/moderation/users/{user_id}/block")
    fun blockUser(
        @PathVariable(name = "user_id") userId: Int,
        @RequestBody request: BlockUserRequest,
    ) {
        userModerationService.blockUser(userId, request.reason, request.until)
    }

    @Operation(summary = "Разблокировать аккаунт пользователя")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PatchMapping("/api/moderation/users/{user_id}/unblock")
    fun unblockUser(@PathVariable("user_id") userId: Int) {
        userModerationService.unblockUser(userId)
    }

    @Operation(summary = "Найти работодателей для админки")
    @GetMapping("/api/admin/employers")
    fun searchEmployers(
        @RequestParam(required = false) query: String?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "40") size: Int,
    ): PageResponse<AdminEmployerOptionDto> {
        val employers = userRepository.searchAdminEmployers(
            normalizeQuery(query),
            PageRequest.of(page.coerceAtLeast(0), size.coerceIn(1, 50)),
        )
        val employerIds = employers.content.map(User::getId)
        val profiles = employerProfileRepository.findAllByUserIdIn(employerIds)
            .associateBy { profile -> profile.user.id }
        val content = employers.content
            .map { user -> toDto(user, profiles[user.id]) }

        return PageResponse.of(
            content,
            employers.number,
            employers.size,
            employers.totalElements,
        )
    }

    @Transactional
    @Operation(summary = "Создать работодателя из админки")
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/api/admin/employers")
    fun createEmployer(
        @RequestBody request: AdminEmployerCreateRequest,
    ): AdminEmployerOptionDto {
        val email = request.email?.trim()?.lowercase(Locale.ROOT)
            ?.takeIf { value -> value.isNotBlank() }
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Employer email is required")
        val password = request.password?.trim()
            ?.takeIf { value -> value.length >= 6 }
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Employer password must contain at least 6 characters")
        val companyName = request.companyName?.trim()
            ?.takeIf { value -> value.isNotBlank() }
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Company name is required")

        if (userRepository.existsByEmail(email)) {
            throw EmailAlreadyExistsException("Email already exists")
        }

        val role = userRoleService.findRoleById(UserRole.ROLE_EMPLOYER.name)
            ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Employer role is not configured")
        val verified = request.verified ?: true
        val user = User.builder()
            .email(email)
            .password(passwordEncoder.encode(password))
            .role(role)
            .status(AccountStatus.ACTIVE)
            .verified(verified)
            .verificationStatus(if (verified) VerificationStatus.CONFIRMED else VerificationStatus.EXPECTATION)
            .verifiedAt(if (verified) LocalDateTime.now() else null)
            .build()
        val savedUser = userRepository.save(user)
        val profile = employerProfileRepository.save(
            EmployerProfile.builder()
                .user(savedUser)
                .companyName(companyName)
                .city(trimToNull(request.city))
                .website(trimToNull(request.website))
                .contactName(trimToNull(request.contactName))
                .phone(trimToNull(request.phone))
                .about(trimToNull(request.about))
                .aggregated(false)
                .verified(verified)
                .accredited(request.accredited ?: false)
                .build(),
        )

        return toDto(savedUser, profile)
    }

    private fun toDto(user: User, profile: EmployerProfile?): AdminEmployerOptionDto {
        return AdminEmployerOptionDto(
            user.id,
            user.email,
            profile?.companyName,
            profile?.city,
            user.status?.name,
            profile?.avatarUrl ?: user.avatarUrl,
        )
    }

    private fun normalizeQuery(query: String?): String? {
        val normalizedQuery = query?.trim()?.lowercase(Locale.ROOT)
            ?.takeIf { value -> value.isNotBlank() }

        return normalizedQuery?.let { value -> "%$value%" }
    }

    private fun trimToNull(value: String?): String? {
        return value?.trim()?.takeIf { item -> item.isNotBlank() }
    }
}

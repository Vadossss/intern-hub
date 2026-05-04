package com.diplom.internhubbackend.controllers

import com.diplom.internhubbackend.dto.BlockUserRequest
import com.diplom.internhubbackend.dto.ChangeRoleRequest
import com.diplom.internhubbackend.services.UserModerService
import io.swagger.v3.oas.annotations.Operation
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/moderation/users")
class UserModerationController(val userModerationService: UserModerService) {

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Изменить роль пользователя")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PatchMapping("/{user_id}/role")
    fun changeUserRole(
        @PathVariable(name = "user_id") userId: Int,
        @RequestBody request: ChangeRoleRequest
    ) {
        userModerationService.changeUserRole(userId, request.role)
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Заблокировать аккаунт пользователя")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PatchMapping("/{user_id}/block")
    fun blockUser(
        @PathVariable(name = "user_id") userId: Int,
        @RequestBody request: BlockUserRequest
    ) {
        userModerationService.blockUser(userId, request.reason, request.until)
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Разблокировать аккаунт пользователя")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PatchMapping("/{user_id}/unblock")
    fun unblockUser(@PathVariable("user_id") userId: Int) {
        userModerationService.unblockUser(userId)
    }
}

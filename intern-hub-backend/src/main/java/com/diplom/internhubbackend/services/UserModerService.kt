package com.diplom.internhubbackend.services

import com.diplom.internhubbackend.enums.AccountStatus
import com.diplom.internhubbackend.enums.UserRole
import com.diplom.internhubbackend.exception.UserNotFoundException
import com.diplom.internhubbackend.models.Role
import com.diplom.internhubbackend.models.User
import com.diplom.internhubbackend.repositories.UserRepository
import org.springframework.cache.annotation.CacheEvict
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.function.Supplier

@Service
class UserModerService(
    val userRepository: UserRepository,
    val roleService: UserRoleService,
) {

    @CacheEvict(value = ["user"], key = "#userId")
    @Transactional
    fun changeUserRole(userId: Int, newRole: UserRole) {
        val user: User = userRepository.findById(userId).orElseThrow { UserNotFoundException("User Not Found") }
        val role: Role = roleService.findRoleById(newRole.name)

        user.role = role
    }

    @CacheEvict(value = ["user"], key = "#userId")
    @Transactional
    fun blockUser(userId: Int, reason: String?, until: LocalDateTime?) {
        val user: User = userRepository.findById(userId).orElseThrow { UserNotFoundException("User Not Found") }
        user.status = AccountStatus.BLOCKED
        user.blockedAt = LocalDateTime.now()
        user.blockReason = reason?.takeIf { it.isNotBlank() }
        user.blockedUntil = until?.takeIf { it.isAfter(LocalDateTime.now()) }
    }

    @CacheEvict(value = ["user"], key = "#userId")
    @Transactional
    fun unblockUser(userId: Int) {
        val user = userRepository.findById(userId)
            .orElseThrow(Supplier { UserNotFoundException("User not found") })
        user.status = AccountStatus.ACTIVE
        user.blockedAt = null
        user.blockReason = null
        user.blockedUntil = null
    }
}
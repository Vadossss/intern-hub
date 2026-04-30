package com.diplom.internhubbackend.security.config;

import com.diplom.internhubbackend.enums.AccountStatus;
import com.diplom.internhubbackend.models.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Getter
public class CustomUserDetails implements UserDetails {

    private User user;

    public CustomUserDetails(User user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(user.getRole().getId()));
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonLocked() {
        if (user.getStatus() != AccountStatus.BLOCKED) {
            return true;
        }

        return user.getBlockedUntil() != null && user.getBlockedUntil().isBefore(LocalDateTime.now());
    }

    @Override
    public boolean isEnabled() {
        return user.getStatus() != AccountStatus.DELETED;
    }
}

package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.dto.ComplaintRequestDto;
import com.diplom.internhubbackend.dto.ComplaintResponseDto;
import com.diplom.internhubbackend.dto.ComplaintGroupResponseDto;
import com.diplom.internhubbackend.security.config.CustomUserDetails;
import com.diplom.internhubbackend.services.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/complaints")
public class ComplaintController {
    private final ComplaintService complaintService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("isAuthenticated()")
    public ComplaintResponseDto createComplaint(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @RequestBody ComplaintRequestDto request
    ) {
        return complaintService.createComplaint(customUserDetails.getUser(), request);
    }

    @GetMapping("/admin/groups")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public List<ComplaintGroupResponseDto> getGroupedComplaints() {
        return complaintService.getGroupedComplaints();
    }
}

package com.diplom.internhubbackend.dto;

import com.diplom.internhubbackend.enums.ComplaintReason;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ComplaintReasonCountDto {
    private ComplaintReason reason;
    private Long count;
}

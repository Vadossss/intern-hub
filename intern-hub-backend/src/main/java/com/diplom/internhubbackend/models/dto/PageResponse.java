package com.diplom.internhubbackend.models.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PageResponse<T> {
    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;

    public static <T> PageResponse<T> of(List<T> content, int pageNumber, int pageSize, long totalElements) {
        PageResponse<T> response = new PageResponse<>();
        response.setContent(content);
        response.setPageNumber(pageNumber);
        response.setPageSize(pageSize);
        response.setTotalElements(totalElements);
        response.setTotalPages((int) Math.ceil((double) totalElements / pageSize));
        response.setFirst(pageNumber == 0);
        response.setLast(response.getTotalPages() == 0 || pageNumber >= response.getTotalPages() - 1);
        return response;
    }

    public static <T> PageResponse<T> of(List<T> content, int pageNumber, int pageSize) {
        return of(content, pageNumber, pageSize, content.size());
    }
}

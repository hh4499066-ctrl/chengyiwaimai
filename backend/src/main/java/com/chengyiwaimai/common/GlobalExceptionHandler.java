package com.chengyiwaimai.common;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(Exception.class)
    public ApiResponse<Void> handle(Exception ex) {
        return ApiResponse.fail(ex.getMessage());
    }
}

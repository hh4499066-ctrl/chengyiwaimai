package com.chengyiwaimai.security;

public record CurrentUser(Long userId, String phone, String role) {
    public boolean hasRole(String expectedRole) {
        return expectedRole.equals(role);
    }
}

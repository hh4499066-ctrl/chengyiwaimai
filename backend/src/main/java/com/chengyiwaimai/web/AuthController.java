package com.chengyiwaimai.web;

import com.chengyiwaimai.common.ApiResponse;
import com.chengyiwaimai.model.Models.LoginRequest;
import com.chengyiwaimai.model.Models.LoginResult;
import com.chengyiwaimai.security.JwtUtil;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final JwtUtil jwtUtil;

    public AuthController(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ApiResponse<LoginResult> login(@RequestBody LoginRequest request) {
        String role = request.role() == null || request.role().isBlank() ? "customer" : request.role();
        String phone = request.phone() == null || request.phone().isBlank() ? "13800000000" : request.phone();
        return ApiResponse.ok(new LoginResult(jwtUtil.createToken(phone, role), role, "橙意用户"));
    }
}

package com.chengyiwaimai.web;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.chengyiwaimai.common.ApiResponse;
import com.chengyiwaimai.common.BizException;
import com.chengyiwaimai.entity.SysUserEntity;
import com.chengyiwaimai.mapper.SysUserMapper;
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
    private static final String DEMO_CODE = "123456";

    private final JwtUtil jwtUtil;
    private final SysUserMapper sysUserMapper;

    public AuthController(JwtUtil jwtUtil, SysUserMapper sysUserMapper) {
        this.jwtUtil = jwtUtil;
        this.sysUserMapper = sysUserMapper;
    }

    @PostMapping("/login")
    public ApiResponse<LoginResult> login(@RequestBody LoginRequest request) {
        if (request.phone() == null || request.phone().isBlank()) {
            throw new BizException("手机号不能为空");
        }
        if (!DEMO_CODE.equals(request.code())) {
            throw new BizException("验证码错误");
        }
        SysUserEntity user = sysUserMapper.selectOne(Wrappers.<SysUserEntity>lambdaQuery()
                .eq(SysUserEntity::getPhone, request.phone())
                .eq(SysUserEntity::getStatus, 1)
                .last("limit 1"));
        if (user == null) {
            throw new BizException("手机号不存在或账号已停用");
        }
        String token = jwtUtil.createToken(user.getId(), user.getPhone(), user.getRole());
        return ApiResponse.ok(new LoginResult(token, user.getRole(), user.getNickname()));
    }
}

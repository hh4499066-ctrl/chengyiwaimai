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
        SysUserEntity user = sysUserMapper.selectOne(Wrappers.<SysUserEntity>lambdaQuery()
                .eq(SysUserEntity::getPhone, request.phone())
                .eq(SysUserEntity::getStatus, 1)
                .last("limit 1"));
        if (user == null) {
            throw new BizException("用户不存在或已停用");
        }
        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            String password = request.password() == null ? "" : request.password();
            if (!user.getPassword().equals(password)) {
                throw new BizException("密码错误");
            }
        }
        return ApiResponse.ok(new LoginResult(jwtUtil.createToken(user.getPhone(), user.getRole()), user.getRole(), user.getNickname()));
    }
}

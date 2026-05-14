package com.chengyiwaimai.web;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.chengyiwaimai.common.ApiResponse;
import com.chengyiwaimai.common.BizException;
import com.chengyiwaimai.entity.SysUserEntity;
import com.chengyiwaimai.mapper.SysUserMapper;
import com.chengyiwaimai.model.Models.LoginRequest;
import com.chengyiwaimai.model.Models.LoginResult;
import com.chengyiwaimai.security.JwtUtil;
import com.chengyiwaimai.security.PasswordUtil;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private static final int MAX_LOGIN_FAILURES = 5;
    private static final Duration LOGIN_FAILURE_TTL = Duration.ofMinutes(10);

    private final JwtUtil jwtUtil;
    private final SysUserMapper sysUserMapper;
    private final StringRedisTemplate stringRedisTemplate;

    public AuthController(JwtUtil jwtUtil, SysUserMapper sysUserMapper, StringRedisTemplate stringRedisTemplate) {
        this.jwtUtil = jwtUtil;
        this.sysUserMapper = sysUserMapper;
        this.stringRedisTemplate = stringRedisTemplate;
    }

    @PostMapping("/login")
    public ApiResponse<LoginResult> login(@RequestBody LoginRequest request) {
        if (request.phone() == null || request.phone().isBlank()) {
            throw new BizException(400, "手机号不能为空");
        }
        String phone = request.phone().trim();
        rejectIfRateLimited(phone);
        SysUserEntity user = sysUserMapper.selectOne(Wrappers.<SysUserEntity>lambdaQuery()
                .eq(SysUserEntity::getPhone, phone)
                .last("limit 1"));
        if (user == null || Boolean.TRUE.equals(user.getDeleted() != null && user.getDeleted() == 1)
                || user.getStatus() == null || user.getStatus() != 1) {
            recordLoginFailure(phone);
            throw new BizException(401, "手机号不存在或账号已停用");
        }
        if (request.role() != null && !request.role().isBlank() && !request.role().equals(user.getRole())) {
            recordLoginFailure(phone);
            throw new BizException(403, "账号角色不匹配");
        }
        if (!validCredential(phone, request, user)) {
            recordLoginFailure(phone);
            throw new BizException(401, "账号或凭证错误");
        }
        clearLoginFailures(phone);
        String token = jwtUtil.createToken(user.getId(), user.getPhone(), user.getRole());
        return ApiResponse.ok(new LoginResult(token, user.getRole(), user.getNickname()));
    }

    private boolean validCredential(String phone, LoginRequest request, SysUserEntity user) {
        if (request.password() != null && !request.password().isBlank()) {
            return PasswordUtil.matches(request.password(), user.getPassword());
        }
        if (request.code() == null || request.code().isBlank()) {
            return false;
        }
        String key = "login:code:" + phone;
        try {
            String expected = stringRedisTemplate.opsForValue().get(key);
            boolean matched = expected != null && expected.equals(request.code().trim());
            if (matched) {
                stringRedisTemplate.delete(key);
            }
            return matched;
        } catch (RuntimeException ex) {
            return false;
        }
    }

    private void rejectIfRateLimited(String phone) {
        try {
            String value = stringRedisTemplate.opsForValue().get(loginFailureKey(phone));
            if (value != null && Integer.parseInt(value) >= MAX_LOGIN_FAILURES) {
                throw new BizException(429, "登录失败次数过多，请稍后再试");
            }
        } catch (NumberFormatException ignored) {
            stringRedisTemplate.delete(loginFailureKey(phone));
        } catch (BizException ex) {
            throw ex;
        } catch (RuntimeException ignored) {
        }
    }

    private void recordLoginFailure(String phone) {
        try {
            Long failures = stringRedisTemplate.opsForValue().increment(loginFailureKey(phone));
            if (failures != null && failures == 1L) {
                stringRedisTemplate.expire(loginFailureKey(phone), LOGIN_FAILURE_TTL);
            }
        } catch (RuntimeException ignored) {
        }
    }

    private void clearLoginFailures(String phone) {
        try {
            stringRedisTemplate.delete(loginFailureKey(phone));
        } catch (RuntimeException ignored) {
        }
    }

    private String loginFailureKey(String phone) {
        return "login:fail:" + phone;
    }
}

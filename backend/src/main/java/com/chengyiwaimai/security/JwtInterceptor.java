package com.chengyiwaimai.security;

import com.chengyiwaimai.common.ApiResponse;
import com.chengyiwaimai.common.BizException;
import com.chengyiwaimai.entity.SysUserEntity;
import com.chengyiwaimai.mapper.SysUserMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class JwtInterceptor implements HandlerInterceptor {
    private final JwtUtil jwtUtil;
    private final SysUserMapper sysUserMapper;
    private final ObjectMapper objectMapper;

    public JwtInterceptor(JwtUtil jwtUtil, SysUserMapper sysUserMapper, ObjectMapper objectMapper) {
        this.jwtUtil = jwtUtil;
        this.sysUserMapper = sysUserMapper;
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String path = normalizedPath(request);
        if (path.equals("/auth/login") || path.startsWith("/merchants") || path.startsWith("/uploads/")) {
            return true;
        }

        try {
            CurrentUser user = requireActiveCurrentUser(request);
            checkPathRole(path, user);
            request.setAttribute(AuthContext.CURRENT_USER_ATTR, user);
            return true;
        } catch (BizException ex) {
            response.setStatus(httpStatus(ex.getCode()));
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(objectMapper.writeValueAsString(ApiResponse.fail(ex.getCode(), ex.getMessage())));
            return false;
        }
    }

    private CurrentUser requireActiveCurrentUser(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new BizException(401, "未登录或登录已过期");
        }
        CurrentUser tokenUser = jwtUtil.parseToken(authorization.substring("Bearer ".length()).trim());
        SysUserEntity user = sysUserMapper.selectById(tokenUser.userId());
        if (user == null || user.getStatus() == null || user.getStatus() != 1
                || !tokenUser.phone().equals(user.getPhone()) || !tokenUser.role().equals(user.getRole())) {
            throw new BizException(401, "未登录或登录已过期");
        }
        return new CurrentUser(user.getId(), user.getPhone(), user.getRole());
    }

    private String normalizedPath(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String contextPath = request.getContextPath();
        return contextPath != null && !contextPath.isBlank() && uri.startsWith(contextPath)
                ? uri.substring(contextPath.length())
                : uri;
    }

    private void checkPathRole(String path, CurrentUser user) {
        if (path.startsWith("/admin") && !user.hasRole("admin")) {
            throw new BizException(403, "无权访问该资源");
        }
        if (path.startsWith("/merchant-center") && !user.hasRole("merchant")) {
            throw new BizException(403, "无权访问该资源");
        }
        if (path.startsWith("/rider") && !user.hasRole("rider")) {
            throw new BizException(403, "无权访问该资源");
        }
        if (path.startsWith("/customer") && !user.hasRole("customer")) {
            throw new BizException(403, "无权访问该资源");
        }
    }

    private int httpStatus(int code) {
        return code >= 400 && code <= 599 ? code : HttpServletResponse.SC_BAD_REQUEST;
    }
}

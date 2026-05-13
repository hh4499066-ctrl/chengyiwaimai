package com.chengyiwaimai.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.chengyiwaimai.common.ApiResponse;
import com.chengyiwaimai.common.BizException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class JwtInterceptor implements HandlerInterceptor {
    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper;

    public JwtInterceptor(JwtUtil jwtUtil, ObjectMapper objectMapper) {
        this.jwtUtil = jwtUtil;
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String uri = request.getRequestURI();
        String contextPath = request.getContextPath();
        String path = contextPath != null && !contextPath.isBlank() && uri.startsWith(contextPath)
                ? uri.substring(contextPath.length())
                : uri;

        if (path.equals("/auth/login") || path.startsWith("/merchants")) {
            return true;
        }

        try {
            CurrentUser user = parseCurrentUser(request);
            checkPathRole(path, user);
            request.setAttribute(AuthContext.CURRENT_USER_ATTR, user);
            return true;
        } catch (BizException ex) {
            response.setStatus(ex.getCode() == 403 ? HttpServletResponse.SC_FORBIDDEN : HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(objectMapper.writeValueAsString(ApiResponse.fail(ex.getCode(), ex.getMessage())));
            return false;
        }
    }

    private CurrentUser parseCurrentUser(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");
        if (authorization != null && authorization.startsWith("Bearer ")) {
            return jwtUtil.parseToken(authorization.substring("Bearer ".length()).trim());
        }
        throw new BizException(401, "未登录或登录已过期");
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
}

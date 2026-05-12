package com.chengyiwaimai.security;

import com.chengyiwaimai.common.BizException;
import jakarta.servlet.http.HttpServletRequest;

public final class AuthContext {
    public static final String CURRENT_USER_ATTR = "currentUser";

    private AuthContext() {
    }

    public static CurrentUser currentUser(HttpServletRequest request) {
        Object currentUser = request.getAttribute(CURRENT_USER_ATTR);
        if (currentUser instanceof CurrentUser user) {
            return user;
        }
        throw new BizException(401, "未登录或登录已过期");
    }

    public static CurrentUser requireRole(HttpServletRequest request, String role) {
        CurrentUser user = currentUser(request);
        if (!user.hasRole(role)) {
            throw new BizException(403, "无权访问该资源");
        }
        return user;
    }
}

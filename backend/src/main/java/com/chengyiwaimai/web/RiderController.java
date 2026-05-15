package com.chengyiwaimai.web;

import com.chengyiwaimai.common.ApiResponse;
import com.chengyiwaimai.model.Models.RiderLocation;
import com.chengyiwaimai.model.Models.WithdrawRequest;
import com.chengyiwaimai.security.AuthContext;
import com.chengyiwaimai.security.CurrentUser;
import com.chengyiwaimai.service.BusinessService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/rider")
public class RiderController {
    private final BusinessService store;

    public RiderController(BusinessService store) {
        this.store = store;
    }

    @PostMapping("/certification")
    public ApiResponse<Map<String, Object>> certification(HttpServletRequest request, @RequestBody Map<String, Object> body) {
        CurrentUser user = AuthContext.requireRole(request, "rider");
        return ApiResponse.ok(store.riderCertification(user, body));
    }

    @GetMapping("/audit-status")
    public ApiResponse<Map<String, Object>> auditStatus(HttpServletRequest request) {
        CurrentUser user = AuthContext.requireRole(request, "rider");
        return ApiResponse.ok(store.riderAuditStatus(user));
    }

    @GetMapping("/profile")
    public ApiResponse<Map<String, Object>> profile(HttpServletRequest request) {
        CurrentUser user = AuthContext.requireRole(request, "rider");
        return ApiResponse.ok(store.riderProfile(user));
    }

    @PutMapping("/profile")
    public ApiResponse<Map<String, Object>> updateProfile(HttpServletRequest request, @RequestBody Map<String, Object> body) {
        CurrentUser user = AuthContext.requireRole(request, "rider");
        return ApiResponse.ok(store.updateUserProfile(user, body));
    }

    @PostMapping("/profile/avatar")
    public ApiResponse<Map<String, Object>> uploadAvatar(HttpServletRequest request,
                                                         @RequestParam(value = "nickname", required = false) String nickname,
                                                         @RequestParam("avatar") org.springframework.web.multipart.MultipartFile avatar) {
        CurrentUser user = AuthContext.requireRole(request, "rider");
        return ApiResponse.ok(store.updateUserProfileWithAvatar(user, nickname, avatar));
    }

    @GetMapping("/lobby")
    public ApiResponse<List<Map<String, Object>>> lobby(HttpServletRequest request) {
        AuthContext.requireRole(request, "rider");
        return ApiResponse.ok(store.riderLobbyOrders());
    }

    @GetMapping("/tasks")
    public ApiResponse<?> tasks(HttpServletRequest request) {
        CurrentUser user = AuthContext.requireRole(request, "rider");
        return ApiResponse.ok(store.riderOrders(user));
    }

    @GetMapping("/history")
    public ApiResponse<?> history(HttpServletRequest request) {
        CurrentUser user = AuthContext.requireRole(request, "rider");
        return ApiResponse.ok(store.riderHistory(user));
    }

    @PostMapping("/location")
    public ApiResponse<RiderLocation> location(HttpServletRequest request, @RequestBody RiderLocation location) {
        CurrentUser user = AuthContext.requireRole(request, "rider");
        store.requireRiderOrder(user, location.orderId());
        store.cacheRiderLocation(location.orderId(), location);
        return ApiResponse.ok(location);
    }

    @GetMapping("/income")
    public ApiResponse<Map<String, Object>> income(HttpServletRequest request) {
        CurrentUser user = AuthContext.requireRole(request, "rider");
        return ApiResponse.ok(store.riderStats(user));
    }

    @PostMapping("/withdraw")
    public ApiResponse<Map<String, Object>> withdraw(HttpServletRequest httpRequest, @RequestBody WithdrawRequest request) {
        CurrentUser user = AuthContext.requireRole(httpRequest, "rider");
        return ApiResponse.ok(store.withdraw(user, request.amount(), request.accountNo()));
    }

    @GetMapping("/withdraw-records")
    public ApiResponse<List<Map<String, Object>>> withdrawRecords(HttpServletRequest request) {
        CurrentUser user = AuthContext.requireRole(request, "rider");
        return ApiResponse.ok(store.withdrawRecords(user));
    }

    @GetMapping("/level")
    public ApiResponse<Map<String, Object>> level(HttpServletRequest request) {
        CurrentUser user = AuthContext.requireRole(request, "rider");
        return ApiResponse.ok(store.riderLevel(user));
    }
}

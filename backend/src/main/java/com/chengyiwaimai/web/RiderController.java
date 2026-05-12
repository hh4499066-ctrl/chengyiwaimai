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
    public ApiResponse<Map<String, Object>> certification(@RequestBody Map<String, Object> body) {
        return ApiResponse.ok(Map.of("status", "pending", "message", "实名认证资料已提交", "data", body));
    }

    @GetMapping("/audit-status")
    public ApiResponse<Map<String, Object>> auditStatus() {
        return ApiResponse.ok(Map.of("status", "approved", "message", "审核已通过，可开始接单"));
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

    @PostMapping("/location")
    public ApiResponse<RiderLocation> location(HttpServletRequest request, @RequestBody RiderLocation location) {
        CurrentUser user = AuthContext.requireRole(request, "rider");
        store.requireRiderOrder(user, location.orderId());
        return ApiResponse.ok(location);
    }

    @GetMapping("/income")
    public ApiResponse<Map<String, Object>> income(HttpServletRequest request) {
        CurrentUser user = AuthContext.requireRole(request, "rider");
        return ApiResponse.ok(store.riderStats(user));
    }

    @PostMapping("/withdraw")
    public ApiResponse<Map<String, Object>> withdraw(@RequestBody WithdrawRequest request) {
        return ApiResponse.ok(Map.of("status", "submitted", "amount", request.amount(), "accountNo", request.accountNo()));
    }

    @GetMapping("/level")
    public ApiResponse<Map<String, Object>> level() {
        return ApiResponse.ok(Map.of("level", "黄金骑手", "score", 4.8, "nextLevelNeed", "再完成 58 单升级为铂金骑手"));
    }
}

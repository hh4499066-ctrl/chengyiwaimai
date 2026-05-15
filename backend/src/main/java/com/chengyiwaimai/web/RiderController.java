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
        return ApiResponse.ok(Map.of("status", "pending", "demo", true, "message", "实名认证资料已提交，当前为演示流程", "data", body));
    }

    @GetMapping("/audit-status")
    public ApiResponse<Map<String, Object>> auditStatus() {
        return ApiResponse.ok(Map.of("status", "approved", "demo", true, "message", "认证审核演示状态：已通过，可开始接单"));
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
    public ApiResponse<Map<String, Object>> level() {
        return ApiResponse.ok(Map.of("level", "黄金骑手", "score", 4.8, "nextLevelNeed", "再完成 58 单升级为铂金骑手", "demo", true));
    }
}

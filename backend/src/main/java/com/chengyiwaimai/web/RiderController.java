package com.chengyiwaimai.web;

import com.chengyiwaimai.common.ApiResponse;
import com.chengyiwaimai.model.Models.RiderLocation;
import com.chengyiwaimai.model.Models.WithdrawRequest;
import com.chengyiwaimai.service.DemoStore;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/rider")
public class RiderController {
    private final DemoStore store;

    public RiderController(DemoStore store) {
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
    public ApiResponse<List<Map<String, Object>>> lobby() {
        return ApiResponse.ok(List.of(
                Map.of("orderId", "CY202605120001", "income", 4.5, "distance", "1.2km", "merchant", "老刘家招牌牛肉面", "address", "学校东门 3 号宿舍楼 502"),
                Map.of("orderId", "CY202605120002", "income", 3.2, "distance", "3.5km", "merchant", "橙意轻食研究所", "address", "实验楼 A 座大厅")
        ));
    }

    @GetMapping("/tasks")
    public ApiResponse<?> tasks() {
        return ApiResponse.ok(store.orders());
    }

    @PostMapping("/location")
    public ApiResponse<RiderLocation> location(@RequestBody RiderLocation location) {
        return ApiResponse.ok(location);
    }

    @GetMapping("/income")
    public ApiResponse<Map<String, Object>> income() {
        return ApiResponse.ok(store.riderStats());
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

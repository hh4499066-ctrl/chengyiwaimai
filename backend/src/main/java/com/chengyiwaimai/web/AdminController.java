package com.chengyiwaimai.web;

import com.chengyiwaimai.common.ApiResponse;
import com.chengyiwaimai.service.DemoStore;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {
    private final DemoStore store;

    public AdminController(DemoStore store) {
        this.store = store;
    }

    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Object>> dashboard() {
        return ApiResponse.ok(Map.of(
                "todayGmv", 128459,
                "todayOrders", 421,
                "activeUsers", 3280,
                "exceptionOrders", 3
        ));
    }

    @GetMapping("/users")
    public ApiResponse<List<Map<String, Object>>> users() {
        return ApiResponse.ok(List.of(
                Map.of("id", 1, "name", "张同学", "phone", "13800000001", "status", "正常"),
                Map.of("id", 2, "name", "王师傅", "phone", "13800000002", "status", "正常")
        ));
    }

    @GetMapping("/merchants")
    public ApiResponse<?> merchants() {
        return ApiResponse.ok(store.merchants());
    }

    @GetMapping("/riders")
    public ApiResponse<List<Map<String, Object>>> riders() {
        return ApiResponse.ok(List.of(
                Map.of("id", 1, "name", "王师傅", "level", "黄金骑手", "status", "在线"),
                Map.of("id", 2, "name", "李师傅", "level", "白银骑手", "status", "休息")
        ));
    }

    @GetMapping("/orders")
    public ApiResponse<?> orders() {
        return ApiResponse.ok(store.adminOrders());
    }

    @GetMapping("/{module}")
    public ApiResponse<List<Map<String, Object>>> list(@PathVariable String module) {
        return ApiResponse.ok(List.of(Map.of("module", module, "status", "demo", "name", "橙意外卖演示数据")));
    }

    @PostMapping("/{module}/{id}/audit")
    public ApiResponse<Map<String, Object>> audit(@PathVariable String module, @PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(Map.of("module", module, "id", id, "result", body.getOrDefault("status", "approved")));
    }

    @PostMapping("/{module}")
    public ApiResponse<Map<String, Object>> create(@PathVariable String module, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(Map.of("module", module, "saved", true, "data", body));
    }

    @PutMapping("/{module}/{id}")
    public ApiResponse<Map<String, Object>> update(@PathVariable String module, @PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(Map.of("module", module, "id", id, "updated", true, "data", body));
    }

    @DeleteMapping("/{module}/{id}")
    public ApiResponse<Map<String, Object>> delete(@PathVariable String module, @PathVariable Long id) {
        return ApiResponse.ok(Map.of("module", module, "id", id, "deleted", true));
    }
}

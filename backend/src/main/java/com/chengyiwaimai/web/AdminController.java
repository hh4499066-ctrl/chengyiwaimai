package com.chengyiwaimai.web;

import com.chengyiwaimai.common.ApiResponse;
import com.chengyiwaimai.service.BusinessService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {
    private final BusinessService store;

    public AdminController(BusinessService store) {
        this.store = store;
    }

    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Object>> dashboard() {
        return ApiResponse.ok(store.adminDashboard());
    }

    @GetMapping("/users")
    public ApiResponse<List<Map<String, Object>>> users() {
        return ApiResponse.ok(store.adminUsers());
    }

    @GetMapping("/merchants")
    public ApiResponse<?> merchants() {
        return ApiResponse.ok(store.adminMerchants());
    }

    @GetMapping("/riders")
    public ApiResponse<List<Map<String, Object>>> riders() {
        return ApiResponse.ok(store.adminRiders());
    }

    @GetMapping("/orders")
    public ApiResponse<?> orders() {
        return ApiResponse.ok(store.adminOrders());
    }

    @GetMapping("/{module}")
    public ApiResponse<List<Map<String, Object>>> list(@PathVariable String module) {
        if ("marketing".equals(module)) {
            return ApiResponse.ok(store.adminMarketing());
        }
        if ("users".equals(module)) {
            return ApiResponse.ok(store.adminUsers());
        }
        if ("riders".equals(module)) {
            return ApiResponse.ok(store.adminRiders());
        }
        return ApiResponse.ok(List.of(Map.of("module", module, "status", "unsupported")));
    }

    @PostMapping("/{module}/{id}/audit")
    public ApiResponse<Map<String, Object>> audit(@PathVariable String module, @PathVariable Long id, @RequestBody Map<String, Object> body) {
        Object status = body.get("status");
        Object rejectReason = body.get("rejectReason");
        return ApiResponse.ok(store.adminAudit(module, id, status == null ? "approved" : String.valueOf(status), rejectReason == null ? "" : String.valueOf(rejectReason)));
    }

    @PostMapping("/{module}")
    public ApiResponse<Map<String, Object>> create(@PathVariable String module, @RequestBody Map<String, Object> body) {
        if ("marketing".equals(module)) {
            return ApiResponse.ok(store.createAdminMarketing(body));
        }
        throw new com.chengyiwaimai.common.BizException("该后台模块暂不支持新增");
    }

    @PutMapping("/{module}/{id}")
    public ApiResponse<Map<String, Object>> update(@PathVariable String module, @PathVariable Long id, @RequestBody Map<String, Object> body) {
        if ("marketing".equals(module)) {
            return ApiResponse.ok(store.updateAdminMarketing(id, body));
        }
        throw new com.chengyiwaimai.common.BizException("该后台模块暂不支持编辑");
    }

    @DeleteMapping("/{module}/{id}")
    public ApiResponse<Map<String, Object>> delete(@PathVariable String module, @PathVariable Long id) {
        if ("marketing".equals(module)) {
            store.deleteAdminMarketing(id);
            return ApiResponse.ok(Map.of("deleted", true));
        }
        throw new com.chengyiwaimai.common.BizException("该后台模块暂不支持删除");
    }

    @PatchMapping("/users/{id}/status")
    public ApiResponse<Map<String, Object>> userStatus(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(store.updateUserStatus(id, String.valueOf(body.getOrDefault("status", "enabled"))));
    }
}

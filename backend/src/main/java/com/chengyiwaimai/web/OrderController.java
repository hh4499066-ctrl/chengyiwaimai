package com.chengyiwaimai.web;

import com.chengyiwaimai.common.ApiResponse;
import com.chengyiwaimai.model.Models.CreateOrderRequest;
import com.chengyiwaimai.model.Models.Order;
import com.chengyiwaimai.model.Models.RiderLocation;
import com.chengyiwaimai.service.DemoStore;
import com.chengyiwaimai.websocket.OrderSocketHandler;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {
    private final DemoStore store;
    private final OrderSocketHandler socketHandler;

    public OrderController(DemoStore store, OrderSocketHandler socketHandler) {
        this.store = store;
        this.socketHandler = socketHandler;
    }

    @GetMapping
    public ApiResponse<List<Order>> list() {
        return ApiResponse.ok(store.orders());
    }

    @PostMapping
    public ApiResponse<Order> create(@RequestBody CreateOrderRequest request) {
        return ApiResponse.ok(store.createOrder(request));
    }

    @PostMapping("/{orderId}/pay")
    public ApiResponse<Order> pay(@PathVariable String orderId) {
        Order order = store.updateStatus(orderId, "商家待接单");
        socketHandler.broadcast("订单已支付：" + order.id());
        return ApiResponse.ok(order);
    }

    @PostMapping("/{orderId}/merchant/{action}")
    public ApiResponse<Order> merchantAction(@PathVariable String orderId, @PathVariable String action) {
        String status = switch (action) {
            case "accept" -> "商家已接单";
            case "reject" -> "商家已拒单";
            case "ready" -> "商家已出餐";
            default -> "商家处理中";
        };
        Order order = store.updateStatus(orderId, status);
        socketHandler.broadcast(status + "：" + order.id());
        return ApiResponse.ok(order);
    }

    @PostMapping("/{orderId}/rider/{action}")
    public ApiResponse<Order> riderAction(@PathVariable String orderId, @PathVariable String action) {
        String status = switch (action) {
            case "accept" -> "骑手已接单";
            case "pickup" -> "骑手已取餐";
            case "delivered" -> "已完成";
            default -> "配送中";
        };
        Order order = store.updateStatus(orderId, status);
        socketHandler.broadcast(status + "：" + order.id());
        return ApiResponse.ok(order);
    }

    @PostMapping("/{orderId}/location")
    public ApiResponse<RiderLocation> location(@PathVariable String orderId, @RequestBody RiderLocation location) {
        socketHandler.broadcast("骑手位置更新：" + orderId + "," + location.longitude() + "," + location.latitude());
        return ApiResponse.ok(location);
    }
}

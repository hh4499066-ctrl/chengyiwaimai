package com.chengyiwaimai.web;

import com.chengyiwaimai.common.ApiResponse;
import com.chengyiwaimai.common.BizException;
import com.chengyiwaimai.model.Models.CreateOrderRequest;
import com.chengyiwaimai.model.Models.Order;
import com.chengyiwaimai.model.Models.RiderLocation;
import com.chengyiwaimai.service.DemoStore;
import com.chengyiwaimai.websocket.OrderSocketHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
        Order order = store.payOrder(orderId);
        socketHandler.broadcast("订单已支付：" + order.id());
        return ApiResponse.ok(order);
    }

    @PostMapping("/{orderId}/merchant/{action}")
    public ApiResponse<Order> merchantAction(@PathVariable String orderId, @PathVariable String action) {
        Order order = switch (action) {
            case "accept" -> store.merchantAccept(orderId);
            case "reject", "cancel" -> store.merchantCancel(orderId);
            case "ready" -> store.merchantReady(orderId);
            default -> throw new BizException("不支持的商家操作");
        };
        socketHandler.broadcast(order.status() + "：" + order.id());
        return ApiResponse.ok(order);
    }

    @PostMapping("/{orderId}/rider/{action}")
    public ApiResponse<Order> riderAction(@PathVariable String orderId, @PathVariable String action) {
        Order order = switch (action) {
            case "accept" -> store.riderAccept(orderId);
            case "pickup" -> store.riderPickup(orderId);
            case "delivered" -> store.riderDelivered(orderId);
            default -> throw new BizException("不支持的骑手操作");
        };
        socketHandler.broadcast(order.status() + "：" + order.id());
        return ApiResponse.ok(order);
    }

    @PostMapping("/{orderId}/location")
    public ApiResponse<RiderLocation> location(@PathVariable String orderId, @RequestBody RiderLocation location) {
        socketHandler.broadcast("骑手位置更新：" + orderId + "," + location.longitude() + "," + location.latitude());
        return ApiResponse.ok(location);
    }
}

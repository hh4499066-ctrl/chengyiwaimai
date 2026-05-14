package com.chengyiwaimai.web;

import com.chengyiwaimai.common.ApiResponse;
import com.chengyiwaimai.common.BizException;
import com.chengyiwaimai.model.Models.CreateOrderRequest;
import com.chengyiwaimai.model.Models.Order;
import com.chengyiwaimai.model.Models.RiderLocation;
import com.chengyiwaimai.security.AuthContext;
import com.chengyiwaimai.security.CurrentUser;
import com.chengyiwaimai.service.BusinessService;
import com.chengyiwaimai.websocket.OrderSocketHandler;
import com.chengyiwaimai.websocket.WebSocketTicketService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
public class OrderController {
    private final BusinessService store;
    private final OrderSocketHandler socketHandler;
    private final WebSocketTicketService ticketService;

    public OrderController(BusinessService store, OrderSocketHandler socketHandler, WebSocketTicketService ticketService) {
        this.store = store;
        this.socketHandler = socketHandler;
        this.ticketService = ticketService;
    }

    @GetMapping
    public ApiResponse<List<Order>> list(HttpServletRequest request) {
        CurrentUser user = AuthContext.currentUser(request);
        return ApiResponse.ok(switch (user.role()) {
            case "customer" -> store.customerOrders(user);
            case "merchant" -> store.merchantOrders(user);
            case "rider" -> store.riderOrders(user);
            case "admin" -> store.adminOrders();
            default -> throw new BizException(403, "无权访问该资源");
        });
    }

    @PostMapping
    public ApiResponse<Order> create(HttpServletRequest request, @RequestBody CreateOrderRequest createRequest) {
        CurrentUser user = AuthContext.requireRole(request, "customer");
        return ApiResponse.ok(store.createOrder(user, createRequest));
    }

    @PostMapping("/{orderId}/pay")
    public ApiResponse<Order> pay(HttpServletRequest request, @PathVariable String orderId, @RequestBody(required = false) Map<String, Object> body) {
        CurrentUser user = AuthContext.requireRole(request, "customer");
        String payMethod = body == null ? null : String.valueOf(body.getOrDefault("payMethod", ""));
        Order order = store.payOrder(user, orderId, payMethod);
        socketHandler.broadcast(order.id(), "订单已支付：" + order.id());
        return ApiResponse.ok(order);
    }

    @PostMapping("/{orderId}/merchant/{action}")
    public ApiResponse<Order> merchantAction(HttpServletRequest request, @PathVariable String orderId, @PathVariable String action) {
        CurrentUser user = AuthContext.requireRole(request, "merchant");
        Order order = switch (action) {
            case "accept" -> store.merchantAccept(user, orderId);
            case "reject", "cancel" -> store.merchantCancel(user, orderId);
            case "ready" -> store.merchantReady(user, orderId);
            default -> throw new BizException("不支持的商家操作");
        };
        socketHandler.broadcast(order.id(), order.status() + "：" + order.id());
        return ApiResponse.ok(order);
    }

    @PostMapping("/{orderId}/cancel")
    public ApiResponse<Order> cancel(HttpServletRequest request, @PathVariable String orderId) {
        CurrentUser user = AuthContext.requireRole(request, "customer");
        Order order = store.cancelOrder(user, orderId);
        socketHandler.broadcast(order.id(), order.status() + "：" + order.id());
        return ApiResponse.ok(order);
    }

    @PostMapping("/{orderId}/rider/{action}")
    public ApiResponse<Order> riderAction(HttpServletRequest request, @PathVariable String orderId, @PathVariable String action) {
        CurrentUser user = AuthContext.requireRole(request, "rider");
        Order order = switch (action) {
            case "accept" -> store.riderAccept(user, orderId);
            case "pickup" -> store.riderPickup(user, orderId);
            case "delivered" -> store.riderDelivered(user, orderId);
            default -> throw new BizException("不支持的骑手操作");
        };
        socketHandler.broadcast(order.id(), order.status() + "：" + order.id());
        return ApiResponse.ok(order);
    }

    @PostMapping("/{orderId}/location")
    public ApiResponse<RiderLocation> location(HttpServletRequest request, @PathVariable String orderId, @RequestBody RiderLocation location) {
        CurrentUser user = AuthContext.requireRole(request, "rider");
        store.requireRiderOrder(user, orderId);
        store.cacheRiderLocation(orderId, location);
        socketHandler.broadcast(orderId, "骑手位置更新：" + orderId + "," + location.longitude() + "," + location.latitude());
        return ApiResponse.ok(location);
    }

    @GetMapping("/{orderId}/location")
    public ApiResponse<Map<String, Object>> latestLocation(HttpServletRequest request, @PathVariable String orderId) {
        CurrentUser user = AuthContext.currentUser(request);
        store.requireOrderSubscription(user, orderId);
        return ApiResponse.ok(store.latestRiderLocation(orderId));
    }

    @PostMapping("/{orderId}/ws-ticket")
    public ApiResponse<Map<String, Object>> websocketTicket(HttpServletRequest request, @PathVariable String orderId) {
        CurrentUser user = AuthContext.currentUser(request);
        store.requireOrderSubscription(user, orderId);
        return ApiResponse.ok(Map.of("ticket", ticketService.createTicket(user, orderId), "expiresInSeconds", 60));
    }
}

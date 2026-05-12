package com.chengyiwaimai.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.chengyiwaimai.common.BizException;
import com.chengyiwaimai.entity.CartItemEntity;
import com.chengyiwaimai.entity.DeliveryOrderEntity;
import com.chengyiwaimai.entity.DishEntity;
import com.chengyiwaimai.entity.CouponEntity;
import com.chengyiwaimai.entity.MarketingActivityEntity;
import com.chengyiwaimai.entity.MerchantEntity;
import com.chengyiwaimai.entity.OrderItemEntity;
import com.chengyiwaimai.entity.ReviewEntity;
import com.chengyiwaimai.entity.SysUserEntity;
import com.chengyiwaimai.entity.UserAddressEntity;
import com.chengyiwaimai.mapper.CartItemMapper;
import com.chengyiwaimai.mapper.CouponMapper;
import com.chengyiwaimai.mapper.DeliveryOrderMapper;
import com.chengyiwaimai.mapper.DishMapper;
import com.chengyiwaimai.mapper.MarketingActivityMapper;
import com.chengyiwaimai.mapper.MerchantMapper;
import com.chengyiwaimai.mapper.OrderItemMapper;
import com.chengyiwaimai.mapper.ReviewMapper;
import com.chengyiwaimai.mapper.SysUserMapper;
import com.chengyiwaimai.mapper.UserAddressMapper;
import com.chengyiwaimai.model.Models.Address;
import com.chengyiwaimai.model.Models.CartItem;
import com.chengyiwaimai.model.Models.Category;
import com.chengyiwaimai.model.Models.Coupon;
import com.chengyiwaimai.model.Models.CreateOrderRequest;
import com.chengyiwaimai.model.Models.Dish;
import com.chengyiwaimai.model.Models.Merchant;
import com.chengyiwaimai.model.Models.Order;
import com.chengyiwaimai.model.Models.Review;
import com.chengyiwaimai.security.CurrentUser;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class BusinessService {
    public static final String WAIT_PAY = "待支付";
    public static final String WAIT_MERCHANT_ACCEPT = "待商家接单";
    public static final String MERCHANT_ACCEPTED = "商家已接单";
    public static final String CANCELED = "已取消";
    public static final String MERCHANT_READY = "商家已出餐";
    public static final String RIDER_ACCEPTED = "骑手已接单";
    public static final String RIDER_PICKED = "骑手已取餐";
    public static final String COMPLETED = "已完成";

    private static final SecureRandom RANDOM = new SecureRandom();

    private final MerchantMapper merchantMapper;
    private final DishMapper dishMapper;
    private final DeliveryOrderMapper deliveryOrderMapper;
    private final OrderItemMapper orderItemMapper;
    private final CartItemMapper cartItemMapper;
    private final UserAddressMapper userAddressMapper;
    private final CouponMapper couponMapper;
    private final ReviewMapper reviewMapper;
    private final SysUserMapper sysUserMapper;
    private final MarketingActivityMapper marketingActivityMapper;
    private final List<Category> categories = new CopyOnWriteArrayList<>();

    public BusinessService(
            MerchantMapper merchantMapper,
            DishMapper dishMapper,
            DeliveryOrderMapper deliveryOrderMapper,
            OrderItemMapper orderItemMapper,
            CartItemMapper cartItemMapper,
            UserAddressMapper userAddressMapper,
            CouponMapper couponMapper,
            ReviewMapper reviewMapper,
            SysUserMapper sysUserMapper,
            MarketingActivityMapper marketingActivityMapper
    ) {
        this.merchantMapper = merchantMapper;
        this.dishMapper = dishMapper;
        this.deliveryOrderMapper = deliveryOrderMapper;
        this.orderItemMapper = orderItemMapper;
        this.cartItemMapper = cartItemMapper;
        this.userAddressMapper = userAddressMapper;
        this.couponMapper = couponMapper;
        this.reviewMapper = reviewMapper;
        this.sysUserMapper = sysUserMapper;
        this.marketingActivityMapper = marketingActivityMapper;
        categories.add(new Category(1L, 1L, "招牌推荐", 1));
        categories.add(new Category(2L, 1L, "热销单品", 2));
        categories.add(new Category(3L, 1L, "饮品", 3));
    }

    public List<Merchant> merchants() {
        return merchantMapper.selectList(Wrappers.<MerchantEntity>lambdaQuery()
                        .eq(MerchantEntity::getAuditStatus, "approved")
                        .eq(MerchantEntity::getBusinessStatus, "open")
                        .orderByDesc(MerchantEntity::getRating))
                .stream()
                .map(this::toMerchant)
                .toList();
    }

    public List<Dish> dishes(Long merchantId) {
        return dishMapper.selectList(Wrappers.<DishEntity>lambdaQuery()
                        .eq(DishEntity::getMerchantId, merchantId)
                        .eq(DishEntity::getStatus, "on_sale")
                        .orderByAsc(DishEntity::getId))
                .stream()
                .map(this::toDish)
                .toList();
    }

    public List<Dish> merchantDishes(CurrentUser user) {
        return dishes(requireMerchant(user).getId());
    }

    public Dish saveDish(CurrentUser user, Dish dish) {
        MerchantEntity merchant = requireMerchant(user);
        if (dish.name() == null || dish.name().isBlank()) {
            throw new BizException("菜品名称不能为空");
        }
        if (dish.price() == null || dish.price().compareTo(BigDecimal.ZERO) < 0) {
            throw new BizException("菜品价格不能为空且不能为负数");
        }
        if (dish.sales() != null && dish.sales() < 0) {
            throw new BizException("菜品库存不能为负数");
        }
        DishEntity entity = new DishEntity();
        entity.setId(dish.id());
        entity.setMerchantId(merchant.getId());
        entity.setName(dish.name());
        entity.setDescription(dish.description());
        entity.setPrice(dish.price());
        entity.setCategoryName("默认分类");
        if (entity.getId() == null) {
            entity.setStock(dish.sales() == null ? 999 : dish.sales());
            entity.setStatus(dish.status() == null || dish.status().isBlank() ? "on_sale" : dish.status());
            if (dish.categoryName() != null && !dish.categoryName().isBlank()) {
                entity.setCategoryName(dish.categoryName());
            }
            dishMapper.insert(entity);
        } else {
            DishEntity old = dishMapper.selectById(entity.getId());
            if (old == null || !merchant.getId().equals(old.getMerchantId())) {
                throw new BizException("无权修改该菜品");
            }
            entity.setStock(dish.sales() == null ? old.getStock() : dish.sales());
            entity.setStatus(dish.status() == null || dish.status().isBlank() ? old.getStatus() : dish.status());
            entity.setCategoryName(dish.categoryName() == null || dish.categoryName().isBlank() ? old.getCategoryName() : dish.categoryName());
            dishMapper.updateById(entity);
        }
        return toDish(dishMapper.selectById(entity.getId()));
    }

    public List<CartItem> cartItems(Long userId) {
        return cartItemMapper.selectList(Wrappers.<CartItemEntity>lambdaQuery()
                        .eq(CartItemEntity::getUserId, userId)
                        .orderByAsc(CartItemEntity::getId))
                .stream()
                .map(this::toCartItem)
                .toList();
    }

    @Transactional
    public CartItem addCartItem(Long userId, CartItem item) {
        if (item.dishId() == null) {
            throw new BizException("菜品不能为空");
        }
        int quantity = item.quantity() == null || item.quantity() <= 0 ? 1 : item.quantity();
        DishEntity dish = requireOnSaleDish(item.dishId());
        CartItemEntity existing = cartItemMapper.selectOne(Wrappers.<CartItemEntity>lambdaQuery()
                .eq(CartItemEntity::getUserId, userId)
                .eq(CartItemEntity::getDishId, dish.getId())
                .last("limit 1"));
        if (existing == null) {
            existing = new CartItemEntity();
            existing.setUserId(userId);
            existing.setDishId(dish.getId());
            existing.setDishName(dish.getName());
            existing.setQuantity(quantity);
            existing.setPrice(dish.getPrice());
            try {
                cartItemMapper.insert(existing);
            } catch (DuplicateKeyException ex) {
                incrementCartItem(userId, dish, quantity);
                existing = requireCartItem(userId, dish.getId());
            }
        } else {
            incrementCartItem(userId, dish, quantity);
            existing = requireCartItem(userId, dish.getId());
        }
        return toCartItem(existing);
    }

    public CartItem updateCartItem(Long userId, Long dishId, Integer quantity) {
        if (quantity == null || quantity < 0) {
            throw new BizException("商品数量不合法");
        }
        CartItemEntity item = requireCartItem(userId, dishId);
        if (quantity == 0) {
            cartItemMapper.deleteById(item.getId());
            return new CartItem(dishId, item.getDishName(), 0, item.getPrice());
        }
        item.setQuantity(quantity);
        cartItemMapper.updateById(item);
        return toCartItem(item);
    }

    public void deleteCartItem(Long userId, Long dishId) {
        CartItemEntity item = requireCartItem(userId, dishId);
        cartItemMapper.deleteById(item.getId());
    }

    public void clearCart(Long userId) {
        cartItemMapper.delete(Wrappers.<CartItemEntity>lambdaQuery().eq(CartItemEntity::getUserId, userId));
    }

    @Transactional
    public Order createOrder(CurrentUser user, CreateOrderRequest request) {
        if (request.merchantId() == null) {
            throw new BizException("商家不能为空");
        }
        MerchantEntity merchant = merchantMapper.selectById(request.merchantId());
        if (merchant == null) {
            throw new BizException("商家不存在");
        }
        List<CartItem> items = request.items() == null || request.items().isEmpty() ? cartItems(user.userId()) : request.items();
        if (items.isEmpty()) {
            throw new BizException("购物车为空");
        }

        String orderId = nextOrderId();
        BigDecimal total = BigDecimal.ZERO;
        for (CartItem item : items) {
            int quantity = validateQuantity(item.quantity());
            DishEntity dish = requireOnSaleDish(item.dishId());
            if (!request.merchantId().equals(dish.getMerchantId())) {
                throw new BizException("订单商品不属于当前商家");
            }
            int stockRows = dishMapper.update(null, Wrappers.<DishEntity>lambdaUpdate()
                    .setSql("stock = stock - " + quantity)
                    .eq(DishEntity::getId, dish.getId())
                    .eq(DishEntity::getStatus, "on_sale")
                    .ge(DishEntity::getStock, quantity));
            if (stockRows != 1) {
                throw new BizException("库存不足，请重新选择商品");
            }

            OrderItemEntity orderItem = new OrderItemEntity();
            orderItem.setOrderId(orderId);
            orderItem.setDishId(dish.getId());
            orderItem.setDishName(dish.getName());
            orderItem.setQuantity(quantity);
            orderItem.setPrice(dish.getPrice());
            orderItemMapper.insert(orderItem);
            total = total.add(dish.getPrice().multiply(BigDecimal.valueOf(quantity)));
        }
        total = total.add(new BigDecimal("1.50"));

        DeliveryOrderEntity order = new DeliveryOrderEntity();
        order.setId(orderId);
        order.setUserId(user.userId());
        order.setMerchantId(merchant.getId());
        order.setTotalAmount(total);
        order.setAddress(request.address());
        order.setStatus(WAIT_PAY);
        deliveryOrderMapper.insert(order);
        clearCart(user.userId());
        return toOrder(order, merchant.getName());
    }

    public Order payOrder(CurrentUser user, String orderId) {
        DeliveryOrderEntity order = requireOrder(orderId);
        if (!user.userId().equals(order.getUserId())) {
            throw new BizException(403, "无权操作该订单");
        }
        return updateStatus(orderId, WAIT_PAY, WAIT_MERCHANT_ACCEPT, Wrappers.<DeliveryOrderEntity>lambdaUpdate()
                .eq(DeliveryOrderEntity::getId, orderId)
                .eq(DeliveryOrderEntity::getUserId, user.userId()));
    }

    public Order merchantAccept(CurrentUser user, String orderId) {
        return updateMerchantStatus(user, orderId, WAIT_MERCHANT_ACCEPT, MERCHANT_ACCEPTED);
    }

    @Transactional
    public Order merchantCancel(CurrentUser user, String orderId) {
        MerchantEntity merchant = requireMerchant(user);
        requireOrder(orderId);
        Order order = updateStatus(orderId, WAIT_MERCHANT_ACCEPT, CANCELED, Wrappers.<DeliveryOrderEntity>lambdaUpdate()
                .eq(DeliveryOrderEntity::getId, orderId)
                .eq(DeliveryOrderEntity::getMerchantId, merchant.getId()));
        restoreStock(orderId);
        return order;
    }

    public Order merchantReady(CurrentUser user, String orderId) {
        return updateMerchantStatus(user, orderId, MERCHANT_ACCEPTED, MERCHANT_READY);
    }

    public Order riderAccept(CurrentUser user, String orderId) {
        requireOrder(orderId);
        DeliveryOrderEntity update = new DeliveryOrderEntity();
        update.setStatus(RIDER_ACCEPTED);
        update.setRiderId(user.userId());
        int rows = deliveryOrderMapper.update(update, Wrappers.<DeliveryOrderEntity>lambdaUpdate()
                .eq(DeliveryOrderEntity::getId, orderId)
                .eq(DeliveryOrderEntity::getStatus, MERCHANT_READY)
                .isNull(DeliveryOrderEntity::getRiderId));
        if (rows != 1) {
            throw new BizException("订单状态已变化，请刷新");
        }
        return toOrder(deliveryOrderMapper.selectById(orderId));
    }

    public Order riderPickup(CurrentUser user, String orderId) {
        return updateRiderStatus(user, orderId, RIDER_ACCEPTED, RIDER_PICKED);
    }

    public Order riderDelivered(CurrentUser user, String orderId) {
        return updateRiderStatus(user, orderId, RIDER_PICKED, COMPLETED);
    }

    public void requireRiderOrder(CurrentUser user, String orderId) {
        DeliveryOrderEntity order = requireOrder(orderId);
        if (!user.userId().equals(order.getRiderId())) {
            throw new BizException(403, "无权操作该订单");
        }
    }

    public void requireOrderSubscription(CurrentUser user, String orderId) {
        DeliveryOrderEntity order = requireOrder(orderId);
        if (user.hasRole("admin")) {
            return;
        }
        if (user.hasRole("customer") && user.userId().equals(order.getUserId())) {
            return;
        }
        if (user.hasRole("merchant")) {
            MerchantEntity merchant = requireMerchant(user);
            if (merchant.getId().equals(order.getMerchantId())) {
                return;
            }
        }
        if (user.hasRole("rider") && user.userId().equals(order.getRiderId())) {
            return;
        }
        throw new BizException(403, "无权订阅该订单");
    }

    public List<Order> customerOrders(CurrentUser user) {
        return orders(Wrappers.<DeliveryOrderEntity>lambdaQuery()
                .eq(DeliveryOrderEntity::getUserId, user.userId())
                .orderByDesc(DeliveryOrderEntity::getCreateTime));
    }

    public List<Order> merchantOrders(CurrentUser user) {
        MerchantEntity merchant = requireMerchant(user);
        return orders(Wrappers.<DeliveryOrderEntity>lambdaQuery()
                .eq(DeliveryOrderEntity::getMerchantId, merchant.getId())
                .orderByDesc(DeliveryOrderEntity::getCreateTime));
    }

    public List<Order> riderOrders(CurrentUser user) {
        return orders(Wrappers.<DeliveryOrderEntity>lambdaQuery()
                .eq(DeliveryOrderEntity::getRiderId, user.userId())
                .orderByDesc(DeliveryOrderEntity::getCreateTime));
    }

    public List<Order> adminOrders() {
        return orders(Wrappers.<DeliveryOrderEntity>lambdaQuery().orderByDesc(DeliveryOrderEntity::getCreateTime));
    }

    @Transactional
    public int cancelTimeoutUnpaidOrders() {
        LocalDateTime deadline = LocalDateTime.now().minusMinutes(15);
        List<DeliveryOrderEntity> timeoutOrders = deliveryOrderMapper.selectList(Wrappers.<DeliveryOrderEntity>lambdaQuery()
                .eq(DeliveryOrderEntity::getStatus, WAIT_PAY)
                .le(DeliveryOrderEntity::getCreateTime, deadline));
        int count = 0;
        for (DeliveryOrderEntity order : timeoutOrders) {
            DeliveryOrderEntity update = new DeliveryOrderEntity();
            update.setStatus(CANCELED);
            int rows = deliveryOrderMapper.update(update, Wrappers.<DeliveryOrderEntity>lambdaUpdate()
                    .eq(DeliveryOrderEntity::getId, order.getId())
                    .eq(DeliveryOrderEntity::getStatus, WAIT_PAY));
            if (rows == 1) {
                restoreStock(order.getId());
                count++;
            }
        }
        return count;
    }

    public List<Map<String, Object>> riderLobbyOrders() {
        List<DeliveryOrderEntity> orders = deliveryOrderMapper.selectList(Wrappers.<DeliveryOrderEntity>lambdaQuery()
                .eq(DeliveryOrderEntity::getStatus, MERCHANT_READY)
                .isNull(DeliveryOrderEntity::getRiderId)
                .orderByAsc(DeliveryOrderEntity::getCreateTime));
        if (orders.isEmpty()) {
            return List.of();
        }
        Map<Long, MerchantEntity> merchantsById = merchantsById(orders.stream()
                .map(DeliveryOrderEntity::getMerchantId)
                .filter(id -> id != null)
                .collect(Collectors.toSet()));
        return orders.stream()
                .map(order -> {
                    MerchantEntity merchant = merchantsById.get(order.getMerchantId());
                    return Map.<String, Object>of(
                            "orderId", order.getId(),
                            "income", new BigDecimal("4.50"),
                            "distance", "1.2km",
                            "merchant", merchant == null ? "未知商家" : merchant.getName(),
                            "address", order.getAddress() == null ? "" : order.getAddress()
                    );
                })
                .toList();
    }

    public List<Address> addresses(CurrentUser user) {
        return userAddressMapper.selectList(Wrappers.<UserAddressEntity>lambdaQuery()
                        .eq(UserAddressEntity::getUserId, user.userId())
                        .orderByDesc(UserAddressEntity::getIsDefault)
                        .orderByDesc(UserAddressEntity::getUpdateTime))
                .stream()
                .map(this::toAddress)
                .toList();
    }

    @Transactional
    public Address saveAddress(CurrentUser user, Address address) {
        if (Boolean.TRUE.equals(address.isDefault())) {
            userAddressMapper.update(null, Wrappers.<UserAddressEntity>lambdaUpdate()
                    .set(UserAddressEntity::getIsDefault, false)
                    .eq(UserAddressEntity::getUserId, user.userId()));
        }
        UserAddressEntity entity = new UserAddressEntity();
        entity.setId(address.id());
        entity.setUserId(user.userId());
        entity.setReceiver(address.receiver());
        entity.setPhone(address.phone());
        entity.setDetail(address.detail());
        entity.setIsDefault(Boolean.TRUE.equals(address.isDefault()));
        if (entity.getId() == null) {
            userAddressMapper.insert(entity);
        } else {
            int rows = userAddressMapper.update(entity, Wrappers.<UserAddressEntity>lambdaUpdate()
                    .eq(UserAddressEntity::getId, entity.getId())
                    .eq(UserAddressEntity::getUserId, user.userId()));
            if (rows != 1) {
                throw new BizException("地址不存在或无权修改");
            }
        }
        return toAddress(userAddressMapper.selectById(entity.getId()));
    }

    public List<Coupon> coupons() {
        return couponMapper.selectList(Wrappers.<CouponEntity>lambdaQuery()
                        .eq(CouponEntity::getStatus, "enabled")
                        .orderByAsc(CouponEntity::getId))
                .stream()
                .map(this::toCoupon)
                .toList();
    }

    public List<Review> reviews(CurrentUser user) {
        return reviewMapper.selectList(Wrappers.<ReviewEntity>lambdaQuery()
                        .eq(ReviewEntity::getUserId, user.userId())
                        .orderByDesc(ReviewEntity::getCreateTime))
                .stream()
                .map(this::toReview)
                .toList();
    }

    public List<Review> merchantReviews(CurrentUser user) {
        MerchantEntity merchant = requireMerchant(user);
        return reviewMapper.selectList(Wrappers.<ReviewEntity>lambdaQuery()
                        .eq(ReviewEntity::getMerchantId, merchant.getId())
                        .orderByDesc(ReviewEntity::getCreateTime))
                .stream()
                .map(this::toReview)
                .toList();
    }

    public Review replyReview(CurrentUser user, Long reviewId, String reply) {
        MerchantEntity merchant = requireMerchant(user);
        ReviewEntity update = new ReviewEntity();
        update.setReply(reply);
        int rows = reviewMapper.update(update, Wrappers.<ReviewEntity>lambdaUpdate()
                .eq(ReviewEntity::getId, reviewId)
                .eq(ReviewEntity::getMerchantId, merchant.getId()));
        if (rows != 1) {
            throw new BizException("评价不存在或无权回复");
        }
        return toReview(reviewMapper.selectById(reviewId));
    }

    @Transactional
    public Review saveReview(CurrentUser user, Review review) {
        DeliveryOrderEntity order = requireOrder(review.orderId());
        if (!user.userId().equals(order.getUserId())) {
            throw new BizException(403, "无权评价该订单");
        }
        if (!COMPLETED.equals(order.getStatus())) {
            throw new BizException("只有已完成订单可以评价");
        }
        ReviewEntity existing = reviewMapper.selectOne(Wrappers.<ReviewEntity>lambdaQuery()
                .eq(ReviewEntity::getOrderId, review.orderId())
                .last("limit 1"));
        if (existing != null) {
            throw new BizException("该订单已评价");
        }
        ReviewEntity entity = new ReviewEntity();
        entity.setOrderId(review.orderId());
        entity.setUserId(user.userId());
        entity.setMerchantId(order.getMerchantId());
        entity.setRating(review.rating());
        entity.setContent(review.content());
        reviewMapper.insert(entity);
        return toReview(entity);
    }

    public List<Category> categories(CurrentUser user) {
        return categories(requireMerchant(user).getId());
    }

    public List<Category> categories(Long merchantId) {
        return categories.stream().filter(category -> category.merchantId().equals(merchantId)).toList();
    }

    public Category saveCategory(CurrentUser user, Category category) {
        MerchantEntity merchant = requireMerchant(user);
        Category next = new Category(category.id() == null ? System.currentTimeMillis() : category.id(), merchant.getId(), category.name(), category.sort());
        categories.add(next);
        return next;
    }

    public Map<String, Object> merchantStats(CurrentUser user) {
        List<Order> orders = merchantOrders(user);
        return Map.of(
                "todayIncome", orders.stream().map(Order::totalAmount).reduce(BigDecimal.ZERO, BigDecimal::add),
                "todayOrders", orders.size(),
                "conversionRate", "18.5%",
                "refundOrders", orders.stream().filter(order -> CANCELED.equals(order.status())).count()
        );
    }

    public Map<String, Object> riderStats(CurrentUser user) {
        List<DeliveryOrderEntity> completed = deliveryOrderMapper.selectList(Wrappers.<DeliveryOrderEntity>lambdaQuery()
                .eq(DeliveryOrderEntity::getRiderId, user.userId())
                .eq(DeliveryOrderEntity::getStatus, COMPLETED));
        return Map.of(
                "todayIncome", BigDecimal.valueOf(completed.size()).multiply(new BigDecimal("4.50")),
                "todayOrders", completed.size(),
                "level", "黄金骑手",
                "score", "4.8"
        );
    }

    public Map<String, Object> adminDashboard() {
        List<Order> orders = adminOrders();
        return Map.of(
                "todayGmv", orders.stream().map(Order::totalAmount).reduce(BigDecimal.ZERO, BigDecimal::add),
                "todayOrders", orders.size(),
                "activeUsers", sysUserMapper.selectCount(Wrappers.<SysUserEntity>lambdaQuery().eq(SysUserEntity::getStatus, 1)),
                "exceptionOrders", orders.stream().filter(order -> CANCELED.equals(order.status())).count()
        );
    }

    public List<Map<String, Object>> adminUsers() {
        return sysUserMapper.selectList(Wrappers.<SysUserEntity>lambdaQuery().orderByDesc(SysUserEntity::getCreateTime))
                .stream()
                .map(user -> Map.<String, Object>of(
                        "id", user.getId(),
                        "name", user.getNickname() == null ? "" : user.getNickname(),
                        "phone", user.getPhone(),
                        "role", user.getRole(),
                        "status", user.getStatus() != null && user.getStatus() == 1 ? "正常" : "禁用"
                ))
                .toList();
    }

    public List<Map<String, Object>> adminRiders() {
        return sysUserMapper.selectList(Wrappers.<SysUserEntity>lambdaQuery()
                        .eq(SysUserEntity::getRole, "rider")
                        .orderByDesc(SysUserEntity::getCreateTime))
                .stream()
                .map(user -> Map.<String, Object>of(
                        "id", user.getId(),
                        "name", user.getNickname() == null ? "" : user.getNickname(),
                        "phone", user.getPhone(),
                        "level", "黄金骑手",
                        "status", user.getStatus() != null && user.getStatus() == 1 ? "正常" : "禁用"
                ))
                .toList();
    }

    public List<Map<String, Object>> adminMarketing() {
        return marketingActivityMapper.selectList(Wrappers.<MarketingActivityEntity>lambdaQuery()
                        .orderByDesc(MarketingActivityEntity::getStartTime))
                .stream()
                .map(activity -> Map.<String, Object>of(
                        "id", activity.getId(),
                        "name", activity.getName(),
                        "type", activity.getType(),
                        "status", activity.getStatus(),
                        "startTime", activity.getStartTime() == null ? "" : activity.getStartTime(),
                        "endTime", activity.getEndTime() == null ? "" : activity.getEndTime()
                ))
                .toList();
    }

    public Map<String, Object> adminAudit(String module, Long id, String status) {
        if ("merchants".equals(module) || "merchant".equals(module)) {
            MerchantEntity merchant = new MerchantEntity();
            merchant.setAuditStatus(status == null ? "approved" : status);
            int rows = merchantMapper.update(merchant, Wrappers.<MerchantEntity>lambdaUpdate().eq(MerchantEntity::getId, id));
            if (rows != 1) {
                throw new BizException("商家不存在");
            }
            return Map.of("module", module, "id", id, "result", merchant.getAuditStatus());
        }
        if ("riders".equals(module) || "users".equals(module)) {
            SysUserEntity user = new SysUserEntity();
            user.setStatus("disabled".equals(status) || "rejected".equals(status) ? 0 : 1);
            int rows = sysUserMapper.update(user, Wrappers.<SysUserEntity>lambdaUpdate().eq(SysUserEntity::getId, id));
            if (rows != 1) {
                throw new BizException("用户不存在");
            }
            return Map.of("module", module, "id", id, "result", user.getStatus() == 1 ? "approved" : "disabled");
        }
        return Map.of("module", module, "id", id, "result", status == null ? "approved" : status);
    }

    private Order updateMerchantStatus(CurrentUser user, String orderId, String expected, String nextStatus) {
        MerchantEntity merchant = requireMerchant(user);
        requireOrder(orderId);
        return updateStatus(orderId, expected, nextStatus, Wrappers.<DeliveryOrderEntity>lambdaUpdate()
                .eq(DeliveryOrderEntity::getId, orderId)
                .eq(DeliveryOrderEntity::getMerchantId, merchant.getId()));
    }

    private Order updateRiderStatus(CurrentUser user, String orderId, String expected, String nextStatus) {
        requireOrder(orderId);
        return updateStatus(orderId, expected, nextStatus, Wrappers.<DeliveryOrderEntity>lambdaUpdate()
                .eq(DeliveryOrderEntity::getId, orderId)
                .eq(DeliveryOrderEntity::getRiderId, user.userId()));
    }

    private Order updateStatus(String orderId, String expected, String nextStatus, com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<DeliveryOrderEntity> wrapper) {
        DeliveryOrderEntity update = new DeliveryOrderEntity();
        update.setStatus(nextStatus);
        int rows = deliveryOrderMapper.update(update, wrapper.eq(DeliveryOrderEntity::getStatus, expected));
        if (rows != 1) {
            throw new BizException("订单状态已变化，请刷新");
        }
        return toOrder(deliveryOrderMapper.selectById(orderId));
    }

    private void restoreStock(String orderId) {
        List<OrderItemEntity> items = orderItemMapper.selectList(Wrappers.<OrderItemEntity>lambdaQuery()
                .eq(OrderItemEntity::getOrderId, orderId));
        for (OrderItemEntity item : items) {
            if (item.getDishId() == null || item.getQuantity() == null || item.getQuantity() <= 0) {
                continue;
            }
            dishMapper.update(null, Wrappers.<DishEntity>lambdaUpdate()
                    .setSql("stock = stock + " + item.getQuantity())
                    .eq(DishEntity::getId, item.getDishId()));
        }
    }

    private DeliveryOrderEntity requireOrder(String orderId) {
        DeliveryOrderEntity order = deliveryOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BizException("订单不存在");
        }
        return order;
    }

    private MerchantEntity requireMerchant(CurrentUser user) {
        MerchantEntity merchant = merchantMapper.selectOne(Wrappers.<MerchantEntity>lambdaQuery()
                .eq(MerchantEntity::getUserId, user.userId())
                .last("limit 1"));
        if (merchant == null) {
            throw new BizException(403, "当前账号未绑定商家");
        }
        return merchant;
    }

    private DishEntity requireOnSaleDish(Long dishId) {
        DishEntity dish = dishMapper.selectById(dishId);
        if (dish == null || !"on_sale".equals(dish.getStatus())) {
            throw new BizException("商品不存在或已下架");
        }
        return dish;
    }

    private CartItemEntity requireCartItem(Long userId, Long dishId) {
        CartItemEntity item = cartItemMapper.selectOne(Wrappers.<CartItemEntity>lambdaQuery()
                .eq(CartItemEntity::getUserId, userId)
                .eq(CartItemEntity::getDishId, dishId)
                .last("limit 1"));
        if (item == null) {
            throw new BizException("购物车商品不存在");
        }
        return item;
    }

    private void incrementCartItem(Long userId, DishEntity dish, int quantity) {
        cartItemMapper.update(null, Wrappers.<CartItemEntity>lambdaUpdate()
                .setSql("quantity = quantity + " + quantity)
                .set(CartItemEntity::getDishName, dish.getName())
                .set(CartItemEntity::getPrice, dish.getPrice())
                .eq(CartItemEntity::getUserId, userId)
                .eq(CartItemEntity::getDishId, dish.getId()));
    }

    private int validateQuantity(Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new BizException("商品数量不合法");
        }
        return quantity;
    }

    private List<Order> orders(LambdaQueryWrapper<DeliveryOrderEntity> query) {
        List<DeliveryOrderEntity> orders = deliveryOrderMapper.selectList(query);
        if (orders.isEmpty()) {
            return List.of();
        }
        Map<Long, MerchantEntity> merchantsById = merchantsById(orders.stream()
                .map(DeliveryOrderEntity::getMerchantId)
                .filter(id -> id != null)
                .collect(Collectors.toSet()));
        return orders.stream()
                .map(order -> toOrder(order, merchantsById.get(order.getMerchantId())))
                .toList();
    }

    private Map<Long, MerchantEntity> merchantsById(Collection<Long> ids) {
        if (ids.isEmpty()) {
            return Collections.emptyMap();
        }
        return merchantMapper.selectBatchIds(ids).stream()
                .collect(Collectors.toMap(MerchantEntity::getId, Function.identity()));
    }

    private Order toOrder(DeliveryOrderEntity entity) {
        MerchantEntity merchant = entity.getMerchantId() == null ? null : merchantMapper.selectById(entity.getMerchantId());
        return toOrder(entity, merchant);
    }

    private Order toOrder(DeliveryOrderEntity entity, MerchantEntity merchant) {
        return toOrder(entity, merchant == null ? "未知商家" : merchant.getName());
    }

    private Order toOrder(DeliveryOrderEntity entity, String merchantName) {
        return new Order(entity.getId(), entity.getMerchantId(), merchantName, entity.getStatus(), entity.getTotalAmount(), entity.getAddress(), entity.getCreateTime());
    }

    private Merchant toMerchant(MerchantEntity entity) {
        return new Merchant(entity.getId(), entity.getName(), entity.getCategory(), entity.getRating(), "800m", "25分钟");
    }

    private Dish toDish(DishEntity entity) {
        return new Dish(entity.getId(), entity.getMerchantId(), entity.getName(), entity.getDescription(), entity.getPrice(), entity.getStock(), entity.getCategoryName(), entity.getStatus());
    }

    private CartItem toCartItem(CartItemEntity entity) {
        return new CartItem(entity.getDishId(), entity.getDishName(), entity.getQuantity(), entity.getPrice());
    }

    private Address toAddress(UserAddressEntity entity) {
        return new Address(entity.getId(), entity.getReceiver(), entity.getPhone(), entity.getDetail(), Boolean.TRUE.equals(entity.getIsDefault()));
    }

    private Coupon toCoupon(CouponEntity entity) {
        String status = "enabled".equals(entity.getStatus()) ? "可使用" : entity.getStatus();
        return new Coupon(entity.getId(), entity.getName(), entity.getThresholdAmount(), entity.getDiscountAmount(), status);
    }

    private Review toReview(ReviewEntity entity) {
        return new Review(entity.getId(), entity.getOrderId(), entity.getRating(), entity.getContent(), entity.getReply());
    }

    private String nextOrderId() {
        int suffix = RANDOM.nextInt(10000);
        return "CY" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS")) + String.format("%04d", suffix);
    }
}

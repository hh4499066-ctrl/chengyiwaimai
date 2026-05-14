package com.chengyiwaimai.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.chengyiwaimai.common.BizException;
import com.chengyiwaimai.entity.DeliveryOrderEntity;
import com.chengyiwaimai.entity.MarketingActivityEntity;
import com.chengyiwaimai.entity.MerchantEntity;
import com.chengyiwaimai.entity.SysUserEntity;
import com.chengyiwaimai.entity.WithdrawRecordEntity;
import com.chengyiwaimai.mapper.CartItemMapper;
import com.chengyiwaimai.mapper.CategoryMapper;
import com.chengyiwaimai.mapper.CouponMapper;
import com.chengyiwaimai.mapper.DeliveryOrderMapper;
import com.chengyiwaimai.mapper.DishMapper;
import com.chengyiwaimai.mapper.MarketingActivityMapper;
import com.chengyiwaimai.mapper.MerchantMapper;
import com.chengyiwaimai.mapper.OrderItemMapper;
import com.chengyiwaimai.mapper.ReviewMapper;
import com.chengyiwaimai.mapper.SysUserMapper;
import com.chengyiwaimai.mapper.UserAddressMapper;
import com.chengyiwaimai.mapper.WithdrawRecordMapper;
import com.chengyiwaimai.security.CurrentUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BusinessServiceTest {
    @Mock
    MerchantMapper merchantMapper;
    @Mock
    DishMapper dishMapper;
    @Mock
    DeliveryOrderMapper deliveryOrderMapper;
    @Mock
    OrderItemMapper orderItemMapper;
    @Mock
    CartItemMapper cartItemMapper;
    @Mock
    CategoryMapper categoryMapper;
    @Mock
    UserAddressMapper userAddressMapper;
    @Mock
    CouponMapper couponMapper;
    @Mock
    ReviewMapper reviewMapper;
    @Mock
    SysUserMapper sysUserMapper;
    @Mock
    MarketingActivityMapper marketingActivityMapper;
    @Mock
    WithdrawRecordMapper withdrawRecordMapper;
    @Mock
    StringRedisTemplate stringRedisTemplate;

    BusinessService service;
    CurrentUser merchantUser = new CurrentUser(3L, "13800000003", "merchant");

    @BeforeEach
    void setUp() {
        service = new BusinessService(
                merchantMapper,
                dishMapper,
                deliveryOrderMapper,
                orderItemMapper,
                cartItemMapper,
                categoryMapper,
                userAddressMapper,
                couponMapper,
                reviewMapper,
                sysUserMapper,
                marketingActivityMapper,
                withdrawRecordMapper,
                stringRedisTemplate
        );
    }

    @Test
    void merchantWithdrawRejectsNullZeroAndNegativeAmount() {
        stubMerchant();

        assertThatThrownBy(() -> service.merchantWithdraw(merchantUser, null, "6222000011118888"))
                .isInstanceOf(BizException.class)
                .hasMessageContaining("提现金额必须大于 0");
        assertThatThrownBy(() -> service.merchantWithdraw(merchantUser, BigDecimal.ZERO, "6222000011118888"))
                .isInstanceOf(BizException.class)
                .hasMessageContaining("提现金额必须大于 0");
        assertThatThrownBy(() -> service.merchantWithdraw(merchantUser, new BigDecimal("-1.00"), "6222000011118888"))
                .isInstanceOf(BizException.class)
                .hasMessageContaining("提现金额必须大于 0");

        verify(withdrawRecordMapper, never()).insert(any(WithdrawRecordEntity.class));
    }

    @Test
    void merchantWithdrawRejectsAmountGreaterThanAvailableBalance() {
        stubMerchant();
        stubMerchantBalance("100.00", "0.00");

        assertThatThrownBy(() -> service.merchantWithdraw(merchantUser, new BigDecimal("95.00"), "6222000011118888"))
                .isInstanceOf(BizException.class)
                .hasMessageContaining("提现金额超过可提现余额");
    }

    @Test
    void unpaidAndCanceledOrdersDoNotCreateWithdrawableBalance() {
        stubMerchant();
        stubMerchantBalance("0.00", "0.00");

        assertThatThrownBy(() -> service.merchantWithdraw(merchantUser, new BigDecimal("0.01"), "6222000011118888"))
                .isInstanceOf(BizException.class)
                .hasMessageContaining("提现金额超过可提现余额");
    }

    @Test
    void effectiveOrdersCreateWithdrawableBalanceAfterServiceFee() {
        stubMerchant();
        stubMerchantBalance("100.00", "0.00");
        doAnswer(invocation -> {
            WithdrawRecordEntity record = invocation.getArgument(0);
            record.setId(100L);
            return 1;
        }).when(withdrawRecordMapper).insert(any(WithdrawRecordEntity.class));

        Map<String, Object> result = service.merchantWithdraw(merchantUser, new BigDecimal("94.00"), " 6222000011118888 ");

        ArgumentCaptor<WithdrawRecordEntity> captor = ArgumentCaptor.forClass(WithdrawRecordEntity.class);
        verify(withdrawRecordMapper).insert(captor.capture());
        WithdrawRecordEntity record = captor.getValue();
        assertThat(record.getOwnerType()).isEqualTo("merchant");
        assertThat(record.getOwnerId()).isEqualTo(10L);
        assertThat(record.getRiderId()).isEqualTo(3L);
        assertThat(record.getAccountNo()).isEqualTo("6222000011118888");
        assertThat(result.get("accountNo")).isEqualTo("6222 **** **** 8888");
        assertThat(result.get("accountNoMasked")).isEqualTo("6222 **** **** 8888");
    }

    @Test
    void submittedProcessingAndCompletedWithdrawsOccupyMerchantBalance() {
        stubMerchant();
        stubMerchantBalance("100.00", "50.00");

        assertThatThrownBy(() -> service.merchantWithdraw(merchantUser, new BigDecimal("45.00"), "6222000011118888"))
                .isInstanceOf(BizException.class)
                .hasMessageContaining("提现金额超过可提现余额");
    }

    @Test
    void riderWithdrawRecordQueryStillReturnsRiderHistoryOnlyAndMasksAccount() {
        WithdrawRecordEntity riderRecord = new WithdrawRecordEntity();
        riderRecord.setId(1L);
        riderRecord.setRiderId(2L);
        riderRecord.setOwnerType(null);
        riderRecord.setOwnerId(null);
        riderRecord.setAmount(new BigDecimal("12.00"));
        riderRecord.setAccountNo("12345678");
        riderRecord.setStatus("submitted");
        when(withdrawRecordMapper.selectList(any())).thenReturn(List.of(riderRecord));

        List<Map<String, Object>> records = service.withdrawRecords(new CurrentUser(2L, "13800000002", "rider"));

        assertThat(records).hasSize(1);
        assertThat(records.get(0).get("ownerType")).isEqualTo("rider");
        assertThat(records.get(0).get("accountNo")).isEqualTo("****78");
        assertThat(records.get(0).get("accountNoMasked")).isEqualTo("****78");
    }

    @Test
    void marketingCanBeRecreatedAfterLogicalDeleteRenamesDeletedRow() {
        MarketingActivityEntity existing = new MarketingActivityEntity();
        existing.setId(7L);
        existing.setMerchantId(0L);
        existing.setName("满减活动");
        when(marketingActivityMapper.selectById(7L)).thenReturn(existing);
        when(marketingActivityMapper.update(any(), any())).thenReturn(1);
        when(marketingActivityMapper.selectCount(any())).thenReturn(0L);
        doAnswer(invocation -> {
            MarketingActivityEntity activity = invocation.getArgument(0);
            activity.setId(8L);
            return 1;
        }).when(marketingActivityMapper).insert(any(MarketingActivityEntity.class));

        service.deleteAdminMarketing(7L);
        Map<String, Object> created = service.createAdminMarketing(Map.of("name", "满减活动", "type", "discount"));

        ArgumentCaptor<MarketingActivityEntity> updateCaptor = ArgumentCaptor.forClass(MarketingActivityEntity.class);
        verify(marketingActivityMapper).update(updateCaptor.capture(), any());
        assertThat(updateCaptor.getValue().getName()).isEqualTo("满减活动__deleted_7");
        assertThat(updateCaptor.getValue().getDeleted()).isEqualTo(1);
        assertThat(created.get("name")).isEqualTo("满减活动");
    }

    @Test
    void duplicateActiveMarketingNameFailsWithBusinessError() {
        stubMerchant();
        when(marketingActivityMapper.selectCount(any())).thenReturn(1L);

        assertThatThrownBy(() -> service.saveMerchantMarketing(merchantUser, Map.of("name", "新客券", "type", "coupon")))
                .isInstanceOf(BizException.class)
                .hasMessageContaining("同名营销活动已存在");
    }

    @Test
    void duplicateKeyOnMarketingCreateIsConvertedToBusinessError() {
        stubMerchant();
        when(marketingActivityMapper.selectCount(any())).thenReturn(0L);
        when(marketingActivityMapper.insert(any(MarketingActivityEntity.class))).thenThrow(new DuplicateKeyException("uk"));

        assertThatThrownBy(() -> service.saveMerchantMarketing(merchantUser, Map.of("name", "新客券", "type", "coupon")))
                .isInstanceOf(BizException.class)
                .hasMessageContaining("同名营销活动已存在");
    }

    @Test
    void dashboardUsesDatabaseAggregatesForGmvOrdersExceptionsAndRankings() {
        when(deliveryOrderMapper.selectDashboardSummary(any(), any(), any(), any())).thenReturn(Map.of(
                "todayGmv", new BigDecimal("30.00"),
                "todayOrders", 2L,
                "totalGmv", new BigDecimal("120.00"),
                "totalOrders", 5L,
                "todayExceptionOrders", 1L,
                "totalExceptionOrders", 2L
        ));
        LocalDate today = LocalDate.now();
        when(deliveryOrderMapper.selectDashboardDailyTrend(any(), any(), any(), any())).thenReturn(List.of(
                Map.of("date", today.toString(), "gmv", new BigDecimal("30.00"), "orders", 2L, "exceptionOrders", 1L)
        ));
        when(deliveryOrderMapper.selectMerchantGmvTop5(any(), any())).thenReturn(List.of(Map.of("merchantId", 10L, "name", "川香小厨", "orders", 2L, "gmv", new BigDecimal("30.00"))));
        when(deliveryOrderMapper.selectRiderCompletedTop5(any())).thenReturn(List.of(Map.of("riderId", 2L, "name", "骑手A", "completedOrders", 3L, "income", new BigDecimal("13.50"))));
        when(sysUserMapper.selectCount(any())).thenReturn(9L);

        Map<String, Object> dashboard = service.adminDashboard();

        assertThat(dashboard.get("todayGmv")).isEqualTo(new BigDecimal("30.00"));
        assertThat(dashboard.get("todayOrders")).isEqualTo(2L);
        assertThat(dashboard.get("totalExceptionOrders")).isEqualTo(2L);
        assertThat((List<?>) dashboard.get("dailyTrend")).hasSize(30);
        assertThat((List<?>) dashboard.get("merchantRanking")).hasSize(1);
        assertThat((List<?>) dashboard.get("riderRanking")).hasSize(1);
        verify(deliveryOrderMapper, never()).selectList(any(Wrapper.class));
    }

    @Test
    void merchantStatsUsesSameEffectiveOrderScopeForIncomeAndOrderCounts() {
        stubMerchant();
        when(deliveryOrderMapper.sumMerchantEffectiveIncome(any(), any(), any())).thenReturn(new BigDecimal("80.00"));
        when(deliveryOrderMapper.countMerchantEffectiveOrders(any(), any(), any())).thenReturn(2L);
        when(deliveryOrderMapper.sumMerchantEffectiveIncomeBetween(any(), any(), any(), any(), any())).thenReturn(new BigDecimal("30.00"));
        when(deliveryOrderMapper.countMerchantEffectiveOrdersBetween(any(), any(), any(), any(), any())).thenReturn(1L);
        when(deliveryOrderMapper.countMerchantCanceledOrders(any(), any())).thenReturn(3L);
        when(withdrawRecordMapper.sumMerchantPendingWithdrawAmount(any())).thenReturn(new BigDecimal("10.00"));
        when(withdrawRecordMapper.sumMerchantWithdrawnAmount(any())).thenReturn(new BigDecimal("20.00"));

        Map<String, Object> stats = service.merchantStats(merchantUser);

        assertThat(stats.get("grossIncome")).isEqualTo(new BigDecimal("80.00"));
        assertThat(stats.get("totalOrders")).isEqualTo(2L);
        assertThat(stats.get("todayIncome")).isEqualTo(new BigDecimal("30.00"));
        assertThat(stats.get("todayOrders")).isEqualTo(1L);
        assertThat(stats.get("canceledOrders")).isEqualTo(3L);
        assertThat(stats.get("availableBalance")).isEqualTo(new BigDecimal("45.20"));
    }

    @Test
    void merchantWithdrawRecordsNeverExposeFullAccountNumber() {
        stubMerchant();
        WithdrawRecordEntity record = new WithdrawRecordEntity();
        record.setId(11L);
        record.setOwnerType("merchant");
        record.setOwnerId(10L);
        record.setRiderId(3L);
        record.setAmount(new BigDecimal("50.00"));
        record.setAccountNo("6222000011118888");
        record.setStatus("submitted");
        when(withdrawRecordMapper.selectList(any())).thenReturn(List.of(record));

        List<Map<String, Object>> records = service.merchantWithdrawRecords(merchantUser);

        assertThat(records.get(0).get("accountNo")).isEqualTo("6222 **** **** 8888");
        assertThat(records.get(0).get("accountNoMasked")).isEqualTo("6222 **** **** 8888");
        assertThat(records.get(0).values()).doesNotContain("6222000011118888");
    }

    private void stubMerchant() {
        MerchantEntity merchant = new MerchantEntity();
        merchant.setId(10L);
        merchant.setUserId(3L);
        merchant.setName("川香小厨");
        when(merchantMapper.selectOne(any())).thenReturn(merchant);
    }

    private void stubMerchantBalance(String grossIncome, String occupiedWithdrawAmount) {
        when(deliveryOrderMapper.sumMerchantEffectiveIncome(any(), any(), any())).thenReturn(new BigDecimal(grossIncome));
        when(withdrawRecordMapper.sumMerchantOccupiedWithdrawAmount(any())).thenReturn(new BigDecimal(occupiedWithdrawAmount));
    }
}

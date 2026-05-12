package com.chengyiwaimai.task;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class OrderTimeoutTask {
    @Scheduled(fixedDelay = 60000)
    public void scanTimeoutOrders() {
        // 演示项目中保留定时任务入口，后续可扫描超时未接单、超时配送订单。
    }
}

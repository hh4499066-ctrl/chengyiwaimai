package com.chengyiwaimai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class ChengyiWaimaiApplication {
    public static void main(String[] args) {
        SpringApplication.run(ChengyiWaimaiApplication.class, args);
    }
}
